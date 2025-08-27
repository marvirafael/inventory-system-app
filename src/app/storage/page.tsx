'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { supabase, Item } from '@/lib/supabase'
import { offlineQueue } from '@/lib/offline-queue'
import { getItems, ItemOption } from '@/lib/db'

interface RawItem {
  id: string
  name: string
  base_unit: string
  size: string | null
}

export default function StoragePage() {
  const [items, setItems] = useState<RawItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    reference: '',
    itemId: '',
    quantity: '',
    unitCost: '',
    notes: ''
  })
  const router = useRouter()

  useEffect(() => {
    if (!auth.isAuthenticated()) {
      router.push('/login')
      return
    }

    loadItems()
  }, [router])

  const loadItems = async () => {
    try {
      setError(null)
      
      // Check feature flag
      const useDbItems = process.env.NEXT_PUBLIC_USE_DB_ITEMS === 'true'
      if (!useDbItems) {
        setItems([])
        setError('Database items feature is disabled')
        return
      }

      const data = await getItems({ type: 'raw', activeOnly: true })
      setItems(data)
    } catch (error) {
      console.error('Error loading raw items:', error)
      setError('Failed to load raw ingredients. Please try again.')
      setItems([])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.itemId || !formData.quantity) return

    setSubmitting(true)
    try {
      const receiveData = {
        p_item_id: formData.itemId,
        p_qty: parseFloat(formData.quantity),
        p_unit_cost: formData.unitCost ? parseFloat(formData.unitCost) : null,
        p_reference: formData.reference || null,
        p_notes: formData.notes || null,
        p_client_uuid: crypto.randomUUID()
      }

      if (navigator.onLine) {
        await supabase.rpc('receive_inventory', receiveData)
      } else {
        await offlineQueue.add('receive', receiveData)
      }

      // Reset form
      setFormData({
        date: new Date().toISOString().split('T')[0],
        reference: '',
        itemId: '',
        quantity: '',
        unitCost: '',
        notes: ''
      })

      alert('Inventory received successfully!')
    } catch (error) {
      console.error('Error receiving inventory:', error)
      alert('Error receiving inventory. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedItem = items.find(item => item.id === formData.itemId)

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Storage - Receive</h1>
              <p className="text-primary-600">Add inventory to storage</p>
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
                placeholder="QR code, label, or batch reference"
                className="input-field"
              />
            </div>

            {/* Item */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Raw Ingredient *
              </label>
              {loading ? (
                <div className="input-field bg-gray-50">Loading raw ingredients...</div>
              ) : error ? (
                <div className="space-y-2">
                  <div className="input-field bg-red-50 text-red-700 border-red-200">
                    {error}
                  </div>
                  <button
                    type="button"
                    onClick={loadItems}
                    className="text-sm text-primary-600 hover:text-primary-800 underline"
                  >
                    Try again
                  </button>
                </div>
              ) : items.length === 0 ? (
                <div className="input-field bg-yellow-50 text-yellow-700 border-yellow-200">
                  No raw ingredients available
                </div>
              ) : (
                <select
                  value={formData.itemId}
                  onChange={(e) => setFormData({ ...formData, itemId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a raw ingredient</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.base_unit}){item.size && ` - ${item.size}`}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Quantity *
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

            {/* Unit Cost */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Unit Cost (optional)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.unitCost}
                onChange={(e) => setFormData({ ...formData, unitCost: e.target.value })}
                placeholder="Cost per unit"
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
                placeholder="Additional notes..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !formData.itemId || !formData.quantity}
              className="w-full btn-primary"
            >
              {submitting ? 'Receiving...' : 'Receive Inventory'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
