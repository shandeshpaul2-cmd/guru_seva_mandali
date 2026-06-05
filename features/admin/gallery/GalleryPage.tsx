'use client'

import { useCallback, useEffect, useState } from 'react'
import { Upload as UploadIcon, Image as ImageIcon } from 'lucide-react'
import { EditDrawer } from './EditDrawer'
import { ManageTab } from './ManageTab'
import { UploadTab } from './UploadTab'
import type { GalleryItem } from './types'

type Tab = 'upload' | 'manage'

export default function GalleryPage() {
  const [tab, setTab] = useState<Tab>('upload')
  const [items, setItems] = useState<GalleryItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [selected, setSelected] = useState<GalleryItem | null>(null)

  const loadItems = useCallback(async () => {
    setIsLoading(true)
    setLoadError(null)
    try {
      const res = await fetch('/api/admin/gallery', { cache: 'no-store' })
      if (!res.ok) throw new Error('Failed to load gallery')
      const data: GalleryItem[] = await res.json()
      setItems(data)
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load gallery')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    void loadItems()
  }, [loadItems])

  const handleUploaded = useCallback((item: GalleryItem) => {
    setItems((prev) => {
      if (prev.some((p) => p.id === item.id)) return prev
      return [...prev, item].sort((a, b) => a.sortOrder - b.sortOrder)
    })
  }, [])

  const handleReorder = useCallback((next: GalleryItem[]) => {
    setItems(next.map((item, idx) => ({ ...item, sortOrder: idx })))
  }, [])

  const handleSaved = useCallback((updated: GalleryItem) => {
    setItems((prev) => prev.map((p) => (p.id === updated.id ? { ...p, ...updated } : p)))
  }, [])

  const handleDeleted = useCallback((id: string) => {
    setItems((prev) => prev.filter((p) => p.id !== id))
  }, [])

  const publishedCount = items.filter((i) => i.isPublished).length

  return (
    <div className="min-h-screen bg-gradient-to-b from-temple-cream/30 to-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <header className="mb-8">
          <h1 className="font-cinzel text-3xl sm:text-4xl text-temple-maroon">Gallery</h1>
          <p className="mt-1 text-sm text-gray-600">
            {items.length} {items.length === 1 ? 'item' : 'items'} · {publishedCount} published
          </p>
        </header>

        <div className="flex items-center gap-1 mb-6 border-b border-gray-200">
          <TabButton
            active={tab === 'upload'}
            onClick={() => setTab('upload')}
            icon={<UploadIcon className="w-4 h-4" />}
            label="Upload"
          />
          <TabButton
            active={tab === 'manage'}
            onClick={() => setTab('manage')}
            icon={<ImageIcon className="w-4 h-4" />}
            label={`Manage Library (${items.length})`}
          />
        </div>

        {loadError && tab === 'manage' && (
          <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
            {loadError}
          </div>
        )}

        {tab === 'upload' ? (
          <UploadTab onUploaded={handleUploaded} onGoToLibrary={() => setTab('manage')} />
        ) : (
          <ManageTab
            items={items}
            isLoading={isLoading}
            onReorder={handleReorder}
            onSelect={setSelected}
          />
        )}
      </div>

      {selected && (
        <EditDrawer
          item={selected}
          onClose={() => setSelected(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  )
}

interface TabButtonProps {
  active: boolean
  onClick: () => void
  icon: React.ReactNode
  label: string
}

function TabButton({ active, onClick, icon, label }: TabButtonProps) {
  return (
    <button
      onClick={onClick}
      className={`
        relative inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold transition-colors
        ${active ? 'text-temple-maroon' : 'text-gray-500 hover:text-temple-maroon'}
      `}
    >
      {icon}
      {label}
      <span
        className={`
          absolute bottom-0 left-0 right-0 h-0.5 rounded-t bg-temple-gold transition-opacity
          ${active ? 'opacity-100' : 'opacity-0'}
        `}
      />
    </button>
  )
}
