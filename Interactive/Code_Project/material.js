export class Material {
    constructor(device, options = {}) {
        this.baseColor = options.baseColor || [1, 1, 1, 1];
        this.metallic = options.metallic !== undefined ? options.metallic : 0.0;
        this.roughness = options.roughness !== undefined ? options.roughness : 0.5;
        this.emissive = options.emissive || [0, 0, 0];
        this.shaderType = options.shaderType || 'pbr'; // 'pbr', 'toon', 'emissive'
        
        // Textures (optional, for future use)
        this.baseColorTexture = options.baseColorTexture || null;
        this.normalTexture = options.normalTexture || null;
        this.metallicRoughnessTexture = options.metallicRoughnessTexture || null;
    }
}
