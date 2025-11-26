// Model loader for OBJ and GLTF files
// This will be extended to load your Blender models

export class ModelLoader {
    constructor() {
        this.meshes = [];
    }
    
    async loadOBJ(url) {
        // Simple OBJ loader
        // Format: v x y z (vertex), vn x y z (normal), vt u v (texcoord), f v1/vt1/vn1 v2/vt2/vn2 ...
        const response = await fetch(url);
        const text = await response.text();
        const lines = text.split('\n');
        
        const vertices = [];
        const normals = [];
        const texcoords = [];
        const faces = [];
        
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed.startsWith('v ')) {
                const parts = trimmed.split(/\s+/);
                vertices.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            } else if (trimmed.startsWith('vn ')) {
                const parts = trimmed.split(/\s+/);
                normals.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2]),
                    parseFloat(parts[3])
                ]);
            } else if (trimmed.startsWith('vt ')) {
                const parts = trimmed.split(/\s+/);
                texcoords.push([
                    parseFloat(parts[1]),
                    parseFloat(parts[2])
                ]);
            } else if (trimmed.startsWith('f ')) {
                const parts = trimmed.split(/\s+/).slice(1);
                const face = parts.map(p => {
                    const indices = p.split('/');
                    return {
                        v: parseInt(indices[0]) - 1,
                        vt: indices[1] ? parseInt(indices[1]) - 1 : -1,
                        vn: indices[2] ? parseInt(indices[2]) - 1 : -1,
                    };
                });
                faces.push(face);
            }
        }
        
        // Build interleaved vertex buffer
        const vertexData = [];
        const indices = [];
        const vertexMap = new Map();
        
        let indexCounter = 0;
        
        for (const face of faces) {
            const faceIndices = [];
            for (const f of face) {
                const key = `${f.v}_${f.vt}_${f.vn}`;
                if (!vertexMap.has(key)) {
                    const v = vertices[f.v] || [0, 0, 0];
                    const n = normals[f.vn] || [0, 1, 0];
                    const t = texcoords[f.vt] || [0, 0];
                    
                    vertexData.push(
                        v[0], v[1], v[2],  // position
                        n[0], n[1], n[2],  // normal
                        t[0], t[1]         // uv
                    );
                    vertexMap.set(key, indexCounter++);
                }
                faceIndices.push(vertexMap.get(key));
            }
            
            // Triangulate (assuming quads or triangles)
            if (faceIndices.length === 3) {
                indices.push(...faceIndices);
            } else if (faceIndices.length === 4) {
                indices.push(faceIndices[0], faceIndices[1], faceIndices[2]);
                indices.push(faceIndices[0], faceIndices[2], faceIndices[3]);
            }
        }
        
        return {
            vertices: new Float32Array(vertexData),
            indices: new Uint16Array(indices),
        };
    }
    
    async loadGLTF(url) {
        // GLTF loader - more complex, supports materials, textures, etc.
        // For now, return a placeholder
        // You can use a library like gltf-transform or implement a full loader
        throw new Error('GLTF loading not yet implemented. Use OBJ format for now.');
    }
}
