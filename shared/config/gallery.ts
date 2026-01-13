import { MediaItem } from '@/shared/components/carousel/MediaCarousel'

// Gallery media configuration - Images and Videos
export const GALLERY_MEDIA: MediaItem[] = [
  // Add your images here
  {
    id: 'img-1',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=500&h=400&fit=crop',
    alt: 'Temple Gallery 1',
  },
  {
    id: 'img-2',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1518571885959-97b4f3cc3f1f?w=500&h=400&fit=crop',
    alt: 'Temple Gallery 2',
  },
  {
    id: 'img-3',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1509152579553-c7d1edc61a13?w=500&h=400&fit=crop',
    alt: 'Temple Gallery 3',
  },
  {
    id: 'img-4',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1495391033685-ee71a382c7e8?w=500&h=400&fit=crop',
    alt: 'Temple Gallery 4',
  },
  {
    id: 'img-5',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1508790245330-c6bb3a1d5e59?w=500&h=400&fit=crop',
    alt: 'Temple Gallery 5',
  },
  {
    id: 'img-6',
    type: 'image',
    src: 'https://images.unsplash.com/photo-1513635269975-59663e0ac1ad?w=500&h=400&fit=crop',
    alt: 'Temple Gallery 6',
  },
  {
    id: 'img-7',
    type: 'image',
    src: '/images/temple-image-5.jpeg',
    alt: 'Temple Gallery 5',
  },
  {
    id: 'img-8',
    type: 'image',
    src: '/images/temple-image-6.jpeg',
    alt: 'Temple Gallery 6',
  },
  {
    id: 'img-9',
    type: 'image',
    src: '/images/temple-image-7.jpeg',
    alt: 'Temple Gallery 7',
  },
  {
    id: 'img-10',
    type: 'image',
    src: '/images/temple-image-8.jpeg',
    alt: 'Temple Gallery 8',
  },
  {
    id: 'img-11',
    type: 'image',
    src: '/images/temple-image-9.jpeg',
    alt: 'Temple Gallery 9',
  },
  {
    id: 'img-12',
    type: 'image',
    src: '/images/temple-image-10.jpeg',
    alt: 'Temple Gallery 10',
  },
  {
    id: 'img-13',
    type: 'image',
    src: '/images/temple-image-11.jpeg',
    alt: 'Temple Gallery 11',
  },
  // Add your videos here
  {
    id: 'vid-1',
    type: 'video',
    src: '/videos/temple-video-7.mp4',
    alt: 'Temple Video 7',
    thumbnail: '/images/temple-image-1.jpeg',
  },
  {
    id: 'vid-2',
    type: 'video',
    src: '/videos/temple-video-8.mp4',
    alt: 'Temple Video 8',
    thumbnail: '/images/temple-image-2.jpeg',
  },
  {
    id: 'vid-3',
    type: 'video',
    src: '/videos/temple-video-9.mp4',
    alt: 'Temple Video 9',
    thumbnail: '/images/temple-image-3.jpeg',
  },
]

// Legacy images array for backward compatibility
export const GALLERY_IMAGES = GALLERY_MEDIA.filter((m) => m.type === 'image').map((m) => m.src)
