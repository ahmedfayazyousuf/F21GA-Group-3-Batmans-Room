export class WebGPURenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.format = null;
        this.depthTexture = null;
        this.bloomEnabled = true;
        
        this.framebuffer = null;
        this.framebufferTexture = null;
        this.framebufferView = null;
    }
    
    async init() {
        if (!navigator.gpu) {
            throw new Error('WebGPU is not supported. Please use Chrome/Edge 113+ or enable WebGPU flag.');
        }
        
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('Failed to get WebGPU adapter');
        }
        
        this.device = await adapter.requestDevice();
        this.context = this.canvas.getContext('webgpu');
        
        if (!this.context) {
            throw new Error('Failed to get WebGPU context');
        }
        
        this.format = navigator.gpu.getPreferredCanvasFormat();
        
        this.resize();
        window.addEventListener('resize', () => {
            this.resize();
            if (this.resizeCallback) {
                this.resizeCallback(this.canvas.width, this.canvas.height);
            }
        });
        
        this.createDepthTexture();
        this.createFramebuffer();
        
        console.log('WebGPU renderer initialized');
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const width = Math.max(1, this.canvas.clientWidth * dpr);
        const height = Math.max(1, this.canvas.clientHeight * dpr);
        
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.createDepthTexture();
            this.createFramebuffer();
        }
    }
    
    onResize(callback) {
        this.resizeCallback = callback;
    }
    
    createDepthTexture() {
        if (this.depthTexture) {
            this.depthTexture.destroy();
        }
        
        this.depthTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: 'depth24plus',
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
        });
    }
    
    createFramebuffer() {
        if (this.framebufferTexture) {
            this.framebufferTexture.destroy();
        }
        
        this.framebufferTexture = this.device.createTexture({
            size: [this.canvas.width, this.canvas.height],
            format: this.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
        });
        
        this.framebufferView = this.framebufferTexture.createView();
    }
    
    toggleBloom() {
        this.bloomEnabled = !this.bloomEnabled;
        console.log('Bloom:', this.bloomEnabled ? 'ON' : 'OFF');
    }
    
    render(scene, camera) {
        this.context.configure({
            device: this.device,
            format: this.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            alphaMode: 'premultiplied',
        });
        
        const commandEncoder = this.device.createCommandEncoder();
        
        const framebufferPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.framebufferView,
                clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
            depthStencilAttachment: {
                view: this.depthTexture.createView(),
                depthClearValue: 1.0,
                depthLoadOp: 'clear',
                depthStoreOp: 'store',
            },
        });
        
        scene.render(framebufferPass, camera, this.device);
        framebufferPass.end();
        
        const finalPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        });
        
        try {
            scene.renderPostProcess(finalPass, this.framebufferView, this.device);
        } catch (error) {
            console.error('Post-process error:', error);
            console.error('Falling back to direct render');
        }
        
        finalPass.end();
        
        this.device.queue.submit([commandEncoder.finish()]);
    }
}
