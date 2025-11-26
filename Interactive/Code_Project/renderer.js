export class WebGPURenderer {
    constructor(canvas) {
        this.canvas = canvas;
        this.device = null;
        this.context = null;
        this.format = null;
        this.depthTexture = null;
        this.bloomEnabled = true;
        
        // Framebuffer for post-processing
        this.framebuffer = null;
        this.framebufferTexture = null;
        this.framebufferView = null;
    }
    
    async init() {
        // Check WebGPU support
        if (!navigator.gpu) {
            throw new Error('WebGPU is not supported. Please use Chrome/Edge 113+ or enable WebGPU flag.');
        }
        
        // Request adapter and device
        const adapter = await navigator.gpu.requestAdapter();
        if (!adapter) {
            throw new Error('Failed to get WebGPU adapter');
        }
        
        this.device = await adapter.requestDevice();
        this.context = this.canvas.getContext('webgpu');
        
        if (!this.context) {
            throw new Error('Failed to get WebGPU context');
        }
        
        // Get preferred format
        this.format = navigator.gpu.getPreferredCanvasFormat();
        
        // Configure canvas
        this.resize();
        window.addEventListener('resize', () => this.resize());
        
        // Create depth texture
        this.createDepthTexture();
        
        // Create framebuffer for post-processing
        this.createFramebuffer();
        
        console.log('WebGPU renderer initialized');
    }
    
    resize() {
        const dpr = window.devicePixelRatio || 1;
        const width = this.canvas.clientWidth * dpr;
        const height = this.canvas.clientHeight * dpr;
        
        if (this.canvas.width !== width || this.canvas.height !== height) {
            this.canvas.width = width;
            this.canvas.height = height;
            this.createDepthTexture();
            this.createFramebuffer();
        }
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
        // Configure canvas
        this.context.configure({
            device: this.device,
            format: this.format,
            usage: GPUTextureUsage.RENDER_ATTACHMENT,
            alphaMode: 'premultiplied',
        });
        
        const commandEncoder = this.device.createCommandEncoder();
        
        // Render to framebuffer first (for post-processing)
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
        
        // Render scene
        scene.render(framebufferPass, camera, this.device);
        framebufferPass.end();
        
        // Apply post-processing (bloom, tone mapping) and render to canvas
        const finalPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.context.getCurrentTexture().createView(),
                clearValue: { r: 0.05, g: 0.05, b: 0.1, a: 1.0 },
                loadOp: 'clear',
                storeOp: 'store',
            }],
        });
        
        // Apply framebuffer effects
        if (this.bloomEnabled) {
            scene.renderPostProcess(finalPass, this.framebufferView, this.device);
        } else {
            // Simple copy if bloom disabled
            scene.renderPostProcess(finalPass, this.framebufferView, this.device, false);
        }
        
        finalPass.end();
        
        this.device.queue.submit([commandEncoder.finish()]);
    }
}
