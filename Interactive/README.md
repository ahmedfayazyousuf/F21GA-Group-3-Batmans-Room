# Interactive WebGPU Application

Real-time interactive WebGPU application for exploring Batman's Room diorama.

## What's Here

- `Code_Project/` - Complete WebGPU source code
- `Video.mp4` - Screen capture showing interactions (2-3 min) - *to be recorded*
- `Explanation_Video.mp4` - Walkthrough (10 min max) - *to be recorded*

## Getting Started

The application loads Blender models using OBJ format. The coordinate system is automatically handled during import, converting from Blender's Z-up to WebGPU's Y-up convention.

### Running the Application

1. Start a local HTTP server (required for WebGPU):
   ```bash
   cd Code_Project
   python -m http.server 8000
   ```

2. Open in Chrome/Edge 113+: `http://localhost:8000`

3. Click on the canvas to lock mouse and start exploring!

See `Code_Project/README_SETUP.md` for detailed setup instructions.

## Model Loading

Models are loaded from Blender using the OBJ format:

1. **Export from Blender:**
   - File → Export → Wavefront (.obj)
   - Enable: Include Normals, Include UVs, Apply Modifiers
   - Export each major object separately

2. **Place in `Code_Project/assets/models/`**

3. **Load in code:**
   ```javascript
   const loader = new ModelLoader();
   const modelData = await loader.loadOBJ('assets/models/bed.obj');
   const mesh = new Mesh(modelData.vertices, modelData.indices);
   ```

The OBJ loader handles:
- Vertex positions
- Normals (for lighting)
- UV coordinates (for textures)
- Face triangulation

## Scene Setup

The scene is built programmatically to match the Blender layout:

- **Transformation matrices** position objects correctly
- **Material system** applies PBR properties (base color, metallic, roughness)
- **Lighting setup** includes directional and point lights
- **Camera system** provides first-person exploration

Objects are positioned using `mat4.translate()`, `mat4.rotate()`, and `mat4.scale()` to match the Blender scene.

## Shaders & Materials

### Main Shader (WGSL)

The primary shader implements a PBR (Physically Based Rendering) approximation:

- **Vertex shader:** Transforms vertices, calculates world positions and normals
- **Fragment shader:** Implements lighting calculations with:
  - Diffuse lighting (Lambertian)
  - Specular highlights (Blinn-Phong approximation)
  - PBR material properties (metallic, roughness)
  - Multiple light support (directional + point lights)

### Material System

Materials are defined with:
- `baseColor`: RGBA color
- `metallic`: 0.0 (dielectric) to 1.0 (metal)
- `roughness`: 0.0 (smooth) to 1.0 (rough)
- `emissive`: Self-illumination (for LED lights)

Example:
```javascript
new Material(device, {
    baseColor: [0.8, 0.2, 0.2, 1.0],
    metallic: 0.5,
    roughness: 0.3,
})
```

### Texture Support

The system is designed to support textures (base color, normal maps, metallic-roughness maps). Texture loading can be added by extending the `Material` class and updating shaders.

## Lighting

### Light Types

1. **Directional Light** (Sun/Main light)
   - Infinite distance, parallel rays
   - Used for primary scene illumination
   - Animated to simulate day/night cycle

2. **Point Light** (LEDs, lamps)
   - Position-based with range and attenuation
   - Used for localized lighting (monitor LEDs, room lights)
   - Animated with pulsing and color-shifting effects

### Lighting Features

- **Multiple lights:** Up to 8 lights supported
- **Toggle:** Press `L` to toggle all lights on/off
- **Animated lights:**
  - Point lights pulse with sine wave
  - LED lights shift colors (RGB cycling)
  - Directional light rotates for day/night effect

### Lighting Calculation

The shader calculates:
- Ambient lighting (base illumination)
- Diffuse lighting (N·L dot product)
- Specular highlights (Blinn-Phong)
- Distance attenuation for point lights

## Post-Processing (Framebuffer Effects)

The application includes framebuffer-based post-processing:

### Bloom Effect
- Renders scene to framebuffer texture
- Applies tone mapping (Reinhard)
- Gamma correction for proper display
- Toggle with `B` key

### Implementation

1. **Render to texture:** Scene renders to framebuffer instead of directly to canvas
2. **Post-process pass:** Full-screen quad samples framebuffer texture
3. **Effects applied:**
   - Tone mapping (HDR to LDR conversion)
   - Gamma correction (sRGB)

The post-processing pipeline can be extended with:
- Bloom (brightness extraction + blur)
- Color grading
- Screen-space effects

## Interactions

### Camera Controls

- **WASD** - Move camera forward/back/left/right
- **Q/E** - Move camera up/down
- **Mouse** - Look around (click canvas to lock mouse)
- **R** - Reset camera to initial position
- **ESC** - Release mouse lock

### Scene Interactions

- **L** - Toggle all lights on/off
- **B** - Toggle bloom post-processing effect

### Implementation

Input handling uses:
- `InputHandler` class for keyboard/mouse events
- Pointer lock API for smooth mouse look
- Event-driven updates in render loop

## Animations

The scene includes several animated elements:

1. **Rotating Objects**
   - Test box rotates around Y-axis
   - Can be applied to any mesh via `transform` updates

2. **Pulsing Lights**
   - Point lights pulse with sine wave: `intensity = base * (sin(time) * 0.4 + 0.6)`
   - Creates breathing/LED effect

3. **Color-Shifting LEDs**
   - RGB values cycle through hue spectrum
   - Simulates RGB LED strips

4. **Day/Night Cycle**
   - Directional light direction rotates
   - Simulates sun movement

All animations update in the `Scene.update(deltaTime)` method, called each frame.

## Code Structure

```
Code_Project/
├── index.html          # Entry point, UI
├── main.js             # Application initialization, render loop
├── renderer.js         # WebGPU device setup, framebuffer management
├── scene.js            # Scene management, post-processing
├── camera.js           # Camera system (FPS-style)
├── mesh.js             # Mesh rendering, shader pipeline
├── material.js         # Material definitions
├── loader.js           # OBJ/GLTF model loading
├── input.js            # Keyboard/mouse input handling
└── math.js             # 3D math utilities (vec3, mat4)
```

### Key Components

- **WebGPURenderer:** Initializes WebGPU, manages framebuffers, render passes
- **Scene:** Manages meshes, lights, animations, post-processing
- **Camera:** First-person camera with view/projection matrices
- **Mesh:** Renders geometry with materials and lighting
- **ModelLoader:** Parses OBJ files into vertex/index buffers

## Technical Details

### WebGPU Setup

- **Adapter/Device:** Requests WebGPU adapter and device
- **Canvas configuration:** Sets up swap chain with preferred format
- **Depth buffer:** 24-bit depth texture for depth testing
- **Framebuffer:** Off-screen render target for post-processing

### Rendering Pipeline

1. **Update:** Scene animations, camera movement
2. **Render to framebuffer:** All meshes rendered to texture
3. **Post-process:** Apply effects (tone mapping, gamma)
4. **Present:** Render final result to canvas

### Performance Optimizations

- **Indexed rendering:** Uses index buffers to reduce vertex data
- **Uniform buffers:** Efficient data transfer to GPU
- **Depth testing:** Early Z rejection
- **Back-face culling:** Reduces overdraw

## What Worked Well

- **WebGPU API:** Modern, efficient, well-designed
- **Modular architecture:** Easy to extend and modify
- **OBJ loader:** Simple format, easy to parse
- **Shader system:** WGSL is readable and powerful
- **Post-processing:** Framebuffer approach works well

## Challenges Encountered

- **Coordinate systems:** Blender (Z-up) vs WebGPU (Y-up) conversion
- **Shader debugging:** WGSL errors can be cryptic
- **Uniform buffer layout:** Must match shader structs exactly
- **Texture loading:** Need to handle async image loading
- **Material conversion:** Blender materials → WebGPU materials

## Solutions Implemented

- **Math library:** Custom vec3/mat4 for transformations
- **Error handling:** Try-catch with user-friendly messages
- **Incremental development:** Started with simple geometry, added features
- **Testing:** Used simple test scenes before loading complex models

## Future Improvements

- **GLTF support:** Better format with materials/textures embedded
- **Texture loading:** Full texture support (base color, normal, metallic-roughness)
- **Shadow mapping:** Real-time shadows for better depth perception
- **Instancing:** Render multiple objects efficiently
- **Frustum culling:** Don't render off-screen objects
- **Bloom effect:** Proper brightness extraction and blur
- **Better PBR:** Full PBR with IBL (image-based lighting)

## Performance

- **Target:** 60 FPS on modern hardware
- **Optimizations:** Indexed rendering, efficient uniform updates
- **Bottlenecks:** Complex shaders, many draw calls
- **Testing:** Run on target hardware, profile with browser dev tools

## Group Contributions

*[To be filled by group members]*

- **Model Loading & Scene Setup:** [Name]
- **Shaders & Materials:** [Name]
- **Lighting & Post-Processing:** [Name]
- **Interactions & Animations:** [Name]
- **Testing & Documentation:** [Name]

## Critical Analysis

### Design Decisions

**Why WebGPU over WebGL?**
- Modern API with better performance
- Better shader language (WGSL)
- Required by coursework specification
- Future-proof technology

**Why OBJ format?**
- Simple to parse and implement
- Widely supported export format
- Good for initial development
- Can extend to GLTF later

**Why custom math library?**
- Lightweight, no dependencies
- Full control over operations
- Easy to debug and modify

### Alternative Approaches

**Could have used:**
- Three.js or Babylon.js (but coursework requires WebGPU directly)
- GLTF format (more complex but better features)
- Existing WebGPU frameworks (but wanted full control)

**Why current approach:**
- Demonstrates understanding of WebGPU API
- Full control over rendering pipeline
- Educational value
- Meets coursework requirements

### Reflection

**What went well:**
- Modular code structure made development easier
- WebGPU API is well-designed
- Incremental development approach worked

**What could be improved:**
- Better error messages for debugging
- More comprehensive texture support
- Optimized shader code
- Better material system

**Recommendations:**
- Start with simple test scenes
- Test on target hardware early
- Profile performance regularly
- Document code as you write it