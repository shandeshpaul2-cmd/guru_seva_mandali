'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'

interface Admin {
  name: string
  email: string
}

interface AdminAuthContextType {
  isAdmin: boolean
  admin: Admin | null
  login: (password: string) => boolean
  logout: () => void
  isLoading: boolean
}

const AdminAuthContext = createContext<AdminAuthContextType | undefined>(undefined)

export function useAdminAuth() {
  const context = useContext(AdminAuthContext)
  if (context === undefined) {
    throw new Error('useAdminAuth must be used within AdminAuthProvider')
  }
  return context
}

interface AdminAuthProviderProps {
  children: ReactNode
}

export function AdminAuthProvider({ children }: AdminAuthProviderProps) {
  const [isAdmin, setIsAdmin] = useState(false)
  const [admin, setAdmin] = useState<Admin | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if admin session exists on mount
    const adminSession = localStorage.getItem('adminSession')
    if (adminSession === 'true') {
      setIsAdmin(true)
      setAdmin({
        name: 'Admin',
        email: 'admin@temple.com'
      })
    }
    setIsLoading(false)
  }, [])

  const login = (password: string): boolean => {
    // Simple password authentication (in production, this should be more secure)
    const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD

    if (!ADMIN_PASSWORD) {
      console.error('Admin password not configured in environment variables')
      return false
    }

    if (password === ADMIN_PASSWORD) {
      setIsAdmin(true)
      setAdmin({
        name: 'Admin',
        email: 'admin@temple.com'
      })
      localStorage.setItem('adminSession', 'true')
      return true
    }
    return false
  }

  const logout = () => {
    setIsAdmin(false)
    setAdmin(null)
    localStorage.removeItem('adminSession')
  }

  const value: AdminAuthContextType = {
    isAdmin,
    admin,
    login,
    logout,
    isLoading
  }

  return (
    <AdminAuthContext.Provider value={value}>
      {children}
    </AdminAuthContext.Provider>
  )
}