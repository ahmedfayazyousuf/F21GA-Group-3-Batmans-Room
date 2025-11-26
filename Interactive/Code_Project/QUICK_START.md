# Quick Start Guide

## Get Running in 5 Minutes

### Step 1: Start Server
```bash
cd Interactive/Code_Project
python -m http.server 8000
```

### Step 2: Open Browser
- Go to: `http://localhost:8000`
- Use Chrome/Edge 113+ (WebGPU required)

### Step 3: Test It
- Click the canvas to lock mouse
- Use **WASD** to move
- Use **mouse** to look around
- Press **L** to toggle lights
- Press **B** to toggle bloom

## Loading Your Blender Models

### Export from Blender:
1. Select your object
2. File → Export → Wavefront (.obj)
3. Check these options:
   - ✓ Include Normals
   - ✓ Include UVs  
   - ✓ Apply Modifiers
4. Save to `assets/models/your_model.obj`

### Add to Scene:

Edit `scene.js`, find `createDefaultScene()`, and add:

```javascript
// Load your model
const loader = new ModelLoader();
const bedData = await loader.loadOBJ('assets/models/bed.obj');
const bed = new Mesh(bedData.vertices, bedData.indices);

// Position it
bed.transform = mat4.translate(mat4.identity(), [0, 0, 0]);

// Give it a material
bed.material = new Material(renderer.device, {
    baseColor: [0.2, 0.2, 0.3, 1.0],  // Dark blue-gray
    metallic: 0.1,
    roughness: 0.8,
});

// Add to scene
this.meshes.push(bed);
```

## Material Colors Reference

```javascript
// Black wood (bed frame)
baseColor: [0.1, 0.1, 0.1, 1.0], metallic: 0.2, roughness: 0.7

// White plastic (monitors)
baseColor: [0.9, 0.9, 0.9, 1.0], metallic: 0.0, roughness: 0.3

// Metallic (PC case)
baseColor: [0.3, 0.3, 0.3, 1.0], metallic: 0.8, roughness: 0.2

// Emissive LED (monitor screens)
baseColor: [0.2, 0.5, 1.0, 1.0], metallic: 0.0, roughness: 0.1
```

## Troubleshooting

**"WebGPU not supported"**
- Update Chrome/Edge to version 113+
- Or enable: `chrome://flags/#enable-unsafe-webgpu`

**"Failed to fetch" (model loading)**
- Check file path is correct
- Make sure server is running
- Check browser console for exact error

**Models look wrong**
- Check normals are exported from Blender
- Verify scale (might need to scale down)
- Check coordinate system (might need to rotate)

**Performance issues**
- Disable bloom (press B)
- Reduce model complexity
- Check browser console for warnings
