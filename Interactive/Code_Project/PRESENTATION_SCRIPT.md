# Presentation Script - Interactive WebGPU Application

## Introduction (30 seconds)

"Good [morning/afternoon]. Today I'll be presenting my interactive WebGPU application showcasing Batman's Room. This is the final deliverable for the 3D Graphics and Animation coursework, demonstrating real-time rendering, multiple shader techniques, framebuffer effects, and interactive exploration."

## Model Loading (1.5 minutes)

### How Models Were Loaded

"I started by exporting my Batman room scene from Blender as an OBJ file. The model loader, found in `loader.js`, parses the OBJ format which is a simple text-based format with vertices, normals, UV coordinates, and face definitions."

"One of the first challenges I faced was the coordinate system difference. Blender uses Z-up, while WebGPU uses Y-up. I had to handle this conversion during the loading process. Additionally, the Blender scene was 140 meters in size, so I implemented automatic scaling to make it viewable in the WebGPU context."

"The loader calculates a bounding box to center the model at the origin, which makes camera positioning much easier. You can see this in `scene.js` in the `loadBlenderModel` method, where I calculate min/max bounds and translate the model to center it."

### Problems Faced

"The main issue was getting the model to appear at all. Initially, I had problems with:
- Scale being too large or too small
- Model positioned behind the camera
- Coordinate system mismatches

I solved this by adding debug logging to show the model bounds, which helped me understand the actual dimensions and adjust the camera and scale accordingly."

## Materials and Shaders (2 minutes)

### Multiple Shader System

"I implemented three different shader types to demonstrate different rendering techniques, which is required for the highest marks."

"First, the PBR shader - this is a physically-based rendering shader that uses metallic and roughness properties. It calculates realistic lighting with diffuse and specular components. This is used for most objects in the scene to give them a realistic appearance."

"Second, the Toon shader - this creates a cel-shaded, stylized look by quantizing the lighting into discrete steps. Instead of smooth gradients, you get distinct bands of light and shadow, like in comic books or animated films. This could be applied to the Batman character for a more stylized look."

"Third, the Emissive shader - this is for self-illuminated objects like monitor screens or LED lights. It bypasses lighting calculations entirely and just outputs the material color at increased intensity."

### Implementation

"The shader system is modular - each shader is defined in `shaders.js`, and the `Mesh` class selects the appropriate shader based on the material's `shaderType` property. I cache pipelines per shader type to avoid recreating them every frame, which improves performance."

### Why Multiple Shaders?

"I chose to implement multiple shaders because different objects need different rendering approaches. A realistic bed or desk benefits from PBR, while a stylized character might look better with toon shading. This demonstrates understanding of different rendering paradigms used in professional game engines."

## Framebuffer Effects (2 minutes)

### Bloom Effect

"The bloom effect creates that cinematic glow you see around bright objects. It's a multi-pass process:
1. First, I render the scene to a framebuffer texture
2. Then I extract bright areas using a threshold - anything brighter than 0.7 gets extracted
3. I blur these bright areas using a Gaussian blur in multiple passes, each time downsampling to reduce cost
4. Finally, I composite the blurred bloom back onto the original scene with adjustable intensity"

"This is computationally expensive, so I use downsampling - creating progressively smaller textures for each blur pass. This reduces the number of pixels processed while still achieving a smooth blur effect."

### Tone Mapping

"Tone mapping converts HDR rendering to displayable LDR. I use the Reinhard operator, which is `color / (color + 1.0)`. This prevents overexposure and creates a more natural-looking image. The exposure can be adjusted in real-time using the dat.GUI controls."

### Color Grading

"I also implemented saturation control, which allows desaturating to grayscale or boosting colors for artistic effect. This gives creative control over the final look."

### Why Framebuffer Effects?

"Framebuffer effects are essential for polished visuals. They're standard in modern game engines like Unreal and Unity. Implementing them demonstrates understanding of advanced graphics techniques and multi-pass rendering."

## Interactions (1.5 minutes)

### Camera System

"The camera is a first-person style camera that moves with WASD keys and looks around with the mouse. I use pointer lock API to capture mouse movement smoothly. The camera calculates view and projection matrices each frame based on its position and target."

"I also added preset camera positions accessible through dat.GUI - front view, top view, side view, and close-up. This makes it easy to showcase different angles of the scene."

### Keyboard Interactions

"Beyond camera movement, I implemented:
- L key to toggle all lights on and off
- B key to toggle bloom effect
- R key to reset camera to initial position
- ESC to release mouse lock"

### Mouse Interaction

"Clicking the canvas locks the mouse pointer, allowing smooth camera rotation. Moving the mouse rotates the camera based on yaw and pitch angles, with pitch clamped to prevent flipping."

## Animations (1.5 minutes)

### Animation System

"I created a centralized animation system in `animations.js` that manages all scene animations. This makes it easy to add new animations and ensures frame-rate independence using deltaTime."

### Light Animations

"I implemented two types of light animations:
1. Pulsing lights - the intensity varies with a sine wave between min and max values, creating a breathing or LED effect
2. Orbiting lights - lights move in circular paths around center points, adding cinematic movement to the scene"

"These animations update each frame in the `Scene.update()` method, which is called before rendering."

### Why Animations?

"Animations bring the scene to life. Static scenes feel dead, but subtle movement - like pulsing lights or orbiting point lights - creates atmosphere and makes the scene feel more dynamic and engaging."

## dat.GUI Library (1 minute)

"I integrated dat.GUI, which is a professional tool used in industry for rapid prototyping and debugging. It provides real-time parameter adjustment through sliders and checkboxes."

"The GUI allows users to:
- Adjust camera position, target, and field of view
- Control light intensities
- Tweak post-processing parameters like bloom intensity, exposure, and saturation
- Monitor animation time"

"This enhances interactivity significantly - instead of hardcoding values, users can explore different settings in real-time. This demonstrates understanding of professional development workflows."

## Problems and Solutions (1.5 minutes)

### Major Challenges

"One of the biggest challenges was getting the model to render at all. Initially, I had a black screen despite the console showing meshes were being rendered. I debugged this systematically:
- First, I simplified the shader to just output material color, bypassing lighting
- Then I checked camera position and view frustum
- I added debug logging to track what was happening
- I discovered the model was being culled or positioned incorrectly"

"Another challenge was uniform buffer alignment. WebGPU requires 16-byte alignment for uniform buffers. My Light struct was incorrectly sized, causing binding errors. I fixed this by adding padding fields to ensure proper alignment."

"Shader compilation errors were also tricky - WGSL error messages aren't always clear. I had to carefully check syntax, especially around reserved keywords like 'type' which I had to rename to 'lightType'."

### Solutions

"I solved these by:
- Incremental debugging - starting simple and adding complexity
- Adding extensive console logging
- Testing with simple test scenes before loading the full model
- Reading WebGPU documentation carefully for alignment requirements"

## Critical Analysis and Reflection (1 minute)

### Design Decisions

"Why WebGPU over WebGL? The coursework specifically requires WebGPU, but it's also more modern with better performance potential. WGSL is actually more readable than GLSL in some ways."

"Why multiple shaders? Different objects need different rendering styles. This is standard in professional engines where you might use PBR for realism, toon for style, and emissive for lights."

"Why framebuffer effects? They're essential for polished visuals. Bloom and tone mapping are industry-standard techniques that significantly improve visual quality."

### What Went Well

"The modular code structure made development much easier. Breaking things into separate files - renderer, scene, mesh, shader - meant I could work on different parts without breaking everything."

"The incremental approach worked well - starting with simple test scenes, then gradually adding features. This made debugging much easier."

### What Could Be Improved

"Texture loading is still something I'd like to add properly. Currently materials use solid colors, but full texture support would make the scene more realistic."

"Performance could be optimized further - frustum culling, instancing for repeated objects, and better shader optimization could improve frame rates."

### Recommendations

"For future work, I'd recommend:
- Starting with simple test scenes before loading complex models
- Testing on target hardware early
- Profiling performance regularly
- Documenting code as you write it, not after"

## Group Contributions (30 seconds)

"[To be filled by group members - explain how work was split]"

## Conclusion (30 seconds)

"In conclusion, I've successfully created an interactive WebGPU application that demonstrates model loading, multiple shader techniques, complex framebuffer effects, and rich interactions. The application meets all coursework requirements and showcases understanding of modern graphics programming techniques."

"Thank you. I'm happy to answer any questions."

---

## Total Time: ~10 minutes

## Tips for Recording

1. **Screen Recording:** Show the code while explaining (use split screen or picture-in-picture)
2. **Demonstration:** Actually use the application - move camera, toggle effects, adjust GUI
3. **Code Walkthrough:** Point to specific files and functions
4. **Be Natural:** Don't read word-for-word, use this as a guide
5. **Practice:** Run through it once before recording
6. **Audio:** Check audio quality - avoid background noise

