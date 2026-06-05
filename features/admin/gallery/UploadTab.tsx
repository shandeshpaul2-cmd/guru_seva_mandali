'use client'

import { useCallback, useRef, useState } from 'react'
import { Upload, Check, AlertCircle, ArrowRight, X } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/shared/components/ui/Button'
import type { GalleryItem, SignResponse, UploadJob } from './types'
import {
  ACCEPTED_MIME,
  formatBytes,
  generateBlurPlaceholder,
  readPreviewUrl,
  validateFile,
} from './utils'

const MAX_CONCURRENT = 3

interface UploadTabProps {
  onUploaded: (item: GalleryItem) => void
  onGoToLibrary: () => void
}

export function UploadTab({ onUploaded, onGoToLibrary }: UploadTabProps) {
  const [jobs, setJobs] = useState<UploadJob[]>([])
  const [isDragOver, setIsDragOver] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const queueRef = useRef<UploadJob[]>([])
  const activeCountRef = useRef(0)
  const onUploadedRef = useRef(onUploaded)
  onUploadedRef.current = onUploaded

  const updateJob = useCallback((id: string, patch: Partial<UploadJob>) => {
    setJobs((prev) => prev.map((j) => (j.id === id ? { ...j, ...patch } : j)))
  }, [])

  const pump = useCallback(() => {
    const processJob = async (job: UploadJob) => {
      try {
        updateJob(job.id, { status: 'uploading', progress: 5 })

        const blurPlaceholder = await generateBlurPlaceholder(job.file).catch(() => '')
        updateJob(job.id, { progress: 15 })

        const signRes = await fetch('/api/admin/gallery/sign', { method: 'POST' })
        if (!signRes.ok) {
          const data = await signRes.json().catch(() => null)
          throw new Error(data?.error ?? 'Failed to obtain upload signature')
        }
        const sign: SignResponse = await signRes.json()
        updateJob(job.id, { progress: 25 })

        const cloudData = await uploadToCloudinary(job, sign, (pct) => {
          const scaled = 25 + Math.round(pct * 0.65)
          updateJob(job.id, { progress: scaled })
        })

        updateJob(job.id, { status: 'saving', progress: 92 })

        const saveRes = await fetch('/api/admin/gallery', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cloudinaryId: cloudData.public_id,
            width: cloudData.width,
            height: cloudData.height,
            bytes: cloudData.bytes,
            format: cloudData.format,
            blurPlaceholder,
          }),
        })
        if (!saveRes.ok) {
          const data = await saveRes.json().catch(() => null)
          throw new Error(data?.error ?? 'Failed to save metadata')
        }
        const saved: GalleryItem = await saveRes.json()

        updateJob(job.id, { status: 'success', progress: 100, savedItem: saved })
        onUploadedRef.current(saved)
        toast.success(`Uploaded ${job.file.name}`)
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Upload failed'
        updateJob(job.id, {
          status: 'error',
          errorMessage: message,
        })
        toast.error(message)
      } finally {
        activeCountRef.current -= 1
        pump()
      }
    }

    while (activeCountRef.current < MAX_CONCURRENT && queueRef.current.length > 0) {
      const next = queueRef.current.shift()
      if (!next) break
      activeCountRef.current += 1
      void processJob(next)
    }
  }, [updateJob])

  const enqueueFiles = useCallback(
    async (files: File[]) => {
      const newJobs: UploadJob[] = []
      for (const file of files) {
        const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
        const validationError = validateFile(file)
        let previewUrl = ''
        try {
          previewUrl = await readPreviewUrl(file)
        } catch {
          previewUrl = ''
        }
        newJobs.push({
          id,
          file,
          previewUrl,
          progress: 0,
          status: validationError ? 'error' : 'pending',
          errorMessage: validationError ?? undefined,
        })
      }
      setJobs((prev) => [...newJobs, ...prev])
      const ready = newJobs.filter((j) => j.status === 'pending')
      queueRef.current.push(...ready)
      pump()
    },
    [pump],
  )

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files.length > 0) {
      void enqueueFiles(Array.from(files))
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    setIsDragOver(false)
    const dropped = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith('image/'))
    if (dropped.length > 0) void enqueueFiles(dropped)
  }

  const removeJob = (id: string) => {
    setJobs((prev) => prev.filter((j) => j.id !== id))
  }

  const hasAnySuccess = jobs.some((j) => j.status === 'success')

  return (
    <div className="space-y-6">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setIsDragOver(true)
        }}
        onDragLeave={() => setIsDragOver(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        className={`
          relative flex flex-col items-center justify-center
          h-[300px] rounded-2xl border-2 border-dashed cursor-pointer
          transition-all duration-200
          ${
            isDragOver
              ? 'border-temple-gold bg-temple-cream/60 scale-[1.01]'
              : 'border-temple-maroon/30 bg-temple-cream/30 hover:border-temple-maroon/60 hover:bg-temple-cream/50'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPTED_MIME.join(',')}
          multiple
          className="hidden"
          onChange={handleFileInput}
        />
        <div className="w-16 h-16 rounded-full bg-temple-maroon/10 flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-temple-maroon" />
        </div>
        <p className="text-lg font-semibold text-temple-maroon mb-1">
          Drop images here or click to browse
        </p>
        <p className="text-sm text-gray-600">
          JPG, PNG, WEBP or GIF up to 10MB. Multiple files supported.
        </p>
      </div>

      {hasAnySuccess && (
        <div className="flex justify-end">
          <Button
            variant="secondary"
            size="sm"
            rightIcon={<ArrowRight className="w-4 h-4" />}
            onClick={onGoToLibrary}
          >
            Go to Library
          </Button>
        </div>
      )}

      {jobs.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-gray-700 uppercase tracking-wide">
            Recently uploaded in this session
          </h3>
          <div className="space-y-2">
            {jobs.map((job) => (
              <UploadCard key={job.id} job={job} onRemove={() => removeJob(job.id)} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function UploadCard({ job, onRemove }: { job: UploadJob; onRemove: () => void }) {
  const statusColor =
    job.status === 'success'
      ? 'bg-green-500'
      : job.status === 'error'
        ? 'bg-red-500'
        : 'bg-temple-gold'

  return (
    <div className="flex items-center gap-4 p-3 bg-white border border-gray-200 rounded-xl">
      <div className="w-14 h-14 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
        {job.previewUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={job.previewUrl} alt={job.file.name} className="w-full h-full object-cover" />
        ) : null}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2 mb-1">
          <p className="text-sm font-medium text-gray-900 truncate">{job.file.name}</p>
          <span className="text-xs text-gray-500 flex-shrink-0">{formatBytes(job.file.size)}</span>
        </div>
        {job.status === 'error' ? (
          <div className="flex items-center gap-1.5 text-xs text-red-600">
            <AlertCircle className="w-3.5 h-3.5" />
            <span>{job.errorMessage ?? 'Upload failed'}</span>
          </div>
        ) : job.status === 'success' ? (
          <div className="flex items-center gap-1.5 text-xs text-green-600">
            <Check className="w-3.5 h-3.5" />
            <span>Uploaded successfully</span>
          </div>
        ) : (
          <div className="space-y-1">
            <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full ${statusColor} transition-all duration-300`}
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <p className="text-xs text-gray-500">
              {job.status === 'pending'
                ? 'Queued'
                : job.status === 'saving'
                  ? 'Saving metadata'
                  : `Uploading ${job.progress}%`}
            </p>
          </div>
        )}
      </div>
      <button
        onClick={onRemove}
        className="p-1 text-gray-400 hover:text-gray-700 transition-colors"
        aria-label="Remove"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  )
}

interface CloudinaryResult {
  public_id: string
  width: number
  height: number
  bytes: number
  format: string
  secure_url: string
}

function uploadToCloudinary(
  job: UploadJob,
  sign: SignResponse,
  onProgress: (pct: number) => void,
): Promise<CloudinaryResult> {
  return new Promise((resolve, reject) => {
    const url = `https://api.cloudinary.com/v1_1/${sign.cloudName}/image/upload`
    const formData = new FormData()
    formData.append('file', job.file)
    formData.append('api_key', sign.apiKey)
    formData.append('timestamp', sign.timestamp.toString())
    formData.append('signature', sign.signature)
    formData.append('folder', sign.folder)
    formData.append('transformation', sign.transformation)

    const xhr = new XMLHttpRequest()
    xhr.open('POST', url)
    xhr.upload.onprogress = (evt) => {
      if (evt.lengthComputable) {
        onProgress(Math.round((evt.loaded / evt.total) * 100))
      }
    }
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText) as CloudinaryResult)
        } catch {
          reject(new Error('Invalid Cloudinary response'))
        }
      } else {
        reject(new Error(`Cloudinary upload failed (${xhr.status})`))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(formData)
  })
}
