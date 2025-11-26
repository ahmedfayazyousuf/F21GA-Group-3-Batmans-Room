// Enhanced post-processing effects: Bloom, Tone Mapping, Color Grading

export class PostProcessor {
    constructor(device, width, height, format) {
        this.device = device;
        this.width = width;
        this.height = height;
        this.format = format;
        
        this.bloomEnabled = true;
        this.bloomIntensity = 1.5;
        this.toneMappingExposure = 1.0;
        this.saturation = 1.0;
        
        this.bloomTextures = [];
        this.bloomSampler = null;
        this.pipelines = {};
        
        this.init();
    }
    
    init() {
        this.createBloomTextures();
        this.createSampler();
        this.createPipelines();
    }
    
    createBloomTextures() {
        let w = this.width / 2;
        let h = this.height / 2;
        
        for (let i = 0; i < 4; i++) {
            this.bloomTextures.push({
                texture: this.device.createTexture({
                    size: [Math.max(1, w), Math.max(1, h)],
                    format: this.format,
                    usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING,
                }),
                view: null,
            });
            this.bloomTextures[i].view = this.bloomTextures[i].texture.createView();
            w = Math.max(1, w / 2);
            h = Math.max(1, h / 2);
        }
    }
    
    createSampler() {
        this.bloomSampler = this.device.createSampler({
            magFilter: 'linear',
            minFilter: 'linear',
        });
    }
    
    createPipelines() {
        // Bloom extraction (bright pass)
        const extractShader = this.device.createShaderModule({
            code: `
                struct VertexOutput {
                    @builtin(position) position: vec4<f32>,
                    @location(0) uv: vec2<f32>,
                };
                
                @vertex
                fn vs(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
                    var out: VertexOutput;
                    let x = f32((vertexIndex << 1u) & 2u) * 2.0 - 1.0;
                    let y = f32(vertexIndex & 2u) * 2.0 - 1.0;
                    out.position = vec4<f32>(x, y, 0.0, 1.0);
                    out.uv = vec2<f32>(x * 0.5 + 0.5, 1.0 - (y * 0.5 + 0.5));
                    return out;
                }
                
                @group(0) @binding(0) var inputTexture: texture_2d<f32>;
                @group(0) @binding(1) var inputSampler: sampler;
                
                @fragment
                fn fs(in: VertexOutput) -> @location(0) vec4<f32> {
                    let color = textureSample(inputTexture, inputSampler, in.uv);
                    let brightness = dot(color.rgb, vec3<f32>(0.2126, 0.7152, 0.0722));
                    let bloom = select(vec3<f32>(0.0), color.rgb, brightness > 0.7);
                    return vec4<f32>(bloom, color.a);
                }
            `,
        });
        
        this.pipelines.extract = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: { module: extractShader, entryPoint: 'vs' },
            fragment: {
                module: extractShader,
                entryPoint: 'fs',
                targets: [{ format: this.format }],
            },
        });
        
        // Bloom blur (downsample)
        const blurShader = this.device.createShaderModule({
            code: `
                struct VertexOutput {
                    @builtin(position) position: vec4<f32>,
                    @location(0) uv: vec2<f32>,
                };
                
                @vertex
                fn vs(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
                    var out: VertexOutput;
                    let x = f32((vertexIndex << 1u) & 2u) * 2.0 - 1.0;
                    let y = f32(vertexIndex & 2u) * 2.0 - 1.0;
                    out.position = vec4<f32>(x, y, 0.0, 1.0);
                    out.uv = vec2<f32>(x * 0.5 + 0.5, 1.0 - (y * 0.5 + 0.5));
                    return out;
                }
                
                @group(0) @binding(0) var inputTexture: texture_2d<f32>;
                @group(0) @binding(1) var inputSampler: sampler;
                @group(0) @binding(2) var<uniform> params: vec2<f32>;
                
                @fragment
                fn fs(in: VertexOutput) -> @location(0) vec4<f32> {
                    let offset = params;
                    var color = vec3<f32>(0.0);
                    let weights = array<f32, 5>(
                        0.227027, 0.1945946, 0.1216216, 0.054054, 0.016216
                    );
                    
                    color += textureSample(inputTexture, inputSampler, in.uv).rgb * weights[0];
                    color += textureSample(inputTexture, inputSampler, in.uv + vec2<f32>(offset.x, 0.0)).rgb * weights[1];
                    color += textureSample(inputTexture, inputSampler, in.uv - vec2<f32>(offset.x, 0.0)).rgb * weights[1];
                    color += textureSample(inputTexture, inputSampler, in.uv + vec2<f32>(0.0, offset.y)).rgb * weights[1];
                    color += textureSample(inputTexture, inputSampler, in.uv - vec2<f32>(0.0, offset.y)).rgb * weights[1];
                    
                    return vec4<f32>(color, 1.0);
                }
            `,
        });
        
        this.pipelines.blur = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: { module: blurShader, entryPoint: 'vs' },
            fragment: {
                module: blurShader,
                entryPoint: 'fs',
                targets: [{ format: this.format }],
            },
        });
        
        // Final composite with tone mapping
        const compositeShader = this.device.createShaderModule({
            code: `
                struct VertexOutput {
                    @builtin(position) position: vec4<f32>,
                    @location(0) uv: vec2<f32>,
                };
                
                @vertex
                fn vs(@builtin(vertex_index) vertexIndex: u32) -> VertexOutput {
                    var out: VertexOutput;
                    let x = f32((vertexIndex << 1u) & 2u) * 2.0 - 1.0;
                    let y = f32(vertexIndex & 2u) * 2.0 - 1.0;
                    out.position = vec4<f32>(x, y, 0.0, 1.0);
                    out.uv = vec2<f32>(x * 0.5 + 0.5, 1.0 - (y * 0.5 + 0.5));
                    return out;
                }
                
                @group(0) @binding(0) var sceneTexture: texture_2d<f32>;
                @group(0) @binding(1) var bloomTexture: texture_2d<f32>;
                @group(0) @binding(2) var inputSampler: sampler;
                @group(0) @binding(3) var<uniform> params: vec4<f32>; // exposure, bloomIntensity, saturation, unused
                
                fn tonemap(color: vec3<f32>) -> vec3<f32> {
                    return color / (color + vec3<f32>(1.0));
                }
                
                @fragment
                fn fs(in: VertexOutput) -> @location(0) vec4<f32> {
                    let scene = textureSample(sceneTexture, inputSampler, in.uv).rgb;
                    let bloom = textureSample(bloomTexture, inputSampler, in.uv).rgb;
                    
                    var color = scene + bloom * params.y;
                    color *= params.x;
                    color = tonemap(color);
                    
                    let gray = dot(color, vec3<f32>(0.299, 0.587, 0.114));
                    color = mix(vec3<f32>(gray), color, params.z);
                    
                    return vec4<f32>(color, 1.0);
                }
            `,
        });
        
        this.pipelines.composite = this.device.createRenderPipeline({
            layout: 'auto',
            vertex: { module: compositeShader, entryPoint: 'vs' },
            fragment: {
                module: compositeShader,
                entryPoint: 'fs',
                targets: [{ format: this.format }],
            },
        });
    }
    
    resize(width, height) {
        this.width = width;
        this.height = height;
        this.createBloomTextures();
    }
    
    process(commandEncoder, sceneTexture, outputView) {
        if (!this.bloomEnabled) {
            // Simple copy if bloom disabled
            return;
        }
        
        // Extract bright areas
        const extractPass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: this.bloomTextures[0].view,
                loadOp: 'clear',
                clearValue: { r: 0, g: 0, b: 0, a: 1 },
                storeOp: 'store',
            }],
        });
        
        const extractBindGroup = this.device.createBindGroup({
            layout: this.pipelines.extract.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sceneTexture.createView() },
                { binding: 1, resource: this.bloomSampler },
            ],
        });
        
        extractPass.setPipeline(this.pipelines.extract);
        extractPass.setBindGroup(0, extractBindGroup);
        extractPass.draw(3);
        extractPass.end();
        
        // Blur and downsample
        for (let i = 1; i < this.bloomTextures.length; i++) {
            const blurPass = commandEncoder.beginRenderPass({
                colorAttachments: [{
                    view: this.bloomTextures[i].view,
                    loadOp: 'clear',
                    clearValue: { r: 0, g: 0, b: 0, a: 1 },
                    storeOp: 'store',
                }],
            });
            
            const offset = new Float32Array([1.0 / this.bloomTextures[i-1].texture.width, 1.0 / this.bloomTextures[i-1].texture.height]);
            const offsetBuffer = this.device.createBuffer({
                size: 8,
                usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
            });
            this.device.queue.writeBuffer(offsetBuffer, 0, offset);
            
            const blurBindGroup = this.device.createBindGroup({
                layout: this.pipelines.blur.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: this.bloomTextures[i-1].view },
                    { binding: 1, resource: this.bloomSampler },
                    { binding: 2, resource: { buffer: offsetBuffer } },
                ],
            });
            
            blurPass.setPipeline(this.pipelines.blur);
            blurPass.setBindGroup(0, blurBindGroup);
            blurPass.draw(3);
            blurPass.end();
        }
        
        // Composite
        const compositePass = commandEncoder.beginRenderPass({
            colorAttachments: [{
                view: outputView,
                loadOp: 'clear',
                clearValue: { r: 0.1, g: 0.1, b: 0.15, a: 1 },
                storeOp: 'store',
            }],
        });
        
        const params = new Float32Array([
            this.toneMappingExposure,
            this.bloomIntensity,
            this.saturation,
            0.0,
        ]);
        const paramsBuffer = this.device.createBuffer({
            size: 16,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        this.device.queue.writeBuffer(paramsBuffer, 0, params);
        
        const compositeBindGroup = this.device.createBindGroup({
            layout: this.pipelines.composite.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: sceneTexture.createView() },
                { binding: 1, resource: this.bloomTextures[this.bloomTextures.length - 1].view },
                { binding: 2, resource: this.bloomSampler },
                { binding: 3, resource: { buffer: paramsBuffer } },
            ],
        });
        
        compositePass.setPipeline(this.pipelines.composite);
        compositePass.setBindGroup(0, compositeBindGroup);
        compositePass.draw(3);
        compositePass.end();
    }
}

