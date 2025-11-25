import React from 'react'

interface BadgeProps {
  children: React.ReactNode
  variant?: 'default' | 'success' | 'warning' | 'error' | 'info'
  className?: string
}

export function Badge({ children, variant = 'default', className = '' }: BadgeProps) {
  const variants = {
    default: 'bg-gradient-to-r from-temple-gold to-yellow-400 text-temple-maroon',
    success: 'bg-green-100 text-green-800 border border-green-200',
    warning: 'bg-yellow-100 text-yellow-800 border border-yellow-200',
    error: 'bg-red-100 text-red-800 border border-red-200',
    info: 'bg-blue-100 text-blue-800 border border-blue-200'
  }

  return (
    <span
      className={`
        inline-block px-3 py-1 text-xs font-bold rounded-full uppercase tracking-wide
        ${variants[variant]}
        ${className}
      `}
    >
      {children}
    </span>
  )
}
