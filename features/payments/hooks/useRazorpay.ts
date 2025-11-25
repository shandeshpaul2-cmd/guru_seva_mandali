import { useEffect, useState } from 'react'

interface RazorpayOptions {
  key: string
  amount: number
  currency: string
  name: string
  description: string
  order_id: string
  prefill: {
    name: string
    email?: string
    contact: string
  }
  theme: {
    color: string
  }
  handler: (response: any) => void
  modal: {
    ondismiss: () => void
  }
}

declare global {
  interface Window {
    Razorpay: any
  }
}

export function useRazorpay() {
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    // Load Razorpay script
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true
    script.onload = () => setIsLoaded(true)
    script.onerror = () => {
      console.error('Failed to load Razorpay SDK')
    }
    document.body.appendChild(script)

    return () => {
      // Cleanup
      document.body.removeChild(script)
    }
  }, [])

  const openRazorpay = (options: RazorpayOptions) => {
    if (!isLoaded) {
      console.error('Razorpay SDK not loaded yet')
      return
    }

    const razorpay = new window.Razorpay(options)
    razorpay.open()
  }

  return { isLoaded, openRazorpay }
}
