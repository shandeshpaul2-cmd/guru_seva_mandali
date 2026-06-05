'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { EyeOff, GripVertical } from 'lucide-react'
import type { GalleryItem } from './types'

interface GalleryCardProps {
  item: GalleryItem
  onClick: () => void
}

export function GalleryCard({ item, onClick }: GalleryCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.id,
  })

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 50 : 'auto',
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group relative bg-white rounded-xl overflow-hidden border border-gray-200 hover:border-temple-gold hover:shadow-lg transition-all"
    >
      <button
        type="button"
        className="absolute top-2 left-2 z-10 p-1.5 rounded-md bg-white/90 backdrop-blur-sm text-gray-600 hover:text-temple-maroon shadow-sm cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
        aria-label="Drag to reorder"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="w-4 h-4" />
      </button>

      {!item.isPublished && (
        <div className="absolute top-2 right-2 z-10 p-1.5 rounded-md bg-gray-900/80 text-white">
          <EyeOff className="w-4 h-4" />
        </div>
      )}

      <button
        type="button"
        onClick={onClick}
        className="block w-full text-left"
      >
        <div className="aspect-square bg-gray-100 overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={item.thumbnailUrl}
            alt={item.caption ?? ''}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        </div>
        <div className="p-3">
          <p className="text-sm text-gray-700 line-clamp-1">
            {item.caption || <span className="italic text-gray-400">Untitled</span>}
          </p>
        </div>
      </button>
    </div>
  )
}
