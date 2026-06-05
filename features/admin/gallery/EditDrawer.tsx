'use client'

import { useEffect, useState } from 'react'
import { X, Trash2, Eye, EyeOff } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import type { GalleryItem } from './types'
import { formatBytes, formatDate } from './utils'

interface EditDrawerProps {
  item: GalleryItem
  onClose: () => void
  onSaved: (item: GalleryItem) => void
  onDeleted: (id: string) => void
}

export function EditDrawer({ item, onClose, onSaved, onDeleted }: EditDrawerProps) {
  const [caption, setCaption] = useState(item.caption ?? '')
  const [isPublished, setIsPublished] = useState(item.isPublished)
  const [isSaving, setIsSaving] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setCaption(item.caption ?? '')
    setIsPublished(item.isPublished)
    setConfirmDelete(false)
    setError(null)
  }, [item.id, item.caption, item.isPublished])

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const handleSave = async () => {
    setIsSaving(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caption: caption.trim() || null, isPublished }),
      })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to save changes')
      }
      const updated: GalleryItem = await res.json()
      onSaved(updated)
      toast.success('Changes saved')
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to save'
      setError(message)
      toast.error(message)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    setIsDeleting(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/gallery/${item.id}`, { method: 'DELETE' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        throw new Error(data?.error ?? 'Failed to delete image')
      }
      onDeleted(item.id)
      toast.success('Image deleted')
      onClose()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete'
      setError(message)
      toast.error(message)
      setIsDeleting(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in"
        onClick={onClose}
        aria-hidden
      />
      <div className="relative ml-auto w-full sm:w-[400px] h-full bg-white shadow-2xl flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200">
          <h2 className="font-cinzel text-lg text-temple-maroon">Edit Image</h2>
          <button
            onClick={onClose}
            className="p-1.5 rounded-md text-gray-500 hover:text-gray-900 hover:bg-gray-100"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">
          <div className="rounded-xl overflow-hidden bg-gray-100 border border-gray-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={item.fullUrl}
              alt={item.caption ?? ''}
              className="w-full h-auto object-contain max-h-[360px]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Caption</label>
            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Add a caption (optional)"
              rows={3}
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-temple-gold focus:ring-2 focus:ring-temple-gold/20 focus:outline-none transition-all resize-none text-sm"
            />
          </div>

          <div className="flex items-center justify-between p-3 bg-temple-cream/40 rounded-lg">
            <div className="flex items-center gap-2">
              {isPublished ? (
                <Eye className="w-4 h-4 text-temple-maroon" />
              ) : (
                <EyeOff className="w-4 h-4 text-gray-500" />
              )}
              <span className="text-sm font-medium text-gray-800">
                {isPublished ? 'Published' : 'Hidden'}
              </span>
            </div>
            <button
              type="button"
              onClick={() => setIsPublished((v) => !v)}
              className={`
                relative w-11 h-6 rounded-full transition-colors
                ${isPublished ? 'bg-temple-maroon' : 'bg-gray-300'}
              `}
              aria-label="Toggle published"
            >
              <span
                className={`
                  absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform
                  ${isPublished ? 'translate-x-5' : 'translate-x-0'}
                `}
              />
            </button>
          </div>

          <dl className="grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div>
              <dt className="font-medium text-gray-500">Dimensions</dt>
              <dd className="mt-0.5 text-gray-900">
                {item.width} × {item.height}
              </dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Size</dt>
              <dd className="mt-0.5 text-gray-900">{formatBytes(item.bytes)}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Format</dt>
              <dd className="mt-0.5 text-gray-900 uppercase">{item.format}</dd>
            </div>
            <div>
              <dt className="font-medium text-gray-500">Uploaded</dt>
              <dd className="mt-0.5 text-gray-900">{formatDate(item.uploadedAt)}</dd>
            </div>
          </dl>

          {error && (
            <div className="px-3 py-2 rounded-md bg-red-50 border border-red-200 text-sm text-red-700">
              {error}
            </div>
          )}
        </div>

        <div className="border-t border-gray-200 px-5 py-4 space-y-3">
          <Button
            variant="primary"
            size="md"
            className="w-full"
            isLoading={isSaving}
            onClick={handleSave}
          >
            Save Changes
          </Button>
          {confirmDelete ? (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                className="flex-1"
                onClick={() => setConfirmDelete(false)}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <button
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-semibold bg-red-600 text-white hover:bg-red-700 transition-colors disabled:opacity-50"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? 'Deleting...' : 'Confirm Delete'}
              </button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-full text-sm font-semibold text-red-600 border-2 border-red-200 hover:bg-red-50 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete Image
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
