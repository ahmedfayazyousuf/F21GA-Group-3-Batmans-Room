import { mat4, vec3 } from './math.js';
import { Mesh } from './mesh.js';
import { Material } from './material.js';

export class Scene {
    constructor() {
        this.meshes = [];
        this.lights = [];
        this.lightsEnabled = true;
        this.time = 0;
        
        this.postProcessPipeline = null;
        this.postProcessBindGroup = null;
    }
    
    async createDefaultScene(renderer) {
        const floor = this.createPlane(10, 10);
        const floor = this.createPlane(10, 10);
        floor.transform = mat4.translate(mat4.identity(), [0, 0, 0]);
        floor.material = new Material(renderer.device, {
            baseColor: [0.2, 0.2, 0.3, 1.0],
            metallic: 0.1,
            roughness: 0.8,
        });
        this.meshes.push(floor);
        
        const wall1 = this.createPlane(10, 5);
        wall1.transform = mat4.multiply(
            mat4.rotate(mat4.identity(), Math.PI / 2, [1, 0, 0]),
            mat4.translate(mat4.identity(), [0, 2.5, -5])
        );
        wall1.material = new Material(renderer.device, {
            baseColor: [0.15, 0.15, 0.2, 1.0],
            metallic: 0.0,
            roughness: 0.9,
        });
        this.meshes.push(wall1);
        
        const box = this.createBox(1, 1, 1);
        box.transform = mat4.translate(mat4.identity(), [0, 0.5, 0]);
        box.material = new Material(renderer.device, {
            baseColor: [0.8, 0.2, 0.2, 1.0],
            metallic: 0.5,
            roughness: 0.3,
        });
        this.meshes.push(box);
        
        this.lights = [
            {
                type: 'directional',
                direction: vec3.normalize([0.5, -1, 0.5]),
                color: [1.0, 1.0, 0.95],
                intensity: 1.0,
            },
            {
                type: 'point',
                position: [2, 3, 2],
                color: [1.0, 0.8, 0.6],
                intensity: 0.5,
                range: 10.0,
            },
        ];
        
        this.initPostProcess(renderer);
    }
    
    createPlane(width, height) {
        const w = width / 2;
        const h = height / 2;
        
        const vertices = new Float32Array([
            -w, 0, -h,  0, 1, 0,  0, 0,
             w, 0, -h,  0, 1, 0,  1, 0,
             w, 0,  h,  0, 1, 0,  1, 1,
            -w, 0,  h,  0, 1, 0,  0, 1,
        ]);
        
        const indices = new Uint16Array([
            0, 1, 2,  0, 2, 3
        ]);
        
        return new Mesh(vertices, indices);
    }
    
    createBox(width, height, depth) {
        const w = width / 2;
        const h = height / 2;
        const d = depth / 2;
        
        const vertices = new Float32Array([
            // Front face
            -w, -h,  d,  0, 0, 1,  0, 0,
             w, -h,  d,  0, 0, 1,  1, 0,
             w,  h,  d,  0, 0, 1,  1, 1,
            -w,  h,  d,  0, 0, 1,  0, 1,
            // Back face
            -w, -h, -d,  0, 0, -1,  1, 0,
            -w,  h, -d,  0, 0, -1,  1, 1,
             w,  h, -d,  0, 0, -1,  0, 1,
             w, -h, -d,  0, 0, -1,  0, 0,
            // Top face
            -w,  h, -d,  0, 1, 0,  0, 0,
            -w,  h,  d,  0, 1, 0,  0, 1,
             w,  h,  d,  0, 1, 0,  1, 1,
             w,  h, -d,  0, 1, 0,  1, 0,
            // Bottom face
            -w, -h, -d,  0, -1, 0,  1, 0,
             w, -h, -d,  0, -1, 0,  0, 0,
             w, -h,  d,  0, -1, 0,  0, 1,
            -w, -h,  d,  0, -1, 0,  1, 1,
            // Right face
             w, -h, -d,  1, 0, 0,  0, 0,
             w,  h, -d,  1, 0, 0,  0, 1,
             w,  h,  d,  1, 0, 0,  1, 1,
             w, -h,  d,  1, 0, 0,  1, 0,
            // Left face
            -w, -h, -d, -1, 0, 0,  1, 0,
            -w, -h,  d, -1, 0, 0,  0, 0,
            -w,  h,  d, -1, 0, 0,  0, 1,
            -w,  h, -d, -1, 0, 0,  1, 1,
        ]);
        
        const indices = new Uint16Array([
            0,  1,  2,   0,  2,  3,   // front
            4,  5,  6,   4,  6,  7,   // back
            8,  9,  10,  8,  10, 11,  // top
            12, 13, 14,  12, 14, 15,  // bottom
            16, 17, 18,  16, 18, 19,  // right
            20, 21, 22,  20, 22, 23,  // left
        ]);
        
        return new Mesh(vertices, indices);
    }
    
    toggleLights() {
        this.lightsEnabled = !this.lightsEnabled;
        console.log('Lights:', this.lightsEnabled ? 'ON' : 'OFF');
    }
    
    update(deltaTime) {
        this.time += deltaTime;
        
        if (this.meshes.length > 2) {
            const box = this.meshes[2];
            box.transform = mat4.multiply(
                mat4.rotate(mat4.identity(), this.time * 0.5, [0, 1, 0]),
                mat4.translate(mat4.identity(), [0, 0.5, 0])
            );
        }
        
        if (this.lights.length > 1) {
            const pulse = Math.sin(this.time * 3) * 0.4 + 0.6;
            this.lights[1].intensity = 0.5 * pulse;
            
            const hue = (this.time * 0.5) % (Math.PI * 2);
            this.lights[1].color = [
                Math.sin(hue) * 0.5 + 0.5,
                Math.sin(hue + Math.PI * 2/3) * 0.5 + 0.5,
                Math.sin(hue + Math.PI * 4/3) * 0.5 + 0.5,
            ];
        }
        
        if (this.lights.length > 0 && this.lights[0].type === 'directional') {
            const angle = this.time * 0.1;
            this.lights[0].direction = vec3.normalize([
                Math.cos(angle) * 0.5,
                -0.8 + Math.sin(angle) * 0.3,
                Math.sin(angle) * 0.5
            ]);
        }
    }
    
    render(pass, camera, device) {
        for (const mesh of this.meshes) {
            mesh.render(pass, camera, this.lights, this.lightsEnabled, device);
        }
    }
    
    initPostProcess(device) {
        const postProcessShader = device.createShaderModule({
            label: 'Post-process shader',
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
                    let mapped = color.rgb / (color.rgb + vec3<f32>(1.0));
                    let gamma = pow(mapped, vec3<f32>(1.0 / 2.2));
                    return vec4<f32>(gamma, color.a);
                }
            `,
        });
        
        this.postProcessPipeline = device.createRenderPipeline({
            label: 'Post-process pipeline',
            layout: 'auto',
            vertex: {
                module: postProcessShader,
                entryPoint: 'vs',
            },
            fragment: {
                module: postProcessShader,
                entryPoint: 'fs',
                targets: [{ format: 'bgra8unorm' }],
            },
        });
    }
    
    renderPostProcess(pass, inputTexture, device, useBloom = true) {
        if (!this.postProcessPipeline) {
            this.initPostProcess(device);
        }
        
        if (!this.postProcessBindGroup) {
            const sampler = device.createSampler({
                magFilter: 'linear',
                minFilter: 'linear',
            });
            
            this.postProcessBindGroup = device.createBindGroup({
                layout: this.postProcessPipeline.getBindGroupLayout(0),
                entries: [
                    { binding: 0, resource: inputTexture },
                    { binding: 1, resource: sampler },
                ],
            });
        }
        
        pass.setPipeline(this.postProcessPipeline);
        pass.setBindGroup(0, this.postProcessBindGroup);
        pass.draw(3, 1, 0, 0);
    }
}
