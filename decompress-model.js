const fs = require('fs');
const path = require('path');

// We'll use a simple approach: read the compressed GLB and strip DRACO compression
// by using the gltf-pipeline library or manually parsing

const inputPath = path.join(__dirname, 'public/models/ragaveandra-temple-compressed.glb');
const outputPath = path.join(__dirname, 'public/models/ragaveandra-temple.glb');

async function decompressGLB() {
  try {
    // Try to install and use gltf-pipeline
    console.log('Attempting to decompress GLB file...');

    const GLTFPipeline = require('gltf-pipeline');
    const glb = fs.readFileSync(inputPath);

    const options = {
      resourceDirectory: path.dirname(inputPath),
      dracoOptions: {
        compressionLevel: 7,
      },
    };

    const decompressed = await GLTFPipeline.processGlb(glb, options);
    fs.writeFileSync(outputPath, decompressed);

    console.log('Successfully decompressed GLB file!');
    console.log(`Output: ${outputPath}`);
  } catch (error) {
    console.error('Error decompressing GLB:', error.message);
    console.log('\nAlternative: Please use one of these online tools:');
    console.log('1. https://gltf.report/ - Drag and drop your GLB file');
    console.log('2. https://threejs.org/editor/ - Load and export without compression');
  }
}

decompressGLB();
