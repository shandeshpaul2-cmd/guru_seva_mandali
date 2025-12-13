const fs = require('fs');
const path = require('path');
const zlib = require('zlib');

async function optimizeGLB() {
  try {
    const inputPath = path.join(__dirname, 'public/models/ragaveandra-temple.glb');
    const outputPath = path.join(__dirname, 'public/models/ragaveandra-temple-opt.glb');

    if (!fs.existsSync(inputPath)) {
      console.error('❌ File not found:', inputPath);
      process.exit(1);
    }

    console.log('🔧 Starting GLB optimization...\n');

    // Read the file
    const data = fs.readFileSync(inputPath);
    const originalSize = data.length;

    console.log(`📊 Input file size: ${(originalSize / 1024 / 1024).toFixed(2)} MB`);

    // GLB structure: header (12 bytes) + chunks
    // We'll analyze and optimize by reducing duplicate data and quantizing

    // For now, just copy it as the compressed version was the issue
    // The real optimization should be done in Blender or online tools
    fs.copyFileSync(inputPath, outputPath);

    const outputSize = fs.statSync(outputPath).size;

    console.log(`\n⚠️  Note: For true optimization, please use one of these methods:\n`);
    console.log('1️⃣  gltf.report (Recommended - Automatic)');
    console.log('   • Go to https://gltf.report/');
    console.log('   • Drag & drop your GLB file');
    console.log('   • Click Optimize');
    console.log('   • Download the optimized version\n');

    console.log('2️⃣  Blender (Advanced - Manual)');
    console.log('   • Open the GLB in Blender');
    console.log('   • Use Modifiers > Decimate to reduce polygon count by 30-50%');
    console.log('   • Export without DRACO compression\n');

    console.log('3️⃣  THREE.js Editor (Simple)');
    console.log('   • Go to https://threejs.org/editor/');
    console.log('   • Load your GLB');
    console.log('   • File > Export (uncheck Draco)\n');

    console.log('📊 Current file size:', (originalSize / 1024 / 1024).toFixed(2), 'MB');
    console.log('\n✅ Once optimized to < 3MB, it should load smoothly on mobile devices!\n');

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

optimizeGLB();
