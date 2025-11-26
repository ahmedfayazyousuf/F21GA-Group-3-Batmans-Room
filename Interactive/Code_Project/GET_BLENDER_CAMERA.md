# Getting Camera Position from Blender

## Step-by-Step Guide

### 1. Open Your Blender File
- Open `Render/Blender_Project_Files_V1/scene_v1.blend`

### 2. Select the Camera
- In the **Outliner** (top-right panel), find and click on **"Camera"**
- Or press `N` to open the Properties panel, then select Camera

### 3. Get Camera Location
- With Camera selected, look at the **Properties panel** (right side, press `N` if not visible)
- Under **"Transform"** section, you'll see:
  - **Location:** X, Y, Z (these are in Blender's coordinate system)
  - **Rotation:** X, Y, Z (in degrees)

### 4. Convert Blender to WebGPU Coordinates

**Blender uses:** X right, Y forward, Z up  
**WebGPU uses:** X right, Y up, Z forward (negative Z is forward)

**Conversion formula:**
```
WebGPU X = Blender X
WebGPU Y = Blender Z
WebGPU Z = -Blender Y
```

**Example:**
- If Blender camera Location is: X=5, Y=-10, Z=2
- WebGPU camera position should be: `[5, 2, 10]`

### 5. Get Camera Target (Where It's Looking)

**Option A: Use Camera's Direction**
- In Blender, the camera looks along its -Z axis
- Calculate target from camera position and rotation

**Option B: Use Viewport Camera**
1. Position your viewport to where you want the camera
2. Press `Ctrl+Alt+Numpad 0` to set camera to current view
3. Then get the camera position as above

**Option C: Manual Calculation**
- The camera target is usually the center of your scene
- For Batman's room centered at origin: `[0, 0, 0]`

### 6. Update the Code

Once you have the values, update `main.js`:

```javascript
// Replace these lines in main.js around line 35:
this.camera.position = [X, Y, Z];  // Your converted Blender position
this.camera.target = [targetX, targetY, targetZ];  // Where camera looks
```

## Quick Method: Use Numpad 0 View

1. In Blender, press `Numpad 0` to see camera view
2. If the view looks good, note the camera's Location values
3. Convert using the formula above
4. Update `main.js`

## Alternative: Use dat.GUI to Adjust

If you're not sure about the exact values:
1. Start the application
2. Use the **dat.GUI controls** (left panel)
3. Adjust **Camera Position X, Y, Z** sliders in real-time
4. When you find a good position, note the values
5. Update `main.js` with those values

## Common Camera Positions for Room Scenes

If you want to try some preset positions:

**Front View (looking at room):**
```javascript
position: [0, 1.5, 4]
target: [0, 0, 0]
```

**Corner View:**
```javascript
position: [3, 2, 3]
target: [0, 0, 0]
```

**Top-Down View:**
```javascript
position: [0, 5, 0]
target: [0, 0, 0]
```

## Notes

- Blender's Y is forward, WebGPU's Z is forward (but negative)
- Blender's Z is up, WebGPU's Y is up
- The model is centered at origin after loading, so target is usually `[0, 0, 0]`
- You can always adjust using dat.GUI controls in real-time

