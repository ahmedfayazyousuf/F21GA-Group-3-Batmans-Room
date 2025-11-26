import { mat4, vec3 } from './math.js';
import { getPBRShader, getToonShader, getEmissiveShader } from './shaders.js';

export class Mesh {
    constructor(vertices, indices) {
        this.vertices = vertices;
        this.indices = indices;
        this.transform = mat4.identity();
        this.material = null;
        
        this.vertexBuffer = null;
        this.indexBuffer = null;
        this.pipelines = {}; // Cache pipelines per shader type
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
    }
    
    getPipeline(device, shaderType = 'pbr') {
        // Cache pipelines per shader type for performance
        if (!this.pipelines[shaderType]) {
            this.pipelines[shaderType] = this.createPipeline(device, shaderType);
        }
        return this.pipelines[shaderType];
    }
    
    createPipeline(device, shaderType = 'pbr') {
        // Get shader code based on type - multiple shaders for different effects
        let shaderCode = '';
        switch (shaderType) {
            case 'toon':
                shaderCode = getToonShader();
                break;
            case 'emissive':
                shaderCode = getEmissiveShader();
                break;
            case 'pbr':
            default:
                shaderCode = getPBRShader();
                break;
        }
        
        const shaderModule = device.createShaderModule({
            label: `Mesh shader (${shaderType})`,
            code: shaderCode,
        });
        
        const pipeline = device.createRenderPipeline({
            label: `Mesh pipeline (${shaderType})`,
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
        
        return pipeline;
    }
    
    render(pass, camera, lights, lightsEnabled, device) {
        if (!this.material) {
            console.warn('Mesh has no material');
            return;
        }
        
        if (!this.vertexBuffer) {
            this.init(device);
        }
        
        // Get shader type from material, default to PBR
        const shaderType = this.material.shaderType || 'pbr';
        const pipeline = this.getPipeline(device, shaderType);
        
        const view = camera.getViewMatrix();
        const proj = camera.getProjectionMatrix();
        const viewProjection = mat4.multiply(proj, view);
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
        
        // Light buffer - only needed for PBR shader
        let lightBuffer = null;
        let bindGroupEntries = [
            { binding: 0, resource: { buffer: uniformBuffer } },
        ];
        
        if (shaderType === 'pbr') {
            const lightStructSize = 96;
            lightBuffer = device.createBuffer({
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
            bindGroupEntries.push({ binding: 1, resource: { buffer: lightBuffer } });
        }
        
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
        
        bindGroupEntries.push({ binding: 2, resource: { buffer: materialBuffer } });
        
        const bindGroup = device.createBindGroup({
            layout: pipeline.getBindGroupLayout(0),
            entries: bindGroupEntries,
        });
        
        pass.setPipeline(pipeline);
        pass.setBindGroup(0, bindGroup);
        pass.setVertexBuffer(0, this.vertexBuffer);
        pass.setIndexBuffer(this.indexBuffer, 'uint16');
        pass.drawIndexed(this.indices.length);
    }
}
