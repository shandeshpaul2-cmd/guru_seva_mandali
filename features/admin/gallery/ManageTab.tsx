'use client'

import { useEffect, useMemo, useState } from 'react'
import {
  DndContext,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import { SortableContext, arrayMove, rectSortingStrategy } from '@dnd-kit/sortable'
import { Search, Image as ImageIcon } from 'lucide-react'
import { toast } from 'sonner'
import { Input } from '@/shared/components/ui/Input'
import { GalleryCard } from './GalleryCard'
import type { GalleryItem, LibraryFilter } from './types'

interface ManageTabProps {
  items: GalleryItem[]
  isLoading: boolean
  onReorder: (newItems: GalleryItem[]) => void
  onSelect: (item: GalleryItem) => void
}

export function ManageTab({ items, isLoading, onReorder, onSelect }: ManageTabProps) {
  const [filter, setFilter] = useState<LibraryFilter>('all')
  const [searchInput, setSearchInput] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')

  useEffect(() => {
    const t = setTimeout(() => setDebouncedSearch(searchInput.trim().toLowerCase()), 200)
    return () => clearTimeout(t)
  }, [searchInput])

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
  )

  const visibleItems = useMemo(() => {
    return items.filter((item) => {
      if (filter === 'published' && !item.isPublished) return false
      if (filter === 'hidden' && item.isPublished) return false
      if (debouncedSearch) {
        const hay = `${item.caption ?? ''} ${item.cloudinaryId}`.toLowerCase()
        if (!hay.includes(debouncedSearch)) return false
      }
      return true
    })
  }, [items, filter, debouncedSearch])

  const canReorder = filter === 'all' && !debouncedSearch

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    const oldIndex = items.findIndex((i) => i.id === active.id)
    const newIndex = items.findIndex((i) => i.id === over.id)
    if (oldIndex === -1 || newIndex === -1) return

    const next = arrayMove(items, oldIndex, newIndex)
    onReorder(next)

    try {
      const res = await fetch('/api/admin/gallery/reorder', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids: next.map((i) => i.id) }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        onReorder(items)
        toast.error(data?.error ?? 'Failed to save new order')
        return
      }
      toast.success('Order saved')
    } catch {
      onReorder(items)
      toast.error('Failed to save new order')
    }
  }

  const filterChips: { value: LibraryFilter; label: string; count: number }[] = [
    { value: 'all', label: 'All', count: items.length },
    { value: 'published', label: 'Published', count: items.filter((i) => i.isPublished).length },
    { value: 'hidden', label: 'Hidden', count: items.filter((i) => !i.isPublished).length },
  ]

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {filterChips.map((chip) => (
            <button
              key={chip.value}
              onClick={() => setFilter(chip.value)}
              className={`
                px-4 py-1.5 rounded-full text-sm font-medium transition-colors
                ${
                  filter === chip.value
                    ? 'bg-temple-maroon text-white'
                    : 'bg-temple-cream/60 text-temple-maroon hover:bg-temple-cream'
                }
              `}
            >
              {chip.label}
              <span className="ml-1.5 opacity-70">{chip.count}</span>
            </button>
          ))}
        </div>
        <div className="sm:w-72">
          <Input
            placeholder="Search caption or ID"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            leftIcon={<Search className="w-4 h-4" />}
          />
        </div>
      </div>

      {isLoading ? (
        <GridSkeleton />
      ) : items.length === 0 ? (
        <EmptyState
          title="No images yet."
          subtitle="Upload some from the Upload tab."
        />
      ) : visibleItems.length === 0 ? (
        <EmptyState
          title="No images match your filters."
          subtitle="Try a different filter or clear the search."
        />
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext
            items={visibleItems.map((i) => i.id)}
            strategy={rectSortingStrategy}
            disabled={!canReorder}
          >
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {visibleItems.map((item) => (
                <GalleryCard key={item.id} item={item} onClick={() => onSelect(item)} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      {!canReorder && visibleItems.length > 1 && (
        <p className="text-xs text-gray-500 text-center">
          Drag to reorder is available when viewing All without a search filter.
        </p>
      )}
    </div>
  )
}

function GridSkeleton() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="aspect-square bg-gray-100 animate-pulse" />
          <div className="p-3">
            <div className="h-3 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-full bg-temple-cream flex items-center justify-center mb-4">
        <ImageIcon className="w-8 h-8 text-temple-maroon/60" />
      </div>
      <p className="text-lg font-semibold text-temple-maroon mb-1">{title}</p>
      <p className="text-sm text-gray-600">{subtitle}</p>
    </div>
  )
}
