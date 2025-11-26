import { mat4 } from './math.js';

export class Mesh {
    constructor(vertices, indices) {
        this.vertices = vertices;
        this.indices = indices;
        this.transform = mat4.identity();
        this.material = null;
        
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.pipeline = null;
        this.bindGroup = null;
    }
    
    init(device) {
        this.vertexBuffer = device.createBuffer({
            label: 'Vertex buffer',
            size: this.vertices.byteLength,
            usage: GPUBufferUsage.VERTEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(this.vertexBuffer, 0, this.vertices);
        
        this.indexBuffer = device.createBuffer({
            label: 'Index buffer',
            size: this.indices.byteLength,
            usage: GPUBufferUsage.INDEX | GPUBufferUsage.COPY_DST,
        });
        device.queue.writeBuffer(this.indexBuffer, 0, this.indices);
        
        this.createPipeline(device);
    }
    
    createPipeline(device) {
        const shaderModule = device.createShaderModule({
            label: 'Mesh shader',
            code: `
                struct Uniforms {
                    viewProjection: mat4x4<f32>,
                    model: mat4x4<f32>,
                    cameraPos: vec3<f32>,
                    lightCount: u32,
                };
                
                struct Light {
                    lightType: u32,
                    _padding1: u32,
                    _padding2: u32,
                    _padding3: u32,
                    position: vec3<f32>,
                    _padding4: f32,
                    direction: vec3<f32>,
                    _padding5: f32,
                    color: vec3<f32>,
                    _padding6: f32,
                    intensity: f32,
                    _padding7: f32,
                    _padding8: f32,
                    _padding9: f32,
                    range: f32,
                    _padding10: f32,
                    _padding11: f32,
                    _padding12: f32,
                };
                
                struct Material {
                    baseColor: vec4<f32>,
                    metallic: f32,
                    roughness: f32,
                    _padding: f32,
                };
                
                @group(0) @binding(0) var<uniform> uniforms: Uniforms;
                @group(0) @binding(1) var<uniform> lights: array<Light, 8>;
                @group(0) @binding(2) var<uniform> material: Material;
                
                struct VertexInput {
                    @location(0) position: vec3<f32>,
                    @location(1) normal: vec3<f32>,
                    @location(2) uv: vec2<f32>,
                };
                
                struct VertexOutput {
                    @builtin(position) position: vec4<f32>,
                    @location(0) worldPos: vec3<f32>,
                    @location(1) normal: vec3<f32>,
                    @location(2) uv: vec2<f32>,
                };
                
                @vertex
                fn vs(input: VertexInput) -> VertexOutput {
                    var out: VertexOutput;
                    let worldPos = (uniforms.model * vec4<f32>(input.position, 1.0)).xyz;
                    out.position = uniforms.viewProjection * vec4<f32>(worldPos, 1.0);
                    out.worldPos = worldPos;
                    out.normal = normalize((uniforms.model * vec4<f32>(input.normal, 0.0)).xyz);
                    out.uv = input.uv;
                    return out;
                }
                
                fn calculateLighting(worldPos: vec3<f32>, normal: vec3<f32>, viewDir: vec3<f32>) -> vec3<f32> {
                    var totalLight: vec3<f32> = vec3<f32>(0.1, 0.1, 0.15); // Ambient
                    
                    for (var i: u32 = 0; i < uniforms.lightCount; i++) {
                        let light = lights[i];
                        var lightDir: vec3<f32>;
                        var attenuation: f32 = 1.0;
                        
                        if (light.lightType == 0u) {
                            lightDir = normalize(-light.direction);
                        } else {
                            let toLight = light.position - worldPos;
                            let dist = length(toLight);
                            lightDir = normalize(toLight);
                            attenuation = 1.0 / (1.0 + 0.09 * dist + 0.032 * dist * dist);
                            attenuation = select(0.0, attenuation, dist < light.range);
                        }
                        
                        let NdotL = max(dot(normal, lightDir), 0.0);
                        let diffuse = light.color * light.intensity * NdotL * attenuation;
                        
                        // Simple specular
                        let halfDir = normalize(lightDir + viewDir);
                        let spec = pow(max(dot(normal, halfDir), 0.0), 32.0);
                        let specular = light.color * light.intensity * spec * attenuation * 0.5;
                        
                        totalLight += diffuse + specular;
                    }
                    
                    return totalLight;
                }
                
                @fragment
                fn fs(in: VertexOutput) -> @location(0) vec4<f32> {
                    let viewDir = normalize(uniforms.cameraPos - in.worldPos);
                    let lighting = calculateLighting(in.worldPos, in.normal, viewDir);
                    
                    // PBR approximation
                    let baseColor = material.baseColor.rgb;
                    let finalColor = baseColor * lighting;
                    
                    return vec4<f32>(finalColor, material.baseColor.a);
                }
            `,
        });
        
        this.pipeline = device.createRenderPipeline({
            label: 'Mesh pipeline',
            layout: 'auto',
            vertex: {
                module: shaderModule,
                entryPoint: 'vs',
                buffers: [{
                    arrayStride: 8 * 4,
                    attributes: [
                        { shaderLocation: 0, offset: 0, format: 'float32x3' },
                        { shaderLocation: 1, offset: 12, format: 'float32x3' },
                        { shaderLocation: 2, offset: 24, format: 'float32x2' },
                    ],
                }],
            },
            fragment: {
                module: shaderModule,
                entryPoint: 'fs',
                targets: [{ format: 'bgra8unorm' }],
            },
            depthStencil: {
                depthWriteEnabled: true,
                depthCompare: 'less',
                format: 'depth24plus',
            },
            primitive: {
                topology: 'triangle-list',
                cullMode: 'back',
            },
        });
    }
    
    render(pass, camera, lights, lightsEnabled, device) {
        if (!this.material) {
            console.warn('Mesh has no material');
            return;
        }
        
        if (!this.vertexBuffer) {
            this.init(device);
        }
        
        if (!this.pipeline) {
            this.createPipeline(device);
        }
        
        const viewProjection = camera.getViewProjectionMatrix();
        const cameraPos = camera.position;
        
        const uniformBufferSize = 16 * 4 + 16 * 4 + 16 + 16;
        const uniformBuffer = device.createBuffer({
            size: uniformBufferSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        const uniformData = new Float32Array(uniformBufferSize / 4);
        uniformData.set(viewProjection, 0);
        uniformData.set(this.transform, 16);
        uniformData.set(cameraPos, 32);
        uniformData[35] = lightsEnabled ? lights.length : 0;
        
        device.queue.writeBuffer(uniformBuffer, 0, uniformData);
        
        const lightStructSize = 96;
        const lightBuffer = device.createBuffer({
            size: 8 * lightStructSize,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        const lightData = new Float32Array((8 * lightStructSize) / 4);
        for (let i = 0; i < Math.min(lights.length, 8); i++) {
            const light = lights[i];
            const structOffset = i * (lightStructSize / 4);
            
            lightData[structOffset] = light.type === 'directional' ? 0 : 1;
            
            if (light.position) {
                lightData.set(light.position, structOffset + 4);
            } else {
                lightData.set([0, 0, 0], structOffset + 4);
            }
            
            if (light.direction) {
                lightData.set(light.direction, structOffset + 8);
            } else {
                lightData.set([0, -1, 0], structOffset + 8);
            }
            
            lightData.set(light.color, structOffset + 12);
            lightData[structOffset + 16] = light.intensity || 1.0;
            lightData[structOffset + 20] = light.range || 10.0;
        }
        device.queue.writeBuffer(lightBuffer, 0, lightData);
        
        const materialBuffer = device.createBuffer({
            size: 32,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
        });
        
        const materialData = new Float32Array(8);
        materialData.set(this.material.baseColor, 0);
        materialData[4] = this.material.metallic;
        materialData[5] = this.material.roughness;
        materialData[6] = 0.0;
        materialData[7] = 0.0;
        device.queue.writeBuffer(materialBuffer, 0, materialData);
        
        const bindGroup = device.createBindGroup({
            layout: this.pipeline.getBindGroupLayout(0),
            entries: [
                { binding: 0, resource: { buffer: uniformBuffer } },
                { binding: 1, resource: { buffer: lightBuffer } },
                { binding: 2, resource: { buffer: materialBuffer } },
            ],
        });
        
        pass.setPipeline(this.pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.setIndexBuffer(this.indexBuffer, 'uint16');
        pass.drawIndexed(this.indices.length);
    }
}
