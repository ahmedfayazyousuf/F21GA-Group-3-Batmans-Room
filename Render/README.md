# Render

This folder has my Batman's Room diorama rendered in Blender.

## What's Here

- `Blender_Project_Files_V1/` - All my Blender files
- `Final_Render_01.jpg` - The final rendered image
- `Explanation-Video.mp4` - Video walkthrough (5 min max)

You can also see incremental work in the root `Incremental_Proof/` folder showing my progress from v1 to v9.

## My Scene

Batman's room: bedroom on the left with a bed, blinds showing the Batman symbol, and a Heriot-Watt poster; a gaming setup on the right with monitors, PC, chair, and shelving with props. Low-poly Batman and a dog in the center.

Total scene: ~42k vertices, ~42k faces.

## Objects

- **Bed** - Simple box modeling with extrusions
- **Gaming Desk** - Multiple monitors with emission materials
- **Shelving Unit** - Black metal frame
- **Batman Character** - Low-poly, grey suit and cape
- **Dog** - White low-poly companion
- **Props** - Boxes, speakers, router, etc.

Check out the incremental proof images to see how the scene developed over time.

## Lighting & Render

Used Cycles with area lights for atmosphere. Camera angle shows the full room layout with the Batman character centered.

## Technical Decisions

- **Modeling:** Chose low-poly for clean look and performance
- **Materials:** PBR workflow with Principled BSDF
- **Lighting:** Moody setup to match the Batman theme
