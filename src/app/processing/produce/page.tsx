'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { auth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

interface Recipe {
  id: string
  fg_item_id: string
  fg_item_name: string
  fg_unit: string
  waste_pct: number
  components: {
    rm_item_id: string
    rm_item_name: string
    rm_unit: string
    qty_per_fg_unit: number
  }[]
}

interface StockItem {
  item_id: string
  item_name: string
  base_unit: string
  processing_qty: number
}

export default function ProduceBatchPage() {
  const [recipes, setRecipes] = useState<Recipe[]>([])
  const [stockData, setStockData] = useState<StockItem[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    recipeId: '',
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

    loadData()
  }, [router])

  const loadData = async () => {
    try {
      // Load recipes with components
      const { data: recipesData, error: recipesError } = await supabase
        .from('recipes')
        .select(`
          id,
          fg_item_id,
          waste_pct,
          items!recipes_fg_item_id_fkey(name, base_unit),
          recipe_components(
            rm_item_id,
            qty_per_fg_unit,
            items!recipe_components_rm_item_id_fkey(name, base_unit)
          )
        `)

      if (recipesError) throw recipesError

      // Transform recipes data
      const transformedRecipes = recipesData?.map(recipe => ({
        id: recipe.id,
        fg_item_id: recipe.fg_item_id,
        fg_item_name: recipe.items?.name || 'Unknown',
        fg_unit: recipe.items?.base_unit || 'unit',
        waste_pct: recipe.waste_pct,
        components: recipe.recipe_components?.map(comp => ({
          rm_item_id: comp.rm_item_id,
          rm_item_name: comp.items?.name || 'Unknown',
          rm_unit: comp.items?.base_unit || 'unit',
          qty_per_fg_unit: comp.qty_per_fg_unit
        })) || []
      })) || []

      setRecipes(transformedRecipes)

      // Load processing stock
      const { data: stockData, error: stockError } = await supabase
        .from('stock_by_location')
        .select('*')
        .gt('processing_qty', 0)

      if (stockError) throw stockError
      setStockData(stockData || [])

    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.recipeId || !formData.quantity) return

    const selectedRecipe = recipes.find(r => r.id === formData.recipeId)
    if (!selectedRecipe) return

    setSubmitting(true)
    try {
      // Check if produce_batch RPC exists, otherwise use manual ledger entries
      const { error } = await supabase.rpc('produce_batch', {
        p_recipe_id: formData.recipeId,
        p_fg_qty: parseFloat(formData.quantity),
        p_reference: formData.reference || null,
        p_notes: formData.notes || null,
        p_client_uuid: crypto.randomUUID()
      })

      if (error) {
        // If RPC doesn't exist, create manual ledger entries
        const batchId = `BATCH-${Date.now()}`
        const ledgerEntries = []

        // Consume raw materials
        for (const comp of selectedRecipe.components) {
          const consumeQty = comp.qty_per_fg_unit * parseFloat(formData.quantity)
          ledgerEntries.push({
            item_id: comp.rm_item_id,
            movement_type: 'Consume',
            qty_out: consumeQty,
            location: 'Processing',
            reference: batchId,
            unit: comp.rm_unit
          })
        }

        // Yield finished goods
        ledgerEntries.push({
          item_id: selectedRecipe.fg_item_id,
          movement_type: 'Yield',
          qty_in: parseFloat(formData.quantity),
          location: 'Processing',
          reference: batchId,
          unit: selectedRecipe.fg_unit
        })

        const { error: ledgerError } = await supabase
          .from('ledger')
          .insert(ledgerEntries)

        if (ledgerError) throw ledgerError
      }

      // Reset form
      setFormData({
        recipeId: '',
        quantity: '',
        reference: '',
        notes: ''
      })

      alert('Batch produced successfully!')
      loadData() // Refresh data
    } catch (error) {
      console.error('Error producing batch:', error)
      alert('Error producing batch. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const selectedRecipe = recipes.find(r => r.id === formData.recipeId)

  // Check if we have enough raw materials
  const canProduce = selectedRecipe && formData.quantity ? 
    selectedRecipe.components.every(comp => {
      const stock = stockData.find(s => s.item_id === comp.rm_item_id)
      const required = comp.qty_per_fg_unit * parseFloat(formData.quantity)
      return stock && stock.processing_qty >= required
    }) : false

  return (
    <div className="min-h-screen bg-primary-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-primary-200">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-primary-900">Produce Batch</h1>
              <p className="text-primary-600">Execute production recipes</p>
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
            {/* Recipe Selection */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Recipe *
              </label>
              {loading ? (
                <div className="input-field">Loading recipes...</div>
              ) : (
                <select
                  value={formData.recipeId}
                  onChange={(e) => setFormData({ ...formData, recipeId: e.target.value })}
                  className="input-field"
                  required
                >
                  <option value="">Select a recipe</option>
                  {recipes.map((recipe) => (
                    <option key={recipe.id} value={recipe.id}>
                      {recipe.fg_item_name} ({recipe.fg_unit})
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Recipe Details */}
            {selectedRecipe && (
              <div className="bg-primary-100 p-4 rounded-lg">
                <h3 className="font-semibold text-primary-800 mb-2">Recipe Components:</h3>
                <div className="space-y-1">
                  {selectedRecipe.components.map((comp, index) => (
                    <div key={index} className="text-sm text-primary-700 flex justify-between">
                      <span>{comp.rm_item_name}</span>
                      <span>{comp.qty_per_fg_unit} {comp.rm_unit} per {selectedRecipe.fg_unit}</span>
                    </div>
                  ))}
                  {selectedRecipe.waste_pct > 0 && (
                    <div className="text-sm text-red-600 mt-2">
                      Waste: {selectedRecipe.waste_pct}%
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Quantity */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Quantity to Produce * {selectedRecipe && `(${selectedRecipe.fg_unit})`}
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

            {/* Material Requirements */}
            {selectedRecipe && formData.quantity && (
              <div className="bg-accent-50 p-4 rounded-lg">
                <h3 className="font-semibold text-accent-800 mb-2">Required Materials:</h3>
                <div className="space-y-1">
                  {selectedRecipe.components.map((comp, index) => {
                    const required = comp.qty_per_fg_unit * parseFloat(formData.quantity)
                    const stock = stockData.find(s => s.item_id === comp.rm_item_id)
                    const available = stock?.processing_qty || 0
                    const hasEnough = available >= required

                    return (
                      <div key={index} className={`text-sm flex justify-between ${hasEnough ? 'text-green-700' : 'text-red-700'}`}>
                        <span>{comp.rm_item_name}</span>
                        <span>
                          {required.toFixed(2)} {comp.rm_unit} 
                          (Available: {available.toFixed(2)})
                          {hasEnough ? ' ✓' : ' ✗'}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Reference */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Batch Reference
              </label>
              <input
                type="text"
                value={formData.reference}
                onChange={(e) => setFormData({ ...formData, reference: e.target.value })}
                placeholder="Batch ID or reference"
                className="input-field"
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-primary-700 mb-2">
                Production Notes
              </label>
              <textarea
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                rows={3}
                className="input-field"
                placeholder="Production notes..."
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={submitting || !formData.recipeId || !formData.quantity || !canProduce}
              className="w-full btn-primary"
            >
              {submitting ? 'Producing...' : 'Produce Batch'}
            </button>

            {selectedRecipe && formData.quantity && !canProduce && (
              <p className="text-red-600 text-sm text-center">
                Insufficient raw materials in Processing location
              </p>
            )}
          </form>
        </div>
      </div>
    </div>
  )
}
