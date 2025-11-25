'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  Search,
  Calendar,
  User,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  Eye,
  MoreVertical,
  RefreshCw,
  Heart
} from 'lucide-react'
import { useAdminAuth } from '@/shared/admin/contexts/AdminAuthContext'

interface Donation {
  id: string
  receiptNumber: string
  donationType: string
  donationPurpose?: string
  amount: number
  paymentStatus: string
  userName?: string
  userPhone?: string
  userEmail?: string
  pan?: string
  address?: string
  createdAt: string
  user?: {
    id: string
    name: string
    phone: string
    email?: string
  }
}

interface DonationsResponse {
  donations: Donation[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
  statusCounts: Record<string, { count: number; amount: number }>
  typeDistribution: Array<{
    donationType: string
    _count: { id: number }
    _sum: { amount: number }
  }>
  totals: {
    totalAmount: number
    successfulAmount: number
    pendingAmount: number
  }
}

export default function AdminDonations() {
  const { logout } = useAdminAuth()
  const [donations, setDonations] = useState<Donation[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [statusCounts, setStatusCounts] = useState<Record<string, { count: number; amount: number }>>({})
  const [typeDistribution, setTypeDistribution] = useState<DonationsResponse['typeDistribution']>([])
  const [totals, setTotals] = useState<DonationsResponse['totals']>({
    totalAmount: 0,
    successfulAmount: 0,
    pendingAmount: 0
  })
  const [selectedDonation, setSelectedDonation] = useState<Donation | null>(null)
  const [showActionModal, setShowActionModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    fetchDonations()
  }, [currentPage, statusFilter, search, startDate, endDate])

  const fetchDonations = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString(),
        status: statusFilter,
        search: search,
        sortBy: 'createdAt',
        sortOrder: 'desc'
      })

      if (startDate) params.append('startDate', startDate)
      if (endDate) params.append('endDate', endDate)

      const response = await fetch(`/api/admin/donations?${params}`)
      if (response.ok) {
        const data: DonationsResponse = await response.json()
        setDonations(data.donations)
        setTotalPages(data.pagination.totalPages)
        setStatusCounts(data.statusCounts)
        setTypeDistribution(data.typeDistribution)
        setTotals(data.totals)
      }
    } catch (error) {
      console.error('Error fetching donations:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (donationId: string, action: string) => {
    try {
      const response = await fetch('/api/admin/donations', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          donationId,
          action
        })
      })

      if (response.ok) {
        fetchDonations() // Refresh the list
        setShowActionModal(false)
        setSelectedDonation(null)
      }
    } catch (error) {
      console.error('Error updating donation:', error)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return 'bg-green-100 text-green-800 border-green-200'
      case 'FAILED':
        return 'bg-red-100 text-red-800 border-red-200'
      case 'PENDING':
      default:
        return 'bg-yellow-100 text-yellow-800 border-yellow-200'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return <CheckCircle className="w-4 h-4" />
      case 'FAILED':
        return <XCircle className="w-4 h-4" />
      case 'PENDING':
      default:
        return <AlertCircle className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-IN')
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const clearFilters = () => {
    setSearch('')
    setStatusFilter('all')
    setStartDate('')
    setEndDate('')
    setCurrentPage(1)
  }

  return (
    <div>
      {/* Page Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-temple-maroon">Donations</h1>
          <p className="text-sm text-gray-600 mt-1">Track donations and manage donor information</p>
        </div>
        <button
          onClick={fetchDonations}
          className="p-2 text-temple-maroon hover:text-temple-gold transition-colors border border-temple-gold/20 hover:border-temple-gold/40 rounded-lg"
          title="Refresh"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-temple-gold/20 hover:border-temple-gold transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-temple-gold/20 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-temple-maroon" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Total Donations</p>
            <p className="text-lg sm:text-xl font-bold text-temple-maroon">
              {Object.values(statusCounts).reduce((sum, item) => sum + item.count, 0)}
            </p>
            <p className="text-xs text-gray-500">{formatCurrency(totals.totalAmount)}</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-temple-gold/20 hover:border-temple-gold transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Successful</p>
            <p className="text-lg sm:text-xl font-bold text-green-600">
              {statusCounts.SUCCESS?.count || 0}
            </p>
            <p className="text-xs text-gray-500">{formatCurrency(statusCounts.SUCCESS?.amount || 0)}</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-temple-gold/20 hover:border-temple-gold transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-amber-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Pending</p>
            <p className="text-lg sm:text-xl font-bold text-amber-600">
              {statusCounts.PENDING?.count || 0}
            </p>
            <p className="text-xs text-gray-500">{formatCurrency(statusCounts.PENDING?.amount || 0)}</p>
          </div>

          <div className="bg-white rounded-2xl sm:rounded-3xl p-3 sm:p-4 border border-temple-gold/20 hover:border-temple-gold transition-all duration-300 hover:shadow-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="w-8 h-8 sm:w-10 sm:h-10 bg-red-100 rounded-full flex items-center justify-center">
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600" />
              </div>
            </div>
            <p className="text-xs text-gray-600 mb-1">Failed</p>
            <p className="text-lg sm:text-xl font-bold text-red-600">
              {statusCounts.FAILED?.count || 0}
            </p>
            <p className="text-xs text-gray-500">{formatCurrency(statusCounts.FAILED?.amount || 0)}</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl sm:rounded-3xl p-4 sm:p-6 border border-temple-gold/20 hover:border-temple-gold transition-all duration-300 hover:shadow-lg mb-6">
          <div className="flex flex-col lg:flex-row gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search donor name, phone, receipt..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value)
                  setCurrentPage(1)
                }}
                className="w-full pl-10 pr-4 py-2 text-sm border border-temple-gold/20 rounded-xl focus:ring-2 focus:ring-temple-gold focus:border-temple-gold transition-all duration-200"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value)
                setCurrentPage(1)
              }}
              className="px-4 py-2 text-sm border border-temple-gold/20 rounded-xl focus:ring-2 focus:ring-temple-gold focus:border-temple-gold transition-all duration-200"
            >
              <option value="all">All Status</option>
              <option value="SUCCESS">Successful</option>
              <option value="PENDING">Pending</option>
              <option value="FAILED">Failed</option>
            </select>
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm border border-temple-gold/20 text-temple-maroon rounded-xl hover:bg-temple-cream transition-all duration-200"
            >
              Clear
            </button>
          </div>
        </div>

        {/* Donations List */}
        <div className="bg-white rounded-2xl sm:rounded-3xl border border-temple-gold/20 hover:border-temple-gold transition-all duration-300 hover:shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gradient-to-r from-temple-cream to-orange-50 border-b border-temple-gold/20">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-temple-maroon uppercase tracking-wider">
                    Details
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-temple-maroon uppercase tracking-wider">
                    Donor
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-temple-maroon uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-temple-maroon uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-temple-maroon uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center">
                      <div className="flex justify-center">
                        <div className="w-4 h-4 border-2 border-temple-maroon border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">Loading...</p>
                    </td>
                  </tr>
                ) : donations.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      <p className="text-sm font-medium">No donations found</p>
                    </td>
                  </tr>
                ) : (
                  donations.map((donation) => (
                    <tr key={donation.id} className="hover:bg-temple-cream/30 transition-colors">
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {donation.donationType}
                          </p>
                          <p className="text-xs text-gray-500">
                            {donation.receiptNumber}
                          </p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <p className="text-sm font-medium text-gray-900">
                            {donation.userName || 'Anonymous'}
                          </p>
                          <p className="text-xs text-gray-500">{donation.userPhone || 'N/A'}</p>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <p className="text-sm font-semibold text-green-600">
                          {formatCurrency(donation.amount)}
                        </p>
                      </td>
                      <td className="px-4 py-3">
                        <div className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(donation.paymentStatus)}`}>
                          {getStatusIcon(donation.paymentStatus)}
                          <span className="capitalize">{donation.paymentStatus}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => {
                              setSelectedDonation(donation)
                              setShowDetailsModal(true)
                            }}
                            className="p-1 text-gray-600 hover:text-temple-maroon transition-colors"
                            title="View Details"
                          >
                            <Eye className="w-3 h-3" />
                          </button>
                          {donation.paymentStatus === 'PENDING' && (
                            <button
                              onClick={() => {
                                setSelectedDonation(donation)
                                setShowActionModal(true)
                              }}
                              className="p-1 text-gray-600 hover:text-temple-maroon transition-colors"
                              title="Actions"
                            >
                              <MoreVertical className="w-3 h-3" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-xs text-gray-600">
              Showing {((currentPage - 1) * itemsPerPage) + 1} to{' '}
              {Math.min(currentPage * itemsPerPage, donations.length)} of{' '}
              {Object.values(statusCounts).reduce((sum, item) => sum + item.count, 0)} donations
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                disabled={currentPage === 1}
                className="px-3 py-1 text-xs border border-temple-gold/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-temple-cream transition-colors"
              >
                Previous
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                <button
                  key={page}
                  onClick={() => setCurrentPage(page)}
                  className={`w-8 h-8 text-xs rounded-lg transition-colors ${
                    currentPage === page
                      ? 'bg-temple-maroon text-white'
                      : 'border border-temple-gold/20 hover:bg-temple-cream'
                  }`}
                >
                  {page}
                </button>
              ))}
              <button
                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                disabled={currentPage === totalPages}
                className="px-3 py-1 text-xs border border-temple-gold/20 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-temple-cream transition-colors"
              >
                Next
              </button>
            </div>
          </div>
        )}

      {/* Action Modal */}
      {showActionModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-4 sm:p-6 max-w-sm w-full border border-temple-gold/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-temple-maroon">Actions</h3>
              <button
                onClick={() => setShowActionModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-temple-cream/30 rounded-lg p-3 mb-4">
              <div className="text-xs space-y-1">
                <p><span className="font-medium">Receipt:</span> {selectedDonation.receiptNumber}</p>
                <p><span className="font-medium">Type:</span> {selectedDonation.donationType}</p>
                <p><span className="font-medium">Amount:</span> {formatCurrency(selectedDonation.amount)}</p>
                <p><span className="font-medium">Donor:</span> {selectedDonation.userName || 'Anonymous'}</p>
              </div>
            </div>

            <div className="space-y-2">
              <button
                onClick={() => handleAction(selectedDonation.id, 'confirm')}
                className="w-full px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                Confirm
              </button>
              <button
                onClick={() => handleAction(selectedDonation.id, 'fail')}
                className="w-full px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Mark as Failed
              </button>
              <button
                onClick={() => setShowActionModal(false)}
                className="w-full px-3 py-2 text-xs border border-temple-gold/20 text-temple-maroon rounded-lg hover:bg-temple-cream transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedDonation && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto border border-temple-gold/20">
            <div className="bg-gradient-to-r from-temple-maroon to-temple-gold p-4 sticky top-0">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-white">Donation Details</h3>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-white/80 hover:text-white"
                >
                  <XCircle className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <p className="text-gray-600">Receipt</p>
                  <p className="font-medium">{selectedDonation.receiptNumber}</p>
                </div>
                <div>
                  <p className="text-gray-600">Type</p>
                  <p className="font-medium">{selectedDonation.donationType}</p>
                </div>
                <div>
                  <p className="text-gray-600">Amount</p>
                  <p className="font-semibold text-green-600">{formatCurrency(selectedDonation.amount)}</p>
                </div>
                <div>
                  <p className="text-gray-600">Status</p>
                  <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(selectedDonation.paymentStatus)}`}>
                    {getStatusIcon(selectedDonation.paymentStatus)}
                    <span className="capitalize">{selectedDonation.paymentStatus}</span>
                  </div>
                </div>
              </div>

              {selectedDonation.donationPurpose && (
                <div>
                  <p className="text-xs text-gray-600 mb-1">Purpose</p>
                  <p className="text-sm font-medium">{selectedDonation.donationPurpose}</p>
                </div>
              )}

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-3 text-temple-maroon">Donor Information</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div>
                    <p className="text-gray-600">Name</p>
                    <p className="font-medium">{selectedDonation.userName || 'Anonymous'}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Phone</p>
                    <p className="font-medium">{selectedDonation.userPhone || 'N/A'}</p>
                  </div>
                  {selectedDonation.userEmail && (
                    <div>
                      <p className="text-gray-600">Email</p>
                      <p className="font-medium">{selectedDonation.userEmail}</p>
                    </div>
                  )}
                  {selectedDonation.pan && (
                    <div>
                      <p className="text-gray-600">PAN</p>
                      <p className="font-medium">{selectedDonation.pan}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="border-t pt-4">
                <h4 className="text-sm font-semibold mb-2 text-temple-maroon">Date</h4>
                <p className="text-xs">{formatDateTime(selectedDonation.createdAt)}</p>
              </div>
            </div>

            <div className="p-4 border-t">
              <div className="flex gap-2">
                {selectedDonation.paymentStatus === 'PENDING' && (
                  <>
                    <button
                      onClick={() => {
                        handleAction(selectedDonation.id, 'confirm')
                        setShowDetailsModal(false)
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Confirm
                    </button>
                    <button
                      onClick={() => {
                        handleAction(selectedDonation.id, 'fail')
                        setShowDetailsModal(false)
                      }}
                      className="flex-1 px-3 py-2 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                      Fail
                    </button>
                  </>
                )}
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className={`${selectedDonation.paymentStatus === 'PENDING' ? 'flex-1' : 'w-full'} px-3 py-2 text-xs border border-temple-gold/20 text-temple-maroon rounded-lg hover:bg-temple-cream transition-colors`}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}