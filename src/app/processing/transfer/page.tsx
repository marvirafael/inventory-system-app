'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { supabase, StockByLocation } from '@/lib/supabase'

export default function TransferPage() {
  const [stockData, setStockData] = useState<StockByLocation[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    itemId: '',
    fromLocation: 'Storage' as 'Storage' | 'Processing',
    toLocation: 'Processing' as 'Storage' | 'Processing',
    quantity: '',
    reference: '',
    notes: ''
  })
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
      const { data, error } = await supabase
        .from('stock_by_location')
        .select('*')
        .order('item_name')

      if (error) throw error
      setStockData(data || [])
    } catch (error) {
      console.error('Error loading stock data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLocationSwap = () => {
    setFormData({
      ...formData,
      fromLocation: formData.fromLocation === 'Storage' ? 'Processing' : 'Storage',
      toLocation: formData.toLocation === 'Storage' ? 'Processing' : 'Storage'
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.itemId || !formData.quantity) return

    setSubmitting(true)
    try {
      // Transfer using actual database schema
      const selectedStock = stockData.find(item => item.item_id === formData.itemId)
      
      console.log('Transfer attempt:', {
        itemId: formData.itemId,
        quantity: formData.quantity,
        fromLocation: formData.fromLocation,
        toLocation: formData.toLocation,
        selectedStock: selectedStock
      })

      const transferEntries = [
        {
          item_id: formData.itemId,
          movement_type: 'Transfer',
          qty_out: parseFloat(formData.quantity),
          location: formData.fromLocation,
          reference: formData.reference || null,
          unit: selectedStock?.base_unit || 'unit'
        },
        {
          item_id: formData.itemId,
          movement_type: 'Transfer',
          qty_in: parseFloat(formData.quantity),
          location: formData.toLocation,
          reference: formData.reference || null,
          unit: selectedStock?.base_unit || 'unit'
        }
      ]

      console.log('Inserting ledger entries:', transferEntries)

      const { data, error } = await supabase.from('ledger').insert(transferEntries)

      if (error) {
        console.error('Supabase error:', error)
        throw error
      }

      console.log('Transfer successful:', data)

      // Reset form
      setFormData({
        itemId: '',
        fromLocation: 'Storage',
        toLocation: 'Processing',
        quantity: '',
        reference: '',
        notes: ''
      })

      alert('Transfer completed successfully!')
      loadStockData() // Refresh stock data
    } catch (error) {
      console.error('Error transferring inventory:', error)
      alert(`Error transferring inventory: ${error.message || 'Please try again.'}`)
    } finally {
      setSubmitting(false)
    }
  }

  const selectedStock = stockData.find(item => item.item_id === formData.itemId)
  const availableQty = selectedStock 
    ? (formData.fromLocation === 'Storage' ? selectedStock.storage_qty : selectedStock.processing_qty)
    : 0

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Transfer Inventory</h1>
              <p className="text-primary-600">Move items between Storage and Processing</p>
            </div>
            <button
              onClick={() => router.push('/processing')}
              className="text-primary-600 hover:text-primary-800"
            >
              ← Back to Processing
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Item Selection */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Item *
              </label>
              {loading ? (
                <div className="input-field">Loading items...</div>
              ) : (
                <select
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select an item</option>
                  {stockData.filter(item => 
                    (formData.fromLocation === 'Storage' ? item.storage_qty : item.processing_qty) > 0
                  ).map((item) => (
                    <option key={item.item_id} value={item.item_id}>
                      {item.item_name} ({item.unit}) - Available: {
                        formData.fromLocation === 'Storage' ? item.storage_qty : item.processing_qty
                      }
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Transfer Direction */}
            <div className="bg-primary-100 p-4 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary-800">{formData.fromLocation}</div>
                  <div className="text-sm text-primary-600">From</div>
                </div>
                
                <button
                  type="button"
                  onClick={handleLocationSwap}
                  className="bg-accent-500 hover:bg-accent-600 text-white p-2 rounded-full transition-colors"
                  title="Swap directions"
                >
                  ⇄
                </button>
                
                <div className="text-center">
                  <div className="text-lg font-semibold text-primary-800">{formData.toLocation}</div>
                  <div className="text-sm text-primary-600">To</div>
                </div>
              </div>
            </div>

            {/* Available Quantity Display */}
            {selectedStock && (
              <div className="bg-accent-50 p-3 rounded-lg">
                <div className="text-sm text-accent-800">
                  Available in {formData.fromLocation}: <strong>{availableQty} {selectedStock.unit}</strong>
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Quantity * {selectedStock && `(${selectedStock.unit})`}
              </label>
              <input
                type="number"
                step="0.01"
                max={availableQty}
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Reference
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Transfer reference or batch ID"
                className="input-field"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="input-field"
                placeholder="Transfer notes..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !formData.itemId || !formData.quantity || parseFloat(formData.quantity) > availableQty}
              className="w-full btn-primary"
            >
              {submitting ? 'Transferring...' : `Transfer ${formData.fromLocation} → ${formData.toLocation}`}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
