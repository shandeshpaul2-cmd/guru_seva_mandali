'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Lock, Shield, AlertCircle } from 'lucide-react'
import { useAdminAuth } from '@/shared/admin/contexts/AdminAuthContext'
import { Button } from '@/shared/components/ui'

export default function AdminLoginPage() {
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const { login, isAdmin, isLoading: authLoading } = useAdminAuth()
  const router = useRouter()

  // Redirect if already logged in using useEffect
  useEffect(() => {
    if (isAdmin && !authLoading) {
      router.push('/admin/dashboard')
    }
  }, [isAdmin, authLoading, router])

  // Show loading or null while checking auth status
  if (authLoading || isAdmin) {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const success = login(password)
      if (success) {
        router.push('/admin/dashboard')
      } else {
        setError('Invalid password. Please try again.')
        setPassword('')
      }
    } catch (error) {
      setError('Login failed. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-temple-cream via-white to-orange-50 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Compact Login Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-temple-gold/20 overflow-hidden">
          {/* Header */}
          <div className="bg-gradient-to-r from-temple-maroon to-temple-gold p-6 text-center">
            <div className="w-12 h-12 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <h1 className="font-cinzel text-xl font-bold text-white mb-1">
              Admin Login
            </h1>
            <p className="text-white/90 text-xs">
              Sri Raghavendra Swamy Brundavana Sannidhi
            </p>
          </div>

          {/* Form */}
          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="password" className="block text-xs font-medium text-gray-700 mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                    <Lock className="h-4 w-4 text-gray-400" />
                  </div>
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-9 pr-10 py-2.5 text-sm border rounded-lg focus:ring-1 focus:ring-temple-gold focus:border-temple-gold transition-colors ${
                      error ? 'border-red-500' : 'border-gray-200'
                    }`}
                    placeholder="Enter password"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    ) : (
                      <Eye className="h-4 w-4 text-gray-400 hover:text-gray-600" />
                    )}
                  </button>
                </div>
                {error && (
                  <div className="mt-1.5 flex items-center gap-1.5 text-red-600 text-xs">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {error}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                disabled={isLoading || !password}
                className="w-full bg-gradient-to-r from-temple-maroon to-temple-gold text-white py-2.5 rounded-lg font-medium text-sm hover:shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? 'Signing in...' : 'Sign In'}
              </Button>
            </form>

            {/* Back Link */}
            <div className="mt-4 text-center">
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-xs text-temple-maroon hover:text-temple-gold transition-colors"
              >
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Simple Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Protected by divine grace
          </p>
        </div>
      </div>
    </div>
  )
}