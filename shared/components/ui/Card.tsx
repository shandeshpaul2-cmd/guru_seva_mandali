import React from 'react'

interface CardProps {
  children: React.ReactNode
  className?: string
  hoverable?: boolean
  noPadding?: boolean
}

export function Card({ children, className = '', hoverable = false, noPadding = false }: CardProps) {
  return (
    <div
      className={`
        bg-white rounded-2xl shadow-lg border-2 border-transparent transition-all duration-300
        ${hoverable ? 'hover:border-temple-gold hover:-translate-y-2 hover:shadow-2xl cursor-pointer' : ''}
        ${noPadding ? '' : 'p-6 sm:p-8'}
        ${className}
      `}
    >
      {children}
    </div>
  )
}

interface CardHeaderProps {
  children: React.ReactNode
  className?: string
}

export function CardHeader({ children, className = '' }: CardHeaderProps) {
  return (
    <div className={`mb-6 ${className}`}>
      {children}
    </div>
  )
}

interface CardTitleProps {
  children: React.ReactNode
  className?: string
}

export function CardTitle({ children, className = '' }: CardTitleProps) {
  return (
    <h3 className={`font-cinzel text-2xl font-bold text-temple-maroon ${className}`}>
      {children}
    </h3>
  )
}

interface CardDescriptionProps {
  children: React.ReactNode
  className?: string
}

export function CardDescription({ children, className = '' }: CardDescriptionProps) {
  return (
    <p className={`text-gray-600 mt-2 ${className}`}>
      {children}
    </p>
  )
}

interface CardContentProps {
  children: React.ReactNode
  className?: string
}

export function CardContent({ children, className = '' }: CardContentProps) {
  return (
    <div className={className}>
      {children}
    </div>
  )
}

interface CardFooterProps {
  children: React.ReactNode
  className?: string
}

export function CardFooter({ children, className = '' }: CardFooterProps) {
  return (
    <div className={`mt-6 pt-6 border-t border-gray-200 ${className}`}>
      {children}
    </div>
  )
}
