# 3D Temple Model

This folder contains the 3D model files for the temple structure displayed on the homepage.

## Uploading Your SKP File

### Step 1: Convert SKP to GLB Format

The 3D model must be in **GLB (Binary glTF)** format to be displayed on the website. Follow these steps to convert your SketchUp (.skp) file:

**Option A: Using SketchUp Pro**
1. Open your `.skp` file in SketchUp Pro
2. Go to **File > Export > Export 3D Model**
3. Choose the location and set the filename to `temple.glb`
4. Make sure the format is set to "glTF Binary (*.glb)"
5. Click Export

**Option B: Using Online Converters**
1. Visit a free converter like:
   - [CloudConvert](https://cloudconvert.com/skp-to-glb)
   - [AnyConv](https://anyconv.com/en/skp-to-glb-converter)
2. Upload your `.skp` file
3. Convert to GLB format
4. Download the converted file

**Option C: Using SketchUp Free**
1. Open your `.skp` file in SketchUp Free (online or desktop)
2. Look for export options in the menu
3. Export to a format like `.dae` (Collada) or `.obj`
4. Then use an online converter to convert to `.glb`

### Step 2: Place the File

1. After converting to GLB format, rename the file to: `temple.glb`
2. Place it in the `/public/models/` folder of the project
3. The file path should be: `/public/models/temple.glb`

### Step 3: Optimize for Mobile

If the model file is larger than 10MB, optimize it:

**Using Blender (Free)**
1. Download and install [Blender](https://www.blender.org/)
2. Open the `.glb` file in Blender
3. Go to **File > Export > Export glTF 2.0 (.glb/.gltf)**
4. In the export options:
   - Enable "Compression (Draco)"
   - Reduce decimation/poly count if needed
5. Export with optimization enabled

**Using Online Tools**
- [glTF Viewer & Optimizer](https://gltf.report/) - Drag and drop to analyze and optimize
- [THREE.js Editor](https://threejs.org/editor/) - Load, inspect, and export optimized models

### Step 4: Test

1. Run the development server: `npm run dev`
2. Open the homepage
3. The 3D model should now display in place of the logo
4. Test on mobile to ensure smooth performance

## Component Usage

The 3D model is displayed using the `Temple3DModel` component:

```tsx
<Temple3DModel
  modelPath="/models/temple.glb"
  width="w-24"
  height="h-24"
  className="mx-auto"
/>
```

### Props

- `modelPath` (optional): Path to the GLB file (default: `/models/temple.glb`)
- `width` (optional): Tailwind width class or CSS width (default: `100%`)
- `height` (optional): Tailwind height class or CSS height (default: `auto`)
- `className` (optional): Additional CSS classes

## Model File Size Guidelines

For optimal performance, especially on mobile:

| Device Type | Recommended File Size |
|-------------|----------------------|
| Desktop    | < 20MB                |
| Mobile     | < 5MB                 |
| Slow 3G    | < 2MB                 |

Larger files will take longer to load and consume more bandwidth.

## Features

The 3D model viewer includes:

- ✅ **Auto-rotation** - The model rotates automatically for visual appeal
- ✅ **Interactive controls** - Users can drag to rotate, scroll to zoom
- ✅ **Mobile optimized** - Reduced quality on mobile devices for better performance
- ✅ **Loading indicator** - Shows spinner while model loads
- ✅ **Lighting** - Professional ambient and directional lighting
- ✅ **Responsive** - Adapts to screen size

## Troubleshooting

**Model doesn't appear:**
- Check that the file is named `temple.glb` and is in `/public/models/`
- Check browser console (F12) for error messages
- Ensure the file is a valid GLB format

**Model loads slowly:**
- Optimize the file size using Blender or online tools
- Reduce polygon count or use compression

**Model looks dark or wrong colors:**
- Check the lighting settings in the Temple3DModel component
- Some models may need different camera positioning

## Additional Resources

- [glTF Format Documentation](https://www.khronos.org/gltf/)
- [Three.js Documentation](https://threejs.org/docs/)
- [Babylon.js glTF Loader](https://www.babylonjs-playground.com/)
