#!/usr/bin/env node

/**
 * Media Processing Script
 *
 * This script generates optimized variants of images and videos for adaptive loading
 * based on connection speed.
 *
 * Requirements:
 * - ImageMagick (convert command): sudo apt-get install imagemagick
 * - FFmpeg: sudo apt-get install ffmpeg
 *
 * Usage:
 * node scripts/process-media.js
 *
 * This will process all images in public/images/ and public/videos/ directories
 * and generate the following variants:
 *
 * Images: -480w, -720w, -1080w
 * Videos: -360p, -720p, -1080p
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const IMAGES_DIR = path.join(__dirname, '../public/images');
const VIDEOS_DIR = path.join(__dirname, '../public/videos');

// Image processing configurations
const IMAGE_SIZES = [
  { width: 480, suffix: '-480w' },
  { width: 720, suffix: '-720w' },
  { width: 1080, suffix: '-1080w' },
];

// Video processing configurations
const VIDEO_QUALITIES = [
  { height: 360, bitrate: '500k', suffix: '-360p' },
  { height: 720, bitrate: '2500k', suffix: '-720p' },
  { height: 1080, bitrate: '5000k', suffix: '-1080p' },
];

function processImages() {
  console.log('Processing images...');

  if (!fs.existsSync(IMAGES_DIR)) {
    console.log('No images directory found');
    return;
  }

  const files = fs.readdirSync(IMAGES_DIR).filter(
    (f) => /\.(jpg|jpeg|png)$/i.test(f)
  );

  files.forEach((file) => {
    const filePath = path.join(IMAGES_DIR, file);
    const name = path.parse(file).name;
    const ext = path.parse(file).ext;

    IMAGE_SIZES.forEach(({ width, suffix }) => {
      const outputFile = path.join(IMAGES_DIR, `${name}${suffix}${ext}`);

      // Skip if already exists
      if (fs.existsSync(outputFile)) {
        console.log(`✓ ${name}${suffix}${ext} already exists`);
        return;
      }

      try {
        console.log(`Processing ${file} → ${name}${suffix}${ext}`);
        const command = `convert "${filePath}" -resize ${width}x${width}> -quality 85 "${outputFile}"`;
        execSync(command, { stdio: 'inherit' });
        console.log(`✓ Generated ${name}${suffix}${ext}`);
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
      }
    });
  });
}

function processVideos() {
  console.log('\nProcessing videos...');

  if (!fs.existsSync(VIDEOS_DIR)) {
    console.log('No videos directory found');
    return;
  }

  const files = fs.readdirSync(VIDEOS_DIR).filter(
    (f) => /\.(mp4|webm|mov)$/i.test(f)
  );

  files.forEach((file) => {
    const filePath = path.join(VIDEOS_DIR, file);
    const name = path.parse(file).name;
    const ext = path.parse(file).ext;

    VIDEO_QUALITIES.forEach(({ height, bitrate, suffix }) => {
      const outputFile = path.join(VIDEOS_DIR, `${name}${suffix}${ext}`);

      // Skip if already exists
      if (fs.existsSync(outputFile)) {
        console.log(`✓ ${name}${suffix}${ext} already exists`);
        return;
      }

      try {
        console.log(`Processing ${file} → ${name}${suffix}${ext}`);
        const command =
          `ffmpeg -i "${filePath}" -vf scale=-1:${height} -b:v ${bitrate} -c:a aac "${outputFile}" -y`;
        execSync(command, { stdio: 'inherit' });
        console.log(`✓ Generated ${name}${suffix}${ext}`);
      } catch (error) {
        console.error(`✗ Error processing ${file}:`, error.message);
      }
    });
  });
}

function addDateOverlay() {
  console.log('\nAdding date overlays...');

  // Note: This is a more advanced feature that requires ffmpeg text rendering
  console.log('Date overlay feature requires manual ffmpeg command or additional setup');
  console.log(
    'For each video, use: ffmpeg -i input.mp4 -vf "drawtext=text=%{localtime}:fontsize=24:fontcolor=white" output.mp4'
  );
}

function main() {
  console.log('=== Temple App Media Processor ===\n');

  try {
    // Check if required tools are available
    try {
      execSync('convert --version', { stdio: 'pipe' });
    } catch {
      console.warn(
        '⚠ ImageMagick not found. Install with: sudo apt-get install imagemagick'
      );
    }

    try {
      execSync('ffmpeg -version', { stdio: 'pipe' });
    } catch {
      console.warn(
        '⚠ FFmpeg not found. Install with: sudo apt-get install ffmpeg'
      );
    }

    processImages();
    processVideos();
    addDateOverlay();

    console.log('\n=== Processing Complete ===');
    console.log('All media variants have been generated!');
  } catch (error) {
    console.error('Fatal error:', error.message);
    process.exit(1);
  }
}

main();
