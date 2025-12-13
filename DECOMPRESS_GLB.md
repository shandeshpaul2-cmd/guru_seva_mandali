# Decompressing the GLB Model File

The `ragaveandra-temple-compressed.glb` file uses DRACO compression, which requires external tools to decompress. Follow these steps to create a non-compressed version:

## Option 1: Using gltf.report (Easiest - Recommended)

1. Go to https://gltf.report/
2. Drag and drop `public/models/ragaveandra-temple-compressed.glb` into the viewer
3. The tool will load and analyze the model
4. Click the **Download** button to save the decompressed version
5. Rename the downloaded file to `ragaveandra-temple.glb`
6. Place it in the `public/models/` folder

## Option 2: Using THREE.js Editor

1. Go to https://threejs.org/editor/
2. Click **File** > **Import**
3. Select `public/models/ragaveandra-temple-compressed.glb`
4. Once loaded, click **File** > **Export glTF 2.0**
5. **IMPORTANT**: Uncheck "Compression (Draco)" in the export dialog
6. Click **Download** and rename to `ragaveandra-temple.glb`
7. Place it in the `public/models/` folder

## Option 3: Using Blender

1. Download and install [Blender](https://www.blender.org/) if you don't have it
2. Open `public/models/ragaveandra-temple-compressed.glb` in Blender
3. Go to **File** > **Export** > **Export glTF 2.0 (.glb/.gltf)**
4. In export settings, **uncheck** "Compression (Draco)"
5. Export as `ragaveandra-temple.glb`
6. Place it in the `public/models/` folder

## Verify Installation

After placing `ragaveandra-temple.glb` in `public/models/`:

1. Refresh your browser at http://localhost:3002
2. The 3D temple model should now load (instead of the maroon box fallback)
3. You should be able to rotate, zoom, and pan the model

## File Size Comparison

- `ragaveandra-temple-compressed.glb`: ~1.7 MB (with DRACO compression)
- `ragaveandra-temple.glb`: ~5-10 MB (without compression, varies by tool)

The decompressed version will be larger but will load without DRACO decoder errors.

## Troubleshooting

If the model still doesn't load after decompression:

1. Check the browser console (F12) for error messages
2. Make sure the file is named exactly `ragaveandra-temple.glb`
3. Verify it's in the `public/models/` folder
4. Try clearing browser cache and doing a hard refresh
5. Check that the file is a valid GLB format

## Current Status

Currently, the app will show a **maroon temple logo** as a fallback if the compressed GLB doesn't load. Once you decompress and add the `ragaveandra-temple.glb` file, the full 3D model will display with:

- ✅ Auto-rotation
- ✅ Interactive controls (drag to rotate, scroll to zoom)
- ✅ Professional lighting
- ✅ Responsive design
- ✅ Loading spinner
