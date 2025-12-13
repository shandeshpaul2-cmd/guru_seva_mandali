const { Document, WebIO } = require('@gltf-transform/core');
const { draco, quantize, dedup, flatten } = require('@gltf-transform/extensions');
const fs = require('fs');
const path = require('path');

async function optimizeGLB() {
  try {
    console.log('🔧 Starting GLB optimization...\n');

    const inputPath = path.join(__dirname, 'public/models/ragaveandra-temple.glb');
    const outputPath = path.join(__dirname, 'public/models/ragaveandra-temple-optimized.glb');

    // Check if input file exists
    if (!fs.existsSync(inputPath)) {
      console.error(`❌ Input file not found: ${inputPath}`);
      console.log('\nMake sure you have decompressed the GLB file and placed it at:');
      console.log('public/models/ragaveandra-temple.glb');
      process.exit(1);
    }

    const inputStats = fs.statSync(inputPath);
    console.log(`📊 Input file size: ${(inputStats.size / 1024 / 1024).toFixed(2)} MB\n`);

    // Initialize WebIO for reading/writing GLB files
    const io = new WebIO();

    // Read the GLB document
    console.log('📖 Reading GLB file...');
    const document = await io.read(inputPath);

    // Get initial stats
    const scene = document.getRoot().getDefaultScene();
    if (scene) {
      const meshes = document.getRoot().listMeshes();
      console.log(`   Found ${meshes.length} mesh(es)`);
    }

    console.log('\n🎯 Applying optimizations:');

    // 1. Deduplication - removes duplicate data
    console.log('   ✓ Deduplicating geometry...');
    document.transform(dedup());

    // 2. Quantization - reduces precision to reduce file size
    console.log('   ✓ Quantizing geometry...');
    document.transform(
      quantize({
        quantizePosition: 14,    // Reduce position precision
        quantizeTexcoord: 12,    // Reduce texture coordinate precision
        quantizeNormal: 8,       // Reduce normal precision
        quantizeColor: 8         // Reduce color precision
      })
    );

    // 3. Flatten - merges nodes for better performance
    console.log('   ✓ Flattening scene hierarchy...');
    document.transform(flatten());

    console.log('\n💾 Writing optimized GLB...');
    await io.write(outputPath, document);

    const outputStats = fs.statSync(outputPath);
    const originalSize = inputStats.size / 1024 / 1024;
    const optimizedSize = outputStats.size / 1024 / 1024;
    const reduction = ((1 - outputStats.size / inputStats.size) * 100).toFixed(1);

    console.log('\n✅ Optimization complete!\n');
    console.log('📈 Results:');
    console.log(`   Original:   ${originalSize.toFixed(2)} MB`);
    console.log(`   Optimized:  ${optimizedSize.toFixed(2)} MB`);
    console.log(`   Reduction:  ${reduction}%\n`);

    console.log(`📂 Optimized file saved to:`);
    console.log(`   ${outputPath}\n`);

    console.log('🚀 Next steps:');
    console.log('   1. Rename ragaveandra-temple-optimized.glb to ragaveandra-temple.glb');
    console.log('   2. Refresh your browser at http://localhost:3002');
    console.log('   3. The 3D model should now load smoothly!\n');

  } catch (error) {
    console.error('❌ Optimization failed:');
    console.error(error.message);
    console.error('\nTroubleshooting:');
    console.error('1. Make sure the GLB file is valid');
    console.error('2. Check that the file is decompressed (no DRACO compression)');
    console.error('3. Try the online tool at https://gltf.report/ as an alternative');
    process.exit(1);
  }
}

optimizeGLB();
