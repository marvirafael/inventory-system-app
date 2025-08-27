'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface StockByLocation {
  item_id: string
  item_name: string
  unit: string
  storage_qty: number
  processing_qty: number
  exit_qty: number
}

export default function StockPage() {
  const [stockData, setStockData] = useState<StockByLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    loadStockData()
  }, [router])

  const loadStockData = async () => {
    try {
      setError(null)
      setLoading(true)

      const { data, error } = await supabase
        .from('stock_by_location')
        .select('*')
        .order('item_name')

      if (error) throw error
      setStockData(data || [])
    } catch (error) {
      console.error('Error loading stock data:', error)
      setError('Failed to load stock data. Please try again.')
      setStockData([])
    } finally {
      setLoading(false)
    }
  }

  const getTotalQty = (item: StockByLocation) => {
    return item.storage_qty + item.processing_qty + item.exit_qty
  }

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-6xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Stock Overview</h1>
              <p className="text-primary-600">Current inventory levels by location</p>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={loadStockData}
                disabled={loading}
                className="text-sm bg-accent-600 hover:bg-accent-700 disabled:bg-gray-400 text-white px-3 py-2 rounded-md transition-colors"
              >
                {loading ? 'Refreshing...' : 'Refresh'}
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

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
            <div className="text-red-700 mb-4">{error}</div>
            <button
              onClick={loadStockData}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md transition-colors"
            >
              Try Again
            </button>
          </div>
        ) : stockData.length === 0 ? (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-8 text-center">
            <div className="text-yellow-700 mb-4">
              <h3 className="text-lg font-semibold mb-2">No Stock Data Available</h3>
              <p>No inventory items found. Add items through the Storage page to see stock levels here.</p>
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm border border-primary-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-primary-50 border-b border-primary-200">
                  <tr>
                    <th className="text-left px-6 py-4 font-semibold text-primary-900">Item</th>
                    <th className="text-left px-6 py-4 font-semibold text-primary-900">Unit</th>
                    <th className="text-right px-6 py-4 font-semibold text-primary-900">Storage</th>
                    <th className="text-right px-6 py-4 font-semibold text-primary-900">Processing</th>
                    <th className="text-right px-6 py-4 font-semibold text-primary-900">Exit</th>
                    <th className="text-right px-6 py-4 font-semibold text-primary-900">Total</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-primary-100">
                  {stockData.map((item) => (
                    <tr key={item.item_id} className="hover:bg-primary-25">
                      <td className="px-6 py-4 font-medium text-primary-900">{item.item_name}</td>
                      <td className="px-6 py-4 text-primary-600">{item.unit}</td>
                      <td className="px-6 py-4 text-right text-primary-900">
                        {item.storage_qty.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-primary-900">
                        {item.processing_qty.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right text-primary-900">
                        {item.exit_qty.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 text-right font-semibold text-primary-900">
                        {getTotalQty(item).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
