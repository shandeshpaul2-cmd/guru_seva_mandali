'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Heart,
  Calendar,
  Image as ImageIcon,
  LogOut,
  Menu,
  X
} from 'lucide-react'
import { AdminAuthProvider, useAdminAuth } from '@/shared/admin/contexts/AdminAuthContext'
import Footer from '@/shared/components/common/Footer'

interface AdminLayoutProps {
  children: React.ReactNode
}

function AdminLayoutContent({ children }: AdminLayoutProps) {
  const { isAdmin, admin, logout, isLoading } = useAdminAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isSidebarOpen, setIsSidebarOpen] = useState(false)

  // Check if we're on the login page
  const isLoginPage = pathname === '/admin/login'

  // Redirect to login if not authenticated (but not if already on login page)
  useEffect(() => {
    if (!isLoading && !isAdmin && !isLoginPage) {
      router.push('/admin/login')
    }
  }, [isAdmin, isLoading, isLoginPage, router])

  const handleLogout = () => {
    logout()
    router.push('/admin/login')
  }

  // If on login page, just render the children without admin layout
  if (isLoginPage) {
    return <>{children}</>
  }

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-temple-maroon"></div>
      </div>
    )
  }

  // Don't render anything if not authenticated (will redirect)
  if (!isAdmin) {
    return null
  }

  const menuItems = [
    {
      href: '/admin/dashboard',
      icon: LayoutDashboard,
      label: 'Dashboard',
    },
    {
      href: '/admin/donations',
      icon: Heart,
      label: 'Donations',
    },
    {
      href: '/admin/bookings',
      icon: Calendar,
      label: 'Pooja Bookings',
    },
    {
      href: '/admin/gallery',
      icon: ImageIcon,
      label: 'Gallery',
    },
  ]

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar backdrop */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:flex lg:flex-shrink-0
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full w-64">
          <div className="flex items-center justify-between h-16 px-6 border-b flex-shrink-0">
            <h1 className="text-xl font-bold text-gray-800">Admin Panel</h1>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 rounded-lg hover:bg-gray-100"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="mt-6 flex-1 overflow-y-auto">
            <div className="px-4">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="flex items-center gap-3 px-4 py-3 mb-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
                  onClick={() => setIsSidebarOpen(false)}
                >
                  <item.icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              ))}
            </div>
          </nav>

          {/* User info and logout */}
          <div className="p-4 border-t bg-white flex-shrink-0">
            <div className="mb-3">
              <p className="text-sm font-medium text-gray-900">{admin?.name}</p>
              <p className="text-xs text-gray-500">{admin?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 w-full px-4 py-2 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b flex-shrink-0">
          <div className="flex items-center justify-between h-16 px-6">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">
                Welcome back, {admin?.name}
              </span>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 overflow-y-auto">
          {children}
        </main>

        {/* Footer */}
        <Footer />
      </div>
    </div>
  )
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider>
      <AdminLayoutContent>
        {children}
      </AdminLayoutContent>
    </AdminAuthProvider>
  )
}