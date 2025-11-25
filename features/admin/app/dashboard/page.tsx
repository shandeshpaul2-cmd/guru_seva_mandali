'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Home,
  Users,
  Calendar,
  DollarSign,
  Activity,
  LogOut,
  BookOpen,
  Heart,
  BarChart3,
  Clock,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'
import { useAdminAuth } from '@/shared/admin/contexts/AdminAuthContext'

interface DashboardData {
  overview: {
    totalDonations: number
    todayDonations: number
    weekDonations: number
    monthDonations: number
    yearDonations: number
    totalBookings: number
    todayBookings: number
    weekBookings: number
    monthBookings: number
    yearBookings: number
    totalRevenue: number
    todayRevenue: number
    weekRevenue: number
    monthRevenue: number
    yearRevenue: number
  }
  recentActivities: {
    donations: Array<{
      id: string
      receiptNumber: string
      amount: number
      donationType: string
      paymentStatus: string
      createdAt: string
      user?: {
        name: string
        phone: string
      }
    }>
    bookings: Array<{
      id: string
      bookingNumber: string
      receiptNumber?: string
      poojaName: string
      poojaPrice: number
      bookingStatus: string
      paymentStatus: string
      createdAt: string
      userName?: string
      userPhone?: string
      preferredDate?: string
    }>
  }
  topPoojas: Array<{
    poojaName: string
    poojaId: number
    _count: { id: number }
  }>
  donationTypes: Array<{
    donationType: string
    _count: { id: number }
    _sum: { amount: number }
  }>
}

export default function AdminDashboard() {
  const { logout } = useAdminAuth()
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/admin/dashboard')
      if (response.ok) {
        const data = await response.json()
        setDashboardData(data)
        setLastRefresh(new Date())
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const StatCard = ({ title, value, icon: Icon, color }: any) => (
    <div className="bg-white rounded-lg shadow-sm p-2 border border-gray-100">
      <div className="flex items-center justify-between">
        <div className={`p-1 rounded-lg ${color}`}>
          <Icon className="w-2.5 h-2.5 text-white" />
        </div>
      </div>
      <div className="mt-1">
        <p className="text-gray-600 text-xs leading-tight">{title}</p>
        <p className="text-sm font-bold text-gray-900">{value}</p>
      </div>
    </div>
  )

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-gray-300 border-t-gray-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-temple-maroon">Dashboard</h1>
          <p className="text-sm text-gray-600 mt-1">Manage temple bookings and donations</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs text-gray-500">{lastRefresh.toLocaleTimeString()}</span>
          <button
            onClick={fetchDashboardData}
            className="p-2 text-temple-maroon hover:text-temple-gold transition-colors hover:bg-temple-cream/50 rounded-lg border border-temple-gold/20"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div>
        {/* Quick Stats Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-4 mb-4 sm:mb-8">
          <div className="bg-white rounded-xl shadow-sm border border-temple-gold/20 p-3 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-temple-cream/50 rounded-lg flex items-center justify-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-temple-maroon" />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs sm:text-sm mb-1">Donations</h3>
            <p className="text-lg sm:text-2xl font-bold text-temple-maroon">{dashboardData?.overview.totalDonations || 0}</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Lifetime contributions</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-temple-gold/20 p-3 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-temple-cream/50 rounded-lg flex items-center justify-center">
                <Calendar className="w-4 h-4 sm:w-5 sm:h-5 text-temple-maroon" />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs sm:text-sm mb-1">Bookings</h3>
            <p className="text-lg sm:text-2xl font-bold text-temple-maroon">{dashboardData?.overview.totalBookings || 0}</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">Pooja ceremonies</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-temple-gold/20 p-3 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-temple-cream/50 rounded-lg flex items-center justify-center">
                <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 text-temple-maroon" />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs sm:text-sm mb-1">Revenue</h3>
            <p className="text-base sm:text-2xl font-bold text-temple-maroon">{formatCurrency(dashboardData?.overview.totalRevenue || 0)}</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">All time collections</p>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-temple-gold/20 p-3 sm:p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-2 sm:mb-4">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-temple-cream/50 rounded-lg flex items-center justify-center">
                <Activity className="w-4 h-4 sm:w-5 sm:h-5 text-temple-maroon" />
              </div>
            </div>
            <h3 className="text-gray-600 text-xs sm:text-sm mb-1">Today</h3>
            <p className="text-lg sm:text-2xl font-bold text-temple-maroon">{(dashboardData?.overview.todayDonations || 0) + (dashboardData?.overview.todayBookings || 0)}</p>
            <p className="text-xs text-gray-500 mt-1 hidden sm:block">New today</p>
          </div>
        </div>

        {/* Management Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-6 mb-4 sm:mb-8">
          <Link
            href="/admin/bookings"
            className="group bg-white rounded-xl shadow-sm border border-temple-gold/20 p-4 sm:p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-temple-cream/50 rounded-lg flex items-center justify-center">
                <BookOpen className="w-5 h-5 sm:w-6 sm:h-6 text-temple-maroon" />
              </div>
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-temple-maroon">{dashboardData?.overview.totalBookings}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total bookings</p>
              </div>
            </div>
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-temple-maroon mb-1 sm:mb-2">Pooja Bookings</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 hidden sm:block">View, confirm, and manage temple pooja ceremonies</p>
            <div className="flex items-center text-temple-maroon font-semibold group-hover:text-temple-gold text-sm sm:text-base">
              Manage Bookings
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>

          <Link
            href="/admin/donations"
            className="group bg-white rounded-xl shadow-sm border border-temple-gold/20 p-4 sm:p-6 hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-temple-cream/50 rounded-lg flex items-center justify-center">
                <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-temple-maroon" />
              </div>
              <div className="text-right">
                <p className="text-xl sm:text-2xl font-bold text-temple-maroon">{dashboardData?.overview.totalDonations}</p>
                <p className="text-xs sm:text-sm text-gray-600">Total donations</p>
              </div>
            </div>
            <h3 className="font-cinzel text-base sm:text-lg font-bold text-temple-maroon mb-1 sm:mb-2">Donations</h3>
            <p className="text-xs sm:text-sm text-gray-600 mb-2 sm:mb-4 hidden sm:block">Track donations, generate receipts, and manage donor info</p>
            <div className="flex items-center text-temple-maroon font-semibold group-hover:text-temple-gold text-sm sm:text-base">
              Manage Donations
              <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2 group-hover:translate-x-1 transition-transform" />
            </div>
          </Link>
        </div>

        {/* Recent Activities */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6">
          {/* Recent Bookings */}
          <div className="bg-white rounded-xl shadow-sm border border-temple-gold/20 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-sm sm:text-base text-temple-maroon">Recent Bookings</h3>
              <Link
                href="/admin/bookings"
                className="text-xs sm:text-sm text-temple-maroon hover:text-temple-gold transition-colors font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {dashboardData?.recentActivities.bookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-temple-cream/30 rounded-lg border border-temple-gold/10">
                  <div className="flex-shrink-0 mt-0.5">
                    {booking.paymentStatus === 'SUCCESS' ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-temple-maroon" />
                    ) : (
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-temple-gold/60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-temple-maroon line-clamp-1">{booking.poojaName}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {booking.userName || booking.userPhone || 'Anonymous'}
                    </p>
                    {booking.preferredDate && (
                      <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                        <Clock className="w-3 h-3 inline mr-1" />
                        {new Date(booking.preferredDate).toLocaleDateString('en-IN')}
                      </p>
                    )}
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-xs sm:text-sm text-temple-maroon">
                      {formatCurrency(booking.poojaPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Donations */}
          <div className="bg-white rounded-xl shadow-sm border border-temple-gold/20 p-3 sm:p-6">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <h3 className="font-semibold text-sm sm:text-base text-temple-maroon">Recent Donations</h3>
              <Link
                href="/admin/donations"
                className="text-xs sm:text-sm text-temple-maroon hover:text-temple-gold transition-colors font-medium"
              >
                View all →
              </Link>
            </div>
            <div className="space-y-2 sm:space-y-3">
              {dashboardData?.recentActivities.donations.slice(0, 3).map((donation) => (
                <div key={donation.id} className="flex items-start gap-2 sm:gap-3 p-2 sm:p-3 bg-temple-cream/30 rounded-lg border border-temple-gold/10">
                  <div className="flex-shrink-0 mt-0.5">
                    {donation.paymentStatus === 'SUCCESS' ? (
                      <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-temple-maroon" />
                    ) : (
                      <AlertCircle className="w-3 h-3 sm:w-4 sm:h-4 text-temple-gold/60" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-xs sm:text-sm text-temple-maroon line-clamp-1">{donation.donationType}</p>
                    <p className="text-xs text-gray-600 truncate">
                      {donation.user?.name || donation.user?.phone || 'Anonymous'}
                    </p>
                    <p className="text-xs text-gray-500 mt-0.5 hidden sm:block">
                      Receipt: {donation.receiptNumber}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-bold text-xs sm:text-sm text-temple-maroon">
                      {formatCurrency(donation.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}