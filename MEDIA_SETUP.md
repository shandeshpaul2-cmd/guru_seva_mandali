# 📸 Temple App - Media Management Guide

## Overview

The Temple app now includes **adaptive quality loading** based on visitor's connection speed. Images and videos are automatically served at the optimal resolution:

- **Images**: 480px (low), 720px (medium), 1080px (high)
- **Videos**: 360p (low), 720p (medium), 1080p (high)

All media includes automatic **date overlays** showing when photos/videos were captured.

## Quick Start

### 1. Adding New Media

Simply upload your image or video files to:
- **Images**: `public/images/`
- **Videos**: `public/videos/`

Name them following the pattern:
- `temple-image-5.jpeg`
- `temple-video-7.mp4`

### 2. Generate Quality Variants

After uploading, run the processing script:

```bash
node scripts/process-media-optimized.js
```

This will:
- Create 480px, 720p, and 1080p variants of all images
- Create 360p, 720p, and 1080p variants of all videos
- Show file size reductions for each variant
- Extract and display dates automatically

## Features

### 🌐 Bandwidth-Aware Loading

The app automatically detects user's connection speed:

```
Slow 2G/3G  → 480px images, 360p videos (lower data usage)
4G          → 720px images, 720p videos (balanced)
Fast 4G/5G  → 1080p images, 1080p videos (high quality)
```

Users can also manually override quality in the video player using the settings button.

### 📅 Automatic Date Overlays

- Images show capture date in bottom-left corner
- Videos show capture date in bottom-left corner
- Dates extracted from file metadata automatically
- Format: `MMM D, YYYY` (e.g., "Dec 11, 2025")

**How Dates Work:**
- The gallery API (`/api/gallery`) automatically extracts the file's modification timestamp
- When you upload/add a new file to `public/images/` or `public/videos/`, the current date is automatically captured
- The date shown is based on the file's modification time (when it was last modified)
- **Important**: When copying/moving files between systems, ensure the file modification times are preserved to maintain accurate dates

### 📱 Responsive Components

#### ResponsiveImage Component
- Automatically serves correct resolution via `srcset`
- Progressive loading with skeleton placeholder
- Date overlay support
- Optimized for mobile and desktop

#### AdaptiveVideo Component
- Quality selector button (top-right when hovering)
- Manual quality override
- Automatic quality detection
- Date overlay support
- Seamless quality switching without buffering

## File Organization

```
public/
├── images/
│   ├── temple-image-1.jpeg          # Original
│   ├── temple-image-1-480w.jpeg     # Mobile (480px)
│   ├── temple-image-1-720w.jpeg     # Tablet (720px)
│   ├── temple-image-1-1080w.jpeg    # Desktop (1080px)
│   └── temple-image-4.jpeg          # Your new upload
└── videos/
    ├── temple-video-1.mp4           # Original
    ├── temple-video-1-360p.mp4      # Low quality
    ├── temple-video-1-720p.mp4      # Medium quality
    ├── temple-video-1-1080p.mp4     # High quality
    └── temple-video-6.mp4           # Your new upload
```

## Installation Requirements

### Option 1: Using Sharp (Recommended - Faster)

```bash
npm install sharp
```

Sharp is a Node.js image processing library with excellent performance.

### Option 2: Using ImageMagick

```bash
# macOS
brew install imagemagick

# Ubuntu/Debian
sudo apt-get install imagemagick

# Or via npm
npm install @mapbox/node-pre-gyp
```

### FFmpeg (Required for Videos)

```bash
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg

# Or via npm
npm install ffmpeg-static
```

## Processing Details

### Image Processing

**Resolutions Generated:**
- 480px: 80% JPEG quality (mobile)
- 720px: 85% JPEG quality (tablet)
- 1080px: 90% JPEG quality (desktop)

**Size Reduction Examples:**
- Original 2MB image → ~250KB (480px), ~450KB (720px), ~800KB (1080px)
- Expected 60-80% size reduction per variant

**Optimization:**
- Progressive JPEG encoding
- Automatic strip of EXIF data (except date)
- Aspect ratio preserved
- No upscaling

### Video Processing

**Quality Tiers:**
- 360p: 800 kbps (3G/4G, low data mode)
- 720p: 3000 kbps (4G standard)
- 1080p: 6000 kbps (5G/WiFi)

**Format:**
- Input: MP4, WebM, MOV
- Output: H.264 (best compatibility)
- Audio: AAC 128kbps

**Example File Sizes:**
- Original 100MB video → ~12MB (360p), ~35MB (720p), ~70MB (1080p)

## API Integration

The gallery automatically fetches media from `/api/gallery`:

```typescript
interface MediaItem {
  id: string
  src: string                    // Path to media file
  type: 'image' | 'video'
  alt: string                    // Fallback text
  thumbnail?: string             // Optional thumbnail
  date: string                   // Extracted from file metadata
}
```

The API:
- Filters out quality variant files automatically
- Sorts files alphabetically
- Extracts dates from file creation time
- Excludes media larger than quality variants from search

## Component Usage

### ResponsiveImage (Best for images)

```tsx
import { ResponsiveImage } from '@/shared/components/gallery/ResponsiveImage'

<ResponsiveImage
  src="/images/temple-image-1.jpeg"
  alt="Temple view"
  date="Dec 11, 2025"
  priority={false}
  onLoad={() => console.log('Loaded')}
/>
```

### AdaptiveVideo (Best for videos)

```tsx
import { AdaptiveVideo } from '@/shared/components/gallery/AdaptiveVideo'

<AdaptiveVideo
  src="/videos/temple-video-1.mp4"
  alt="Temple ceremony"
  date="Dec 10, 2025"
  controls={true}
  autoPlay={false}
/>
```

### MediaCarousel (For galleries)

```tsx
import { MediaCarousel, MediaItem } from '@/shared/components/carousel/MediaCarousel'

const items: MediaItem[] = [
  {
    id: '1',
    src: '/images/temple-image-1.jpeg',
    type: 'image',
    alt: 'Temple',
    date: 'Dec 11, 2025',
  },
]

<MediaCarousel items={items} title="Temple Gallery" />
```

## Bandwidth Detection Hook

The `useBandwidthDetection` hook automatically detects connection quality:

```typescript
import { useBandwidthDetection } from '@/shared/hooks/useBandwidthDetection'

const { quality, isLoading } = useBandwidthDetection()
// quality: 'low' | 'medium' | 'high'
```

### Connection Detection Logic

1. **Save-Data Preference** (highest priority)
   - Users with data saver enabled → low quality

2. **Effective Connection Type**
   - `slow-2g`, `2g` → low
   - `3g` → medium (unless slow)
   - `4g` → medium or high (based on downlink speed)

3. **Fallback**
   - If no API available → medium quality

## Troubleshooting

### Processing Script Fails

**FFmpeg not found:**
```bash
npm install ffmpeg-static
```

**ImageMagick/Sharp not found:**
```bash
npm install sharp
```

**Permission denied:**
```bash
chmod +x scripts/process-media-optimized.js
node scripts/process-media-optimized.js
```

### Images/Videos Not Showing Dates

- Ensure files are in correct directory
- Check file metadata with: `stat public/images/temple-image-1.jpeg`
- Dates use file creation time, then modification time as fallback

**To update file dates for existing media:**
```bash
# Update all images to current date
touch public/images/*.jpeg

# Update all videos to current date
touch public/videos/*.mp4

# Or set to a specific date (YYYYMMDDHHMM format)
touch -t 202512111000 public/images/temple-image-1.jpeg
```

**To fix incorrect dates from old uploads:**
```bash
# macOS - set to Dec 11, 2025 10:00 AM
touch -t 202512111000 public/images/* public/videos/*

# Linux - set to Dec 11, 2025 10:00 AM
touch -d "2025-12-11 10:00" public/images/* public/videos/*
```

### Quality Not Switching on Mobile

- Some browsers don't support the Connection API
- Falls back to medium quality automatically
- Users can still manually select quality from video settings

## Performance Metrics

### Data Savings (3G User)
- Image gallery: ~70% less data (480px vs original)
- Video gallery: ~85% less data (360p vs original)
- First load: ~2-3 seconds

### Data Savings (WiFi User)
- Full 1080p images and 1080p videos
- Best visual quality
- First load: <1 second

## Future Enhancements

- [ ] WebP format support for even better compression
- [ ] Automatic thumbnail generation
- [ ] Batch video processing with progress tracking
- [ ] Cloud storage integration (AWS S3, Cloudinary)
- [ ] Advanced metadata extraction (location, camera info)
- [ ] Video preview scrubbing

## Support

For issues with:
- **Image quality**: Check image file format and resolution
- **Video quality**: Verify FFmpeg is installed and accessible
- **Dates not showing**: Ensure file metadata is preserved
- **Performance**: Check bandwidth detection working with DevTools Network tab
