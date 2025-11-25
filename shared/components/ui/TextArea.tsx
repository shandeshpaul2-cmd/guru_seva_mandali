import React from 'react'

interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  error?: string
  helperText?: string
}

export const TextArea = React.forwardRef<HTMLTextAreaElement, TextAreaProps>(
  ({ label, error, helperText, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {label}
            {props.required && <span className="text-red-500 ml-1">*</span>}
          </label>
        )}

        <textarea
          ref={ref}
          className={`
            w-full px-4 py-3 rounded-lg border-2 transition-all resize-y min-h-[100px]
            ${error
              ? 'border-red-500 focus:border-red-500 focus:ring-red-500/20'
              : 'border-gray-200 focus:border-temple-gold focus:ring-temple-gold/20'
            }
            focus:outline-none focus:ring-2
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="mt-1.5 text-sm text-red-500 flex items-center gap-1">
            <span>⚠️</span>
            {error}
          </p>
        )}

        {helperText && !error && (
          <p className="mt-1.5 text-sm text-gray-500">
            {helperText}
          </p>
        )}
      </div>
    )
  }
)

TextArea.displayName = 'TextArea'
