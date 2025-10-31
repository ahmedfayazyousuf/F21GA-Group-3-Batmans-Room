# Animation

Animated fly-through of my Batman's Room in Unreal Engine.

## What's Here

- `Unreal Project/` - Unreal Engine project files
- `Video.mp4` - Final animation (under 1 minute)
- `Explanation_Video.mp4` - Video walkthrough (5 min max)

## Exporting from Blender

Exported all models as FBX with scale and materials. Had to be careful about axis orientation.

## Import into Unreal

Imported everything and organized by folders. Initial import had some issues:

**Problem:** Materials didn't convert properly  
**Fix:** Remade materials in Unreal's Material Editor

**Problem:** Wrong scale and positioning  
**Fix:** Adjusted import settings and manually repositioned

## Animation Setup

Created a camera fly-through showing the whole room, pausing at key elements. Used Sequencer to combine camera movement with object animations.

**Camera:** Smooth movement with easing in/out  
**Objects:** [What you animated - LEDs pulsing? Fans rotating?]  
**Duration:** [Length of video]

## Export Settings

- Format: mp4 (H.264)
- Resolution: 1920x1080
- Used Movie Render Queue

## What Worked / What Didn't

**Good:** Sequencer made camera work easy once I got used to it

**Challenging:** Material conversion was time-consuming, learning the export/import workflow

**Next time:** Would spend more time planning materials for cross-engine compatibility

## Key Learnings

Unreal's material system is different from Blender but more powerful. The export/import pipeline needs careful planning to avoid redoing work.
