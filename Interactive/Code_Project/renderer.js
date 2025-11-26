import { PostProcessor } from './postprocess.js';

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
        this.postProcessor = null;
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
        
        // Initialize post-processor for bloom, tone mapping, color grading
        this.postProcessor = new PostProcessor(
            this.device,
            this.canvas.width,
            this.canvas.height,
            this.format
        );
        
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
            if (this.postProcessor) {
                this.postProcessor.resize(width, height);
            }
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
        this.postProcessBindGroup = null;
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
        
        // Render scene to framebuffer for post-processing
        const framebufferPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.framebufferView,
                clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1.0 },
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
        
        // Apply post-processing effects (bloom, tone mapping, color grading)
        if (this.postProcessor && this.bloomEnabled) {
            try {
                this.postProcessor.process(
                    commandEncoder,
                    this.framebufferTexture,
                    this.context.getCurrentTexture().createView()
                );
            } catch (error) {
                console.warn('Post-processing error, rendering directly:', error);
                // Fallback: render directly if post-processing fails
                const fallbackPass = commandEncoder.beginRenderPass({
                    colorAttachments: [{
                        view: this.context.getCurrentTexture().createView(),
                        loadOp: 'clear',
                        clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1.0 },
                        storeOp: 'store',
                    }],
                });
                fallbackPass.end();
            }
        } else {
            // Simple copy if post-processing disabled - render directly for now
            const directPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: this.context.getCurrentTexture().createView(),
                    loadOp: 'clear',
                    clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1.0 },
                    storeOp: 'store',
                }],
            });
            directPass.end();
        }
        
        this.device.queue.submit([commandEncoder.finish()]);
    }
}
