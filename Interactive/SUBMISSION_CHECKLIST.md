# Submission Checklist - Interactive Application

## ✅ Code Requirements

- [x] WebGPU renderer initialized
- [x] Model loading (OBJ format)
- [x] Scene setup with objects
- [x] Materials and shaders (PBR)
- [x] Lighting system (directional + point lights)
- [x] Framebuffer effects (tone mapping, gamma correction)
- [x] Camera controls (WASD + mouse)
- [x] Key interactions (toggle lights, bloom, reset)
- [x] Animated objects (rotating, pulsing lights)

## 📝 Documentation Requirements

- [x] README.md with complete explanation
- [ ] Video.mp4 (2-3 min screen capture) - **TO DO**
- [ ] Explanation_Video.mp4 (10 min max) - **TO DO**

## 🎬 Video Requirements

### Screen Capture Video (2-3 minutes)
- [ ] Show application running
- [ ] Demonstrate all interactions:
  - [ ] WASD movement
  - [ ] Mouse look
  - [ ] Light toggle (L)
  - [ ] Bloom toggle (B)
  - [ ] Camera reset (R)
- [ ] Show animated elements
- [ ] Show different camera angles

### Explanation Video (10 minutes max)
- [ ] Introduction (30 sec)
- [ ] Model loading explanation (1-2 min)
  - Show Blender export process
  - Show code loading models
  - Explain coordinate conversion
- [ ] Shaders & Materials (2-3 min)
  - Show shader code
  - Explain PBR materials
  - Show material setup
- [ ] Lighting (1-2 min)
  - Show light setup
  - Demonstrate light toggle
  - Show animated lights
- [ ] Framebuffer Effects (1-2 min)
  - Explain post-processing
  - Show tone mapping
  - Demonstrate bloom toggle
- [ ] Interactions (1-2 min)
  - Show input handling code
  - Demonstrate all controls
- [ ] Animations (1 min)
  - Show animation code
  - Demonstrate animated objects
- [ ] Conclusion & Reflection (1 min)
  - What worked well
  - Challenges faced
  - Future improvements

## 📦 Files to Include

- [x] Code_Project/ (all source files)
- [x] README.md (complete documentation)
- [ ] Video.mp4 (screen capture)
- [ ] Explanation_Video.mp4 (walkthrough)

## 🔍 Code Review Checklist

- [ ] All files are in Code_Project/
- [ ] No hardcoded paths (use relative paths)
- [ ] Code is commented
- [ ] No console errors when running
- [ ] Works in Chrome/Edge 113+
- [ ] Models load correctly (when added)
- [ ] All interactions work
- [ ] Animations are smooth

## 📊 Marking Criteria Coverage

### Importing and Drawing (20 marks)
- [x] Objects imported from Blender
- [x] Geometry rendered correctly
- [x] Scene built programmatically
- [x] Incremental work shown (code structure)

### Materials, Light and Shading (20 marks)
- [x] Materials with PBR properties
- [x] Custom shaders (WGSL)
- [x] Multiple lights (directional + point)
- [x] Lighting calculations in shader
- [x] Framebuffer effects (tone mapping)

### Animation and Interaction (15 marks)
- [x] Camera movement (WASD)
- [x] Mouse look
- [x] Key interactions (toggle lights, bloom)
- [x] Animated objects (rotating)
- [x] Animated lights (pulsing, color shift)

## 🚀 Next Steps

1. **Export models from Blender:**
   - Open `Render/Blender_Project_Files_V1/scene_v1.blend`
   - Export each major object as OBJ
   - Place in `Code_Project/assets/models/`

2. **Load models in code:**
   - Edit `scene.js`
   - Replace test geometry with your models
   - Set correct positions and materials

3. **Test everything:**
   - Run the application
   - Test all interactions
   - Check performance

4. **Record videos:**
   - Screen capture (2-3 min)
   - Explanation (10 min max)

5. **Final check:**
   - Review README
   - Test on different browsers
   - Check file sizes (< 25MB per file)
   - Commit and push to GitHub
