'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { supabase, ItemMovementHistory } from '@/lib/supabase'
import { exportToCSV, formatHistoryForExport } from '@/lib/csv-export'

export default function HistoryPage() {
  const [historyData, setHistoryData] = useState<ItemMovementHistory[]>([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    searchTerm: '',
    transactionType: 'all' as 'all' | 'in' | 'out',
    dateFrom: '',
    dateTo: new Date().toISOString().split('T')[0],
    location: 'all' as 'all' | 'Storage' | 'Processing' | 'Exit'
  })
  const router = useRouter()

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    loadHistoryData()
  }, [router])

  const loadHistoryData = async () => {
    try {
      const { data, error } = await supabase
        .from('item_movement_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500) // Limit to recent 500 transactions

      if (error) throw error
      setHistoryData(data || [])
    } catch (error) {
      console.error('Error loading history data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleExportCSV = () => {
    const exportData = formatHistoryForExport(filteredHistory)
    const filename = `transaction-history-${new Date().toISOString().split('T')[0]}.csv`
    exportToCSV(exportData, filename)
  }

  const filteredHistory = historyData.filter(item => {
    // Search term filter
    if (filters.searchTerm && !item.item_name.toLowerCase().includes(filters.searchTerm.toLowerCase())) {
      return false
    }

    // Transaction type filter
    if (filters.transactionType === 'in' && !item.qty_in) return false
    if (filters.transactionType === 'out' && !item.qty_out) return false

    // Date filters
    const itemDate = new Date(item.created_at).toISOString().split('T')[0]
    if (filters.dateFrom && itemDate < filters.dateFrom) return false
    if (filters.dateTo && itemDate > filters.dateTo) return false

    // Location filter
    if (filters.location !== 'all' && item.location !== filters.location) return false

    return true
  })

  const getTransactionTypeColor = (item: ItemMovementHistory) => {
    if (item.qty_in) {
      return 'text-green-600 bg-green-50'
    } else if (item.qty_out) {
      return 'text-red-600 bg-red-50'
    }
    return 'text-gray-600 bg-gray-50'
  }

  const getTransactionIcon = (item: ItemMovementHistory) => {
    if (item.qty_in) return '↗'
    if (item.qty_out) return '↙'
    return '•'
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Transaction History</h1>
              <p className="text-primary-600">Recent inventory movements</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={handleExportCSV}
                className="btn-secondary text-sm"
                disabled={loading}
              >
                Export CSV
              </button>
              <button
                onClick={() => router.push('/home')}
                className="text-primary-600 hover:text-primary-800"
              >
                ← Back to Home
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="card mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Search Items
              </label>
              <input
                type="text"
                placeholder="Search by item name..."
                value={filters.searchTerm}
                onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            {/* Transaction Type */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Transaction Type
              </label>
              <select
                value={filters.transactionType}
                onChange={(e) => setFilters({ ...filters, transactionType: e.target.value as any })}
                className="input-field text-sm"
              >
                <option value="all">All Transactions</option>
                <option value="in">Incoming</option>
                <option value="out">Outgoing</option>
              </select>
            </div>

            {/* Date From */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                From Date
              </label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            {/* Date To */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                To Date
              </label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="input-field text-sm"
              />
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-1">
                Location
              </label>
              <select
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value as any })}
                className="input-field text-sm"
              >
                <option value="all">All Locations</option>
                <option value="Storage">Storage</option>
                <option value="Processing">Processing</option>
                <option value="Exit">Exit</option>
              </select>
            </div>
          </div>

          {/* Results Summary */}
          <div className="mt-4 pt-4 border-t border-primary-200">
            <p className="text-sm text-primary-600">
              Showing {filteredHistory.length} of {historyData.length} transactions
            </p>
          </div>
        </div>

        {/* History Table */}
        <div className="card">
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
              <p className="text-primary-600 mt-2">Loading transaction history...</p>
            </div>
          ) : filteredHistory.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-primary-600">No transactions found matching your filters</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-primary-200">
                    <th className="text-left py-3 px-4 font-semibold text-primary-900">Date/Time</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-900">Item</th>
                    <th className="text-center py-3 px-4 font-semibold text-primary-900">Type</th>
                    <th className="text-right py-3 px-4 font-semibold text-primary-900">Quantity</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-900">Location</th>
                    <th className="text-right py-3 px-4 font-semibold text-primary-900">Cost/Price</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-900">Reference</th>
                    <th className="text-left py-3 px-4 font-semibold text-primary-900">Notes</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredHistory.map((item) => (
                    <tr key={item.id} className="border-b border-primary-100 hover:bg-primary-25">
                      <td className="py-3 px-4 text-sm">
                        <div className="font-medium text-primary-900">
                          {new Date(item.created_at).toLocaleDateString()}
                        </div>
                        <div className="text-primary-600">
                          {new Date(item.created_at).toLocaleTimeString()}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-primary-900">{item.item_name}</td>
                      <td className="py-3 px-4 text-center">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTransactionTypeColor(item)}`}>
                          {getTransactionIcon(item)} {item.qty_in ? 'IN' : 'OUT'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        {item.qty_in ? `+${item.qty_in}` : `-${item.qty_out}`}
                      </td>
                      <td className="py-3 px-4 text-primary-600">{item.location}</td>
                      <td className="py-3 px-4 text-right font-mono">
                        {item.unit_cost ? `$${item.unit_cost}` : item.sell_price ? `$${item.sell_price}` : '-'}
                      </td>
                      <td className="py-3 px-4 text-primary-600 text-sm">{item.reference || '-'}</td>
                      <td className="py-3 px-4 text-primary-600 text-sm max-w-xs truncate" title={item.notes || ''}>
                        {item.notes || '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Refresh Button */}
        <div className="text-center mt-6">
          <button
            onClick={loadHistoryData}
            disabled={loading}
            className="btn-primary"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </button>
        </div>
      </div>
    </div>
  )
}
