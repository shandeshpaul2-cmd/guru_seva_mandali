import React from 'react'

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function Spinner({ size = 'md', className = '' }: SpinnerProps) {
  const sizes = {
    sm: 'w-6 h-6 border-2',
    md: 'w-12 h-12 border-4',
    lg: 'w-16 h-16 border-4'
  }

  return (
    <div
      className={`
        border-temple-cream border-t-temple-maroon rounded-full animate-spin
        ${sizes[size]}
        ${className}
      `}
    />
  )
}

interface LoadingOverlayProps {
  message?: string
}

export function LoadingOverlay({ message = 'Loading...' }: LoadingOverlayProps) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-8 flex flex-col items-center gap-4 shadow-2xl">
        <Spinner size="lg" />
        <p className="text-lg font-medium text-gray-700">{message}</p>
      </div>
    </div>
  )
}
