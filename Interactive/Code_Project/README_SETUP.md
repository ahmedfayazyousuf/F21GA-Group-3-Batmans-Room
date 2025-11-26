# Setup Instructions

## Prerequisites

1. **Chrome/Edge Browser** (version 113+) with WebGPU enabled
   - Chrome: WebGPU is enabled by default in Chrome 113+
   - Edge: WebGPU is enabled by default in Edge 113+
   - If WebGPU is not working, enable it at `chrome://flags/#enable-unsafe-webgpu`

2. **Python 3** (for local server) or any HTTP server

## Running the Application

### Option 1: Python HTTP Server (Recommended)

```bash
cd Interactive/Code_Project
python -m http.server 8000
```

Then open: `http://localhost:8000`

### Option 2: Node.js HTTP Server

```bash
cd Interactive/Code_Project
npx http-server -p 8000
```

### Option 3: VS Code Live Server

1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

## Loading Your Blender Models

1. **Export from Blender:**
   - Select your objects
   - File → Export → Wavefront (.obj)
   - Make sure to check:
     - ✓ Include Normals
     - ✓ Include UVs
     - ✓ Apply Modifiers
   - Export each major object separately (bed, desk, batman, etc.)

2. **Place models in `assets/models/` folder:**
   ```
   Code_Project/
     assets/
       models/
         bed.obj
         desk.obj
         batman.obj
         ...
   ```

3. **Update `scene.js` to load your models:**
   ```javascript
   async loadScene() {
       const loader = new ModelLoader();
       
       // Load bed
       const bedData = await loader.loadOBJ('assets/models/bed.obj');
       const bed = new Mesh(bedData.vertices, bedData.indices);
       bed.transform = mat4.translate(mat4.identity(), [0, 0, 0]);
       bed.material = new Material(renderer.device, {
           baseColor: [0.2, 0.2, 0.3, 1.0],
           metallic: 0.1,
           roughness: 0.8,
       });
       this.meshes.push(bed);
       
       // Load other models...
   }
   ```

## Controls

- **WASD** - Move camera
- **Mouse** - Look around (click to lock mouse)
- **Q/E** - Move up/down
- **L** - Toggle lights
- **B** - Toggle bloom effect
- **R** - Reset camera
- **ESC** - Release mouse

## Troubleshooting

**WebGPU not supported:**
- Update your browser to Chrome/Edge 113+
- Enable WebGPU flag: `chrome://flags/#enable-unsafe-webgpu`

**Models not loading:**
- Check browser console for errors
- Ensure models are in correct path
- Verify OBJ file format is correct

**Performance issues:**
- Reduce model complexity
- Lower resolution
- Disable bloom effect (press B)
