# Animation - Engine Animation Deliverable

This folder contains the animated video sequence of my Batman's Room diorama created in Unreal Engine. I exported all my Blender models into Unreal, fixed pipeline issues, and created a camera fly-through animation.

## Contents

- **F21GA_Dio_Animation/**: Unreal Engine project files (optimized if needed)
- **Video.mp4**: Final animated output video (< 1 minute)
- **Explanation_Video.mp4**: Explanation video (max 5 minutes)

## Importing and Pipeline

### Model Export from Blender

I exported my Blender models using [FBX/OBJ/etc.] format with the following settings: [export settings - scale, orientation, etc.]. I had to be careful about [mention any important export considerations].

### Importing to Unreal Engine

I imported the models into Unreal using the standard import pipeline. I organized them in folders by category: [furniture, props, room elements, etc.]. The initial import had [mention any immediate observations].

### Pipeline Fixes and Issues

Moving from Blender to Unreal always brings pipeline challenges. Here's what I encountered:

#### Issue 1: Material Conversion
- **Problem**: Blender materials didn't translate directly to Unreal's material system
- **Solution**: I recreated materials using Unreal's Material Editor, manually setting up base color, roughness, metallic, and normal maps

#### Issue 2: Scale and Positioning
- **Problem**: Objects imported at incorrect scale and positions
- **Solution**: Adjusted import scale settings and manually positioned/reparented objects to match my original scene

*[Add any other issues you encountered]*

### Scene Setup in Unreal

I set up the scene to match my Blender render as closely as possible. I used [mention lighting setup - directional light, sky light, etc.]. Post-process settings were adjusted to [tone, color grading, etc.]. The final scene feels [describe the mood].

## Animation

### Camera Animation

I created a camera fly-through that [describe the camera path - e.g., "starts outside and moves through the room, pausing at key objects"]. The animation uses [keyframe interpolation settings] with a total duration of [time]. I focused on [smooth movement, dramatic angles, etc.].

### Object Animations

I animated several objects in the scene: [list what you animated - e.g., "rotating fans, pulsing LED lights, etc."]. For these, I used [Blueprints/Sequencer/Keyframes] to create [describe the motion].

### Animation Concepts Used

I applied several animation principles:
- **Ease In/Out**: Camera movements start and end smoothly rather than abruptly
- **Follow-Through**: [Example of follow-through if applicable]
- **Timing**: [How you controlled timing for impact]
- [Add more concepts you used]

### Sequencer Setup

I used Unreal's Sequencer to combine all animation elements. The sequence includes:
- Camera track with keyframed positions and rotation
- [Object animation tracks]
- [Lighting/animation tracks if applicable]

Render settings: [mention any specific Sequencer render settings you used]

## Video Export

I exported the final video with these settings:
- **Format**: mp4 (H.264)
- **Resolution**: 1920x1080 [adjust to your resolution]
- **Duration**: [length] seconds
- **Compression**: Used Unreal's Movie Render Queue with [settings] to keep file size reasonable while maintaining quality

The final video is under 1 minute and showcases the diorama effectively.

## My Workflow and Approach

As this was an individual project, I managed the entire animation pipeline myself:
1. **Export from Blender**: Prepared models for Unreal import
2. **Import and Fix**: Brought everything into Unreal and resolved pipeline issues
3. **Scene Assembly**: Rebuilt the scene in Unreal to match my Blender render
4. **Animation**: Created camera and object animations
5. **Polish**: Adjusted lighting, post-process, and timing
6. **Export**: Rendered final video

## Critical Analysis and Reflection

### What Worked Well
- [Discuss what went smoothly - specific tools you found useful, techniques that worked, etc.]
- Unreal's Sequencer made it relatively easy to create smooth camera movements

### Challenges Faced
- The biggest challenge was [pipeline issues, material conversion, learning the tools, etc.]
- I had to [describe problem-solving process]

### What Could Be Improved
- [Be honest - time constraints, aspects you'd like to refine, etc.]
- I would have liked to add [mention features you couldn't include]

### Key Learnings
- **Unreal vs Blender**: Understanding the differences in [lighting/materials/animation] between the two engines
- **Export/Import workflow**: Importance of planning for pipeline from the start
- **Animation principles**: Applying traditional animation concepts to camera work

