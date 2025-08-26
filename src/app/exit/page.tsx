'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { supabase, Item } from '@/lib/supabase'
import { offlineQueue } from '@/lib/offline-queue'

export default function ExitPage() {
  const [finishedGoods, setFinishedGoods] = useState<Item[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    itemId: '',
    quantity: '',
    sellPrice: '',
    notes: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    loadFinishedGoods()
  }, [router])

  const loadFinishedGoods = async () => {
    try {
      const { data, error } = await supabase
        .from('items')
        .select('*')
        .eq('type', 'finished_good')
        .eq('is_active', true)
        .order('name')

      if (error) throw error
      setFinishedGoods(data || [])
    } catch (error) {
      console.error('Error loading finished goods:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.itemId || !formData.quantity) return

    setSubmitting(true)
    try {
      const dispatchData = {
        p_item_id: formData.itemId,
        p_qty: parseFloat(formData.quantity),
        p_sell_price: formData.sellPrice ? parseFloat(formData.sellPrice) : null,
        p_reference: formData.reference || null,
        p_notes: formData.notes || null,
        p_client_uuid: crypto.randomUUID()
      }

      if (navigator.onLine) {
        await supabase.rpc('dispatch_with_sales', dispatchData)
      } else {
        await offlineQueue.add('dispatch', dispatchData)
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        itemId: '',
        quantity: '',
        sellPrice: '',
        notes: ''
      })

      alert('Goods dispatched successfully!')
    } catch (error) {
      console.error('Error dispatching goods:', error)
      alert('Error dispatching goods. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedItem = finishedGoods.find(item => item.id === formData.itemId)
  const totalRevenue = formData.quantity && formData.sellPrice 
    ? parseFloat(formData.quantity) * parseFloat(formData.sellPrice)
    : 0

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Exit - Dispatch</h1>
              <p className="text-primary-600">Dispatch finished goods</p>
            </div>
            <button
              onClick={() => router.push('/home')}
              className="text-primary-600 hover:text-primary-800"
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="card">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Date */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Date
              </label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
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
                placeholder="Dispatch reference, order number, etc."
                className="input-field"
              />
            </div>

            {/* Item */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Finished Good *
              </label>
              {loading ? (
                <div className="input-field">Loading finished goods...</div>
              ) : (
                <select
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a finished good</option>
                  {finishedGoods.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.unit})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Quantity * {selectedItem && `(${selectedItem.unit})`}
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input-field"
                required
              />
            </div>

            {/* Sell Price */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Sell Price per Unit (optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.sellPrice}
                onChange={(e) => setFormData({ ...formData, sellPrice: e.target.value })}
                placeholder="Price per unit"
                className="input-field"
              />
            </div>

            {/* Revenue Calculation */}
            {totalRevenue > 0 && (
              <div className="bg-accent-50 p-4 rounded-lg">
                <div className="text-sm text-accent-800">
                  <strong>Total Revenue: ${totalRevenue.toFixed(2)}</strong>
                  <div className="text-xs text-accent-600 mt-1">
                    {formData.quantity} × ${formData.sellPrice} = ${totalRevenue.toFixed(2)}
                  </div>
                </div>
              </div>
            )}

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
                placeholder="Dispatch notes, customer info, etc."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !formData.itemId || !formData.quantity}
              className="w-full btn-primary"
            >
              {submitting ? 'Dispatching...' : 'Dispatch Goods'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
