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
  // Add your videos here
  // Example:
  // {
  //   id: 'vid-1',
  //   type: 'video',
  //   src: '/videos/temple-ceremony.mp4',
  //   alt: 'Temple Ceremony Video',
  //   thumbnail: 'https://images.unsplash.com/photo-1495391033685-ee71a382c7e8?w=500&h=400&fit=crop',
  // },
]

// Legacy images array for backward compatibility
export const GALLERY_IMAGES = GALLERY_MEDIA.filter((m) => m.type === 'image').map((m) => m.src)
