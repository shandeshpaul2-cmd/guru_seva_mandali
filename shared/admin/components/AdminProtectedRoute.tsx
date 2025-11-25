'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAdminAuth } from '@/shared/admin/contexts/AdminAuthContext'

interface AdminProtectedRouteProps {
  children: React.ReactNode
}

export default function AdminProtectedRoute({ children }: AdminProtectedRouteProps) {
  const { admin, isLoading } = useAdminAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && !admin) {
      router.push('/admin/login')
    }
  }, [admin, isLoading, router])

  // Show loading spinner
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-temple-maroon"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!admin) {
    return null
  }

  return <>{children}</>
}