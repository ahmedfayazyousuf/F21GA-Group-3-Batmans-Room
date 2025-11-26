// Multiple shader types for different materials and effects

export const ShaderTypes = {
    PBR: 'pbr',
    TOON: 'toon',
    WIREFRAME: 'wireframe',
    EMISSIVE: 'emissive',
};

export function getPBRShader() {
    return `
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
            var totalLight: vec3<f32> = vec3<f32>(0.1, 0.1, 0.1);
            
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
            
            let albedo = material.baseColor.rgb;
            let metallic = material.metallic;
            let roughness = material.roughness;
            
            let color = albedo * lighting;
            return vec4<f32>(color, material.baseColor.a);
        }
    `;
}

export function getToonShader() {
    return `
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
        
        @fragment
        fn fs(in: VertexOutput) -> @location(0) vec4<f32> {
            let lightDir = normalize(vec3<f32>(1.0, 1.0, 1.0));
            let NdotL = dot(in.normal, lightDir);
            
            let toonSteps = 4.0;
            let toonFactor = floor(NdotL * toonSteps) / toonSteps;
            toonFactor = max(toonFactor, 0.3);
            
            let color = material.baseColor.rgb * toonFactor;
            return vec4<f32>(color, material.baseColor.a);
        }
    `;
}

export function getEmissiveShader() {
    return `
        struct Uniforms {
            viewProjection: mat4x4<f32>,
            model: mat4x4<f32>,
            cameraPos: vec3<f32>,
            lightCount: u32,
        };
        
        struct Material {
            baseColor: vec4<f32>,
            metallic: f32,
            roughness: f32,
            _padding: f32,
        };
        
        @group(0) @binding(0) var<uniform> uniforms: Uniforms;
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
        
        @fragment
        fn fs(in: VertexOutput) -> @location(0) vec4<f32> {
            let color = material.baseColor.rgb * 2.0;
            return vec4<f32>(color, material.baseColor.a);
        }
    `;
}

