import React from 'react'
import { Loader2 } from 'lucide-react'

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  children: React.ReactNode
}

export function Button({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  leftIcon,
  rightIcon,
  children,
  className = '',
  disabled,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center gap-2 font-semibold rounded-full transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed'

  const variants = {
    primary: 'bg-gradient-to-r from-temple-maroon to-red-800 text-white hover:shadow-xl hover:scale-105 active:scale-95',
    secondary: 'bg-gradient-to-r from-temple-gold to-yellow-500 text-temple-maroon hover:shadow-lg hover:scale-105 active:scale-95',
    outline: 'border-2 border-temple-maroon text-temple-maroon hover:bg-temple-maroon hover:text-white',
    ghost: 'text-temple-maroon hover:bg-temple-cream'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm',
    md: 'px-6 py-3 text-base',
    lg: 'px-8 py-4 text-lg'
  }

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="w-5 h-5 animate-spin" />
      ) : leftIcon}
      {children}
      {!isLoading && rightIcon}
    </button>
  )
}
