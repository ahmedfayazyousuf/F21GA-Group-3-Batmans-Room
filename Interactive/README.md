# Interactive

Real-time WebGPU application for exploring Batman's Room.

## What's Here

- `Code_Project/` - WebGPU source code
- `Video.mp4` - Screen capture showing interactions (2-3 min)
- `Explanation_Video.mp4` - Walkthrough (10 min max)

## Getting Started

Loaded my Blender models into the WebGPU app using [OBJ/GLTF/etc]. Had to handle coordinate system conversion and file parsing.

## Scene Setup

Programmatically built the scene matching my Blender layout. Used transformation matrices to position everything correctly.

## Shaders & Materials

Built custom WGSL shaders for rendering. Main shader handles PBR with base color, normal, roughness, and metallic maps.

Materials load textures and apply them via WebGPU texture bindings. Had to convert Blender materials to work with WebGPU.

## Lighting

Used [directional/point] lights with [shadow mapping or simplified lighting]. Lights can be toggled/changed with keys.

## Post-Processing

Added framebuffer effects like [bloom/tone mapping/whatever].

## Interactions

**WASD** - Move camera  
**Mouse** - Look around  
**[Other key]** - [What it does - toggle lights? etc.]

Also have animated objects like [mention rotations, pulsing LEDs, etc.].

## Code Structure

- Core renderer (WebGPU setup, render loop)
- Scene management (loading, transforms)
- Shaders (WGSL compilation)
- Input handling (keyboard/mouse)

## What Worked / What Didn't

**Good:** [Your experience with WebGPU]

**Challenging:** [Shader debugging, texture issues, etc.]

**Next time:** [What you'd improve]

## Performance

Optimized for smooth framerate by [frustum culling, instancing, etc.]. Running at [X] FPS on [your hardware].
