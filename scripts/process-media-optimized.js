#!/usr/bin/env node

/**
 * Optimized Media Processing Script
 * Generates quality variants for adaptive loading
 * Uses Sharp for images (faster, more reliable)
 * Uses FFmpeg for videos
 */

const fs = require('fs');
const path = require('path');
const { execSync, exec } = require('child_process');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const VIDEOS_DIR = path.join(__dirname, '../public/videos');

// Try to use Sharp if available, otherwise use convert
let useSharp = false;
try {
  require.resolve('sharp');
  useSharp = true;
} catch {
  console.log('Sharp not found, will use ImageMagick convert command');
}

const IMAGE_SIZES = [
  { width: 480, suffix: '-480w', quality: 80 },
  { width: 720, suffix: '-720w', quality: 85 },
  { width: 1080, suffix: '-1080w', quality: 90 },
];

const VIDEO_QUALITIES = [
  { height: 360, bitrate: '800k', suffix: '-360p' },
  { height: 720, bitrate: '3000k', suffix: '-720p' },
  { height: 1080, bitrate: '6000k', suffix: '-1080p' },
];

async function processImageWithSharp(inputPath, outputPath, width, quality) {
  const sharp = require('sharp');
  try {
    await sharp(inputPath)
      .resize(width, width, {
        fit: 'inside',
        withoutEnlargement: true,
      })
      .jpeg({ quality, progressive: true })
      .toFile(outputPath);
    return true;
  } catch (error) {
    console.error(`Error with Sharp: ${error.message}`);
    return false;
  }
}

function processImageWithConvert(inputPath, outputPath, width) {
  try {
    const command = `convert "${inputPath}" -resize ${width}x${width}> -quality 85 -strip "${outputPath}"`;
    execSync(command, { stdio: 'pipe' });
    return true;
  } catch (error) {
    console.error(`Error with convert: ${error.message}`);
    return false;
  }
}

function processImages() {
  console.log('\n📸 Processing Images...\n');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.log('No images directory found');
    return;
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(
    (f) => /\.(jpg|jpeg|png)$/i.test(f) && !f.includes('-480w') && !f.includes('-720w') && !f.includes('-1080w')
  );

  if (files.length === 0) {
    console.log('No new images to process');
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(IMAGES_DIR, file);
    const name = path.parse(file).name;
    const ext = path.parse(file).ext;

    console.log(`\n📄 ${file}`);
    const stats = fs.statSync(filePath);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB`);

    IMAGE_SIZES.forEach(({ width, suffix, quality }) => {
      const outputFile = path.join(IMAGES_DIR, `${name}${suffix}${ext}`);

      if (fs.existsSync(outputFile)) {
        console.log(`   ✓ ${suffix} already exists`);
        return;
      }

      try {
        let success = false;
        if (useSharp) {
          success = processImageWithSharp(filePath, outputFile, width, quality);
        } else {
          success = processImageWithConvert(filePath, outputFile, width);
        }

        if (success) {
          const outputStats = fs.statSync(outputFile);
          const reduction = (
            ((stats.size - outputStats.size) / stats.size) *
            100
          ).toFixed(1);
          console.log(
            `   ✓ ${suffix} (${(outputStats.size / 1024).toFixed(2)} KB, ${reduction}% reduction)`
          );
        }
      } catch (error) {
        console.error(`   ✗ Error generating ${suffix}: ${error.message}`);
      }
    });
  });
}

function processVideos() {
  console.log('\n🎬 Processing Videos...\n');

  if (!fs.existsSync(VIDEOS_DIR)) {
    console.log('No videos directory found');
    return;
  }

  const files = fs.readdirSync(VIDEOS_DIR).filter(
    (f) =>
      /\.(mp4|webm|mov)$/i.test(f) &&
      !f.includes('-360p') &&
      !f.includes('-720p') &&
      !f.includes('-1080p')
  );

  if (files.length === 0) {
    console.log('No new videos to process');
    return;
  }

  files.forEach((file) => {
    const filePath = path.join(VIDEOS_DIR, file);
    const name = path.parse(file).name;
    const ext = path.parse(file).ext;

    console.log(`\n🎥 ${file}`);
    const stats = fs.statSync(filePath);
    console.log(`   Size: ${(stats.size / 1024 / 1024).toFixed(2)} MB`);

    VIDEO_QUALITIES.forEach(({ height, bitrate, suffix }) => {
      const outputFile = path.join(VIDEOS_DIR, `${name}${suffix}${ext}`);

      if (fs.existsSync(outputFile)) {
        console.log(`   ✓ ${suffix} already exists`);
        return;
      }

      try {
        console.log(`   ⏳ Generating ${suffix}...`);
        const command =
          `ffmpeg -i "${filePath}" -vf scale=-1:${height} -b:v ${bitrate} -c:a aac -q:a 5 "${outputFile}" -y 2>&1`;

        execSync(command, { stdio: 'pipe', maxBuffer: 10 * 1024 * 1024 });

        const outputStats = fs.statSync(outputFile);
        const reduction = (
          ((stats.size - outputStats.size) / stats.size) *
          100
        ).toFixed(1);
        console.log(
          `   ✓ ${suffix} (${(outputStats.size / 1024 / 1024).toFixed(2)} MB, ${reduction}% reduction)`
        );
      } catch (error) {
        console.error(
          `   ✗ Error generating ${suffix}: ${error.message.split('\n')[0]}`
        );
      }
    });
  });
}

function addDateOverlays() {
  console.log('\n📅 Adding Date Overlays...\n');

  const imageDir = IMAGES_DIR;
  if (!fs.existsSync(imageDir)) return;

  const files = fs.readdirSync(imageDir).filter(
    (f) => /\.(jpg|jpeg|png)$/i.test(f) && !f.includes('-480w') && !f.includes('-720w') && !f.includes('-1080w')
  );

  files.forEach((file) => {
    const filePath = path.join(imageDir, file);
    const stat = fs.statSync(filePath);
    const date = stat.birthtime.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
    console.log(`✓ ${file}: ${date}`);
  });

  console.log('\n💡 Dates detected and will be displayed on images in the gallery');
}

function main() {
  console.log('\n╔════════════════════════════════════════╗');
  console.log('║  Temple App - Media Processor v2.0     ║');
  console.log('║  Adaptive Quality & Bandwidth Aware    ║');
  console.log('╚════════════════════════════════════════╝');

  // Check for required tools
  let hasIssues = false;

  try {
    execSync('ffmpeg -version', { stdio: 'pipe' });
  } catch {
    console.error('✗ FFmpeg not found!');
    console.log('   Install with: npm install ffmpeg-static');
    hasIssues = true;
  }

  if (!useSharp) {
    try {
      execSync('convert --version', { stdio: 'pipe' });
    } catch {
      console.error('✗ ImageMagick not found!');
      console.log('   Install with: npm install sharp');
      hasIssues = true;
    }
  }

  if (hasIssues) {
    console.log('\n⚠️  Some tools are missing. Install and try again.\n');
    process.exit(1);
  }

  try {
    processImages();
    processVideos();
    addDateOverlays();

    console.log('\n╔════════════════════════════════════════╗');
    console.log('║  ✓ Processing Complete!               ║');
    console.log('║  Gallery is ready with adaptive        ║');
    console.log('║  loading based on connection speed     ║');
    console.log('╚════════════════════════════════════════╝\n');
  } catch (error) {
    console.error('\n✗ Fatal error:', error.message);
    process.exit(1);
  }
}

main();
