import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

async function analyzeGLB() {
  try {
    const inputPath = path.join(__dirname, 'public/models/ragaveandra-temple.glb');

    if (!fs.existsSync(inputPath)) {
      console.error('❌ File not found:', inputPath);
      console.error('Make sure you have decompressed ragaveandra-temple.glb in public/models/');
      process.exit(1);
    }

    const stats = fs.statSync(inputPath);
    const sizeMB = (stats.size / 1024 / 1024).toFixed(2);

    console.log('📊 GLB File Analysis\n');
    console.log('File:', path.basename(inputPath));
    console.log('Size:', sizeMB, 'MB\n');

    // Read and analyze GLB structure
    const buffer = fs.readFileSync(inputPath);

    // GLB Header
    const magic = buffer.readUInt32LE(0);
    const version = buffer.readUInt32LE(4);
    const fileSize = buffer.readUInt32LE(8);

    console.log('GLB Structure:');
    console.log('  Version:', version);
    console.log('  Total size:', (fileSize / 1024 / 1024).toFixed(2), 'MB\n');

    // Read JSON chunk
    let offset = 12;
    const jsonChunkSize = buffer.readUInt32LE(offset);
    const jsonChunkType = buffer.toString('utf8', offset + 4, offset + 8);

    console.log('Chunks:');
    console.log('  JSON chunk:', (jsonChunkSize / 1024).toFixed(2), 'KB');

    offset += 8 + jsonChunkSize;
    if (offset < fileSize) {
      const binChunkSize = buffer.readUInt32LE(offset);
      console.log('  BIN chunk:', (binChunkSize / 1024 / 1024).toFixed(2), 'MB\n');
    }

    console.log('🎯 Optimization Recommendations:\n');

    if (sizeMB > 5) {
      console.log('⚠️  File is quite large (' + sizeMB + ' MB)');
      console.log('\nTo optimize, use one of these methods:\n');

      console.log('✅ OPTION 1: gltf.report (Easiest & Fastest)');
      console.log('   1. Go to https://gltf.report/');
      console.log('   2. Drag & drop public/models/ragaveandra-temple.glb');
      console.log('   3. Click the Optimize button');
      console.log('   4. Download optimized file');
      console.log('   5. Replace the original\n');

      console.log('✅ OPTION 2: Blender (Most Control)');
      console.log('   1. Download Blender (free) from https://www.blender.org/');
      console.log('   2. Open the GLB file');
      console.log('   3. Select all objects > Modifiers > Add Modifier > Decimate');
      console.log('   4. Set Ratio to 0.5 (reduces polygons by 50%)');
      console.log('   5. File > Export > Export glTF 2.0 (.glb)');
      console.log('   6. UNCHECK "Compression (Draco)"');
      console.log('   7. Export and replace the file\n');

      console.log('✅ OPTION 3: Online THREE.js Editor');
      console.log('   1. Go to https://threejs.org/editor/');
      console.log('   2. File > Import > Select your GLB');
      console.log('   3. File > Export glTF 2.0');
      console.log('   4. UNCHECK "Compression (Draco)"');
      console.log('   5. Click Download and replace the file\n');

      console.log('Target size: < 3 MB for mobile devices\n');
    } else {
      console.log('✅ File size is reasonable (' + sizeMB + ' MB)');
      console.log('The model should load on mobile devices.');
      console.log('Try refreshing your browser at http://localhost:3002\n');
    }

  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
}

analyzeGLB();
