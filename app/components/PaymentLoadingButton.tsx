'use client'

import React, { useState } from 'react'

interface PaymentLoadingButtonProps {
  children: React.ReactNode
  onClick?: () => void
  className?: string
  disabled?: boolean
  loadingText?: string
  type?: 'button' | 'submit' | 'reset'
}

export default function PaymentLoadingButton({
  children,
  onClick,
  className = '',
  disabled = false,
  loadingText = 'Processing Payment...',
  type = 'button'
}: PaymentLoadingButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async () => {
    if (isLoading || disabled) return

    setIsLoading(true)
    try {
      if (onClick) {
        await onClick()
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={disabled || isLoading}
      className={`
        relative inline-flex items-center justify-center px-6 py-3 border border-transparent
        text-base font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700
        focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500
        disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200
        ${className}
      `}
    >
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          {loadingText}
        </>
      ) : (
        children
      )}
    </button>
  )
}