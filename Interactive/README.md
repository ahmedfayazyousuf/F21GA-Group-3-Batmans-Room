# Interactive WebGPU Application - Batman's Room

This is the interactive WebGPU application for exploring the Batman's Room diorama. The application demonstrates real-time 3D rendering, multiple shader techniques, framebuffer effects, and interactive exploration.

## Explanation Video

An explanation video demonstrating the interactive application, all features, and controls is available. You can download it directly from:

**Download:** [Explanation_Video.mp4](https://github.com/ahmedfayazyousuf/F21GA-Group-3-Batmans-Room/blob/main/Interactive/Explanation_Video.mp4)

## Quick Start

### Prerequisites

- **Chrome/Edge Browser** (version 113+) with WebGPU enabled
- **Python 3** (for local server) or any HTTP server

### Running the Application

1. **Start a local HTTP server:**
   ```bash
   cd Interactive/Code_Project
   python -m http.server 8000
   ```

2. **Open in browser:**
   Navigate to `http://localhost:8000`

3. **Interact:**
   - Click the canvas to lock mouse and start exploring
   - Use WASD to move, mouse to look around
   - Press `L` to toggle lights, `B` to toggle bloom
   - Use dat.GUI controls (left panel) for real-time adjustments

## Project Structure

```
Code_Project/
├── index.html          # Entry point
├── main.js             # Application initialization, render loop, dat.GUI
├── renderer.js         # WebGPU setup, framebuffer, post-processing
├── scene.js            # Scene management, model loading, animations
├── mesh.js             # Mesh rendering, multiple shader support
├── material.js         # Material definitions
├── shaders.js          # Multiple shaders (PBR, Toon, Emissive)
├── postprocess.js      # Bloom, tone mapping, color grading
├── animations.js       # Animation system
├── loader.js           # OBJ model loader
├── camera.js           # First-person camera
├── input.js            # Keyboard/mouse input
├── math.js             # 3D math utilities
└── assets/
    ├── models/         # OBJ model files
    └── textures/       # Texture files (for future use)
```

## How Models Are Loaded

Models are loaded from Blender using the OBJ format:

1. **Export from Blender:**
   - File → Export → Wavefront (.obj)
   - Enable: Include Normals, Include UVs, Apply Modifiers, Triangulate Faces

2. **Place in `assets/models/` folder**

3. **Load in code:**
   The `ModelLoader` class in `loader.js` parses OBJ files:
   - Reads vertices, normals, UV coordinates, and faces
   - Builds interleaved vertex buffers
   - Handles face triangulation
   - Calculates bounding box for centering

4. **Scene setup:**
   The `Scene.loadBlenderModel()` method in `scene.js`:
   - Loads the OBJ file
   - Calculates bounding box to center the model
   - Applies scale transformation (Blender units to WebGPU units)
   - Creates mesh with appropriate material and shader

**Key Code:**
- `loader.js` - OBJ parser implementation
- `scene.js:loadBlenderModel()` - Model loading and centering
- `scene.js:createDefaultScene()` - Scene initialization

## Shaders and Materials

### Multiple Shader System

The application implements three shader types:

1. **PBR Shader** (`shaders.js:getPBRShader()`)
   - Physically-based rendering with metallic/roughness workflow
   - Full lighting calculations (diffuse + specular)
   - Used for realistic materials (bed, desk, furniture)
   - Supports multiple lights with attenuation

2. **Toon Shader** (`shaders.js:getToonShader()`)
   - Cel-shading effect with discrete lighting steps
   - Quantized lighting (4 levels)
   - Creates stylized, comic book aesthetic
   - Used for artistic objects

3. **Emissive Shader** (`shaders.js:getEmissiveShader()`)
   - Self-illuminated materials
   - No lighting calculations
   - Intensity multiplier for brightness
   - Used for glowing objects (monitor screens, LEDs)

**Implementation:**
- Shaders defined in `shaders.js`
- Material class (`material.js`) includes `shaderType` property
- Mesh class (`mesh.js`) caches pipelines per shader type
- Shader selection based on material's `shaderType`

**Critical Analysis:**
Multiple shaders demonstrate understanding of different rendering paradigms. PBR provides realism for most objects, toon provides artistic style for characters, and emissive handles self-lit surfaces. This approach mirrors professional game engines where different objects require different rendering techniques.

## Framebuffer Effects

The application implements complex framebuffer effects using multi-pass rendering:

### Bloom Effect

1. **Render to framebuffer:** Scene renders to off-screen texture
2. **Bright pass:** Extract areas brighter than threshold (0.7)
3. **Multi-level blur:** Gaussian blur in 4 downsampled passes
4. **Composite:** Add bloom back to original scene with intensity control

**Implementation:** `postprocess.js:PostProcessor` class

### Tone Mapping

- **Reinhard operator:** `color / (color + 1.0)`
- Converts HDR rendering to displayable LDR
- Prevents overexposure
- Exposure control for artistic adjustment

### Color Grading

- Saturation control (desaturate to grayscale or boost colors)
- Real-time adjustment via dat.GUI

**Critical Analysis:**
Multi-pass framebuffer effects demonstrate advanced graphics techniques. Bloom creates cinematic glow, tone mapping handles HDR, and color grading provides artistic control. This approach is standard in modern game engines (Unreal, Unity) for achieving polished visuals. The implementation uses efficient downsampling to reduce blur cost.

## Lighting

### Light Types

1. **Directional Light**
   - Infinite distance, parallel rays
   - Used for primary scene illumination
   - Position: Direction vector

2. **Point Light**
   - Position-based with range and attenuation
   - Used for localized lighting
   - Supports distance-based attenuation

### Lighting Features

- Up to 8 lights supported
- Toggle all lights with `L` key
- Animated lights (pulsing, orbiting)
- Real-time intensity adjustment via dat.GUI

### Lighting Calculation

The PBR shader calculates:
- Ambient lighting (base illumination)
- Diffuse lighting (N·L dot product)
- Specular highlights (Blinn-Phong approximation)
- Distance attenuation for point lights

**Implementation:**
- Lights defined in `scene.js:createDefaultScene()`
- Light data packed into uniform buffers in `mesh.js:render()`
- Shader iterates through lights in `shaders.js:getPBRShader()`

## Interactions

### Camera Controls

- **WASD** - Move camera forward/back/left/right
- **Mouse** - Look around (click canvas to lock mouse)
- **Q/E** - Move camera up/down
- **R** - Reset camera to initial position
- **ESC** - Release mouse lock

### Scene Interactions

- **L** - Toggle all lights on/off
- **B** - Toggle bloom post-processing effect

### dat.GUI Controls

The application uses dat.GUI library for real-time parameter adjustment:

- **Camera:** Position (X, Y, Z), Target (X, Y, Z), FOV
- **Lighting:** Light toggle, intensity controls
- **Post-Processing:** Bloom toggle, intensity, exposure, saturation
- **Animations:** Time display
- **Presets:** Quick camera positions (Front, Top, Side, Close Up)

**Implementation:**
- `main.js:setupGUI()` - Initializes dat.GUI controls
- Controls bound to scene/renderer properties
- Real-time updates during interaction

**Critical Analysis:**
dat.GUI is a professional tool used in industry for rapid prototyping and debugging. It enhances interactivity by allowing real-time exploration of parameters. This demonstrates understanding of professional development workflows.

## Animations

The scene includes animated elements for dynamic atmosphere:

### Animation Types

1. **Pulsing Lights**
   - Intensity varies with sine wave
   - Min/max intensity control
   - Creates breathing/LED effect

2. **Orbiting Lights**
   - Lights move in circular paths
   - Configurable radius and speed
   - Adds cinematic movement

3. **Rotation Animations**
   - Objects rotate around arbitrary axes
   - Smooth time-based rotation

4. **Floating Animations**
   - Vertical oscillation using sine waves
   - Configurable amplitude and speed

### Animation System

- Centralized `AnimationSystem` class (`animations.js`)
- Updates each frame with deltaTime for frame-rate independence
- Supports multiple animation types with configurable parameters

**Implementation:**
- `animations.js` - Animation system
- `scene.js:update()` - Calls animation system each frame
- Light animations defined in `scene.js:createDefaultScene()`

**Critical Analysis:**
Animations add life to the scene. Rotation and floating create subtle movement, pulsing lights add atmosphere, and orbiting lights create cinematic effects. The centralized system makes it easy to add new animations and adjust parameters.

## Technical Details

### WebGPU Setup

- Adapter/Device initialization
- Canvas configuration with preferred format
- Depth buffer (24-bit) for depth testing
- Framebuffer for post-processing

### Rendering Pipeline

1. **Update:** Scene animations, camera movement
2. **Render to framebuffer:** All meshes rendered to texture
3. **Post-process:** Apply effects (bloom, tone mapping, color grading)
4. **Present:** Render final result to canvas

### Performance Optimizations

- Indexed rendering to reduce vertex data
- Uniform buffers for efficient GPU data transfer
- Pipeline caching per shader type
- Downsampled bloom passes
- Frame-rate independent animations

## Critical Analysis and Reflection

### Design Decisions

**Why WebGPU?**
The coursework specifically requires WebGPU. It's also a more modern API with better performance potential than WebGL, and WGSL is more readable than GLSL in some ways. It's the direction web graphics is heading.

**Why Multiple Shaders?**
Different objects need different rendering styles. PBR for realism, toon for style, emissive for lights. This is standard in professional engines and demonstrates understanding of different rendering paradigms.

**Why Framebuffer Effects?**
Framebuffer effects are essential for polished visuals. Bloom and tone mapping are industry-standard techniques that significantly improve visual quality. The multi-pass approach demonstrates advanced graphics knowledge.

**Why dat.GUI?**
Professional tool used in industry for rapid prototyping. Enhances interactivity and makes debugging easier. Demonstrates understanding of professional workflows.

### Challenges Encountered

1. **Coordinate System Conversion:** Blender uses Z-up, WebGPU uses Y-up. Solved by handling conversion during model loading.

2. **Model Scale:** Blender scene was 140m, needed significant scaling. Solved by calculating bounding box and applying scale transformation.

3. **Uniform Buffer Alignment:** WebGPU requires 16-byte alignment. Solved by adding padding fields to structs.

4. **Shader Compilation Errors:** WGSL errors not always clear. Solved by incremental debugging and careful syntax checking.

5. **Black Screen Issues:** Model not visible despite rendering. Solved by systematic debugging - simplifying shaders, checking camera, adding debug logs.

### Solutions Implemented

- Bounding box calculation for model centering
- Automatic scale adjustment
- Proper uniform buffer alignment with padding
- Extensive error handling and logging
- Incremental development approach

### What Went Well

- Modular code structure made development easier
- WebGPU API is well-designed
- Incremental development approach worked
- Multiple shaders and effects successfully implemented

### What Could Be Improved

- Texture loading (currently materials use solid colors)
- Better error messages for debugging
- More comprehensive texture support
- Optimized shader code
- Shadow mapping for better depth perception
- Frustum culling for performance

### Recommendations

- Start with simple test scenes before loading complex models
- Test on target hardware early
- Profile performance regularly
- Document code as you write it
- Use version control to track incremental work

## Incremental Work Evidence

Development progressed through several versions:

1. **v1.0** - Basic WebGPU setup, simple test scene
2. **v2.0** - OBJ loader, model loading
3. **v3.0** - Multiple shaders (PBR, Toon, Emissive)
4. **v4.0** - Framebuffer effects (bloom, tone mapping)
5. **v5.0** - Animation system
6. **v6.0** - dat.GUI integration

See `DEVELOPMENT_NOTES.md` for detailed version history and challenges faced.

## Group Contributions

*[To be filled by group members]*

- **Model Loading & Scene Setup:** [Name]
- **Shaders & Materials:** [Name]
- **Lighting & Post-Processing:** [Name]
- **Interactions & Animations:** [Name]
- **Testing & Documentation:** [Name]

## Files and Code References

- **Model Loading:** `loader.js`, `scene.js:loadBlenderModel()`
- **Shaders:** `shaders.js` (all shader definitions)
- **Materials:** `material.js`, `mesh.js` (shader selection)
- **Framebuffer Effects:** `postprocess.js`, `renderer.js` (integration)
- **Lighting:** `scene.js` (light definitions), `shaders.js` (lighting calculations)
- **Interactions:** `input.js`, `camera.js`, `main.js:setupGUI()`
- **Animations:** `animations.js`, `scene.js:update()`

## Requirements Checklist

- [x] Import and render object geometry using WebGPU
- [x] Import and render materials (shader-based materials)
- [x] Set up camera and light models
- [x] Use shaders to render and highlight object attributes (multiple shaders)
- [x] Include framebuffer effects (bloom, tone mapping, color grading)
- [x] Interaction using keys and/or mouse
- [x] Show incremental work (documented in DEVELOPMENT_NOTES.md)
- [x] Record explanation video (10 minutes max)

## Running the Application

See `README_SETUP.md` for detailed setup instructions.

## Contact

For questions about this implementation, refer to the code comments and this README. All code is documented with explanations of design decisions and implementation details.
