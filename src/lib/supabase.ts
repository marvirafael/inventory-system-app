import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types - Updated for unified items catalog
export interface Item {
  id: string
  name: string
  type: 'raw' | 'packaging' | 'finished'
  base_unit: string
  size: string | null
  active: boolean
  notes: string | null
  created_at: string
  updated_at: string
}

export interface StockOnHand {
  item_id: string
  item_name: string
  unit: string
  total_qty: number
}

export interface StockByLocation {
  item_id: string
  item_name: string
  unit: string
  storage_qty: number
  processing_qty: number
  exit_qty: number
}

export interface ItemMovementHistory {
  id: string
  created_at: string
  item_id: string
  item_name: string
  qty_in: number | null
  qty_out: number | null
  location: string
  unit_cost: number | null
  sell_price: number | null
  reference: string | null
  notes: string | null
  batch_id: string | null
  client_uuid: string | null
}

export interface Recipe {
  id: string
  fg_item_id: string
  waste_pct: number
}

export interface RecipeComponent {
  id: string
  recipe_id: string
  rm_item_id: string
  qty_per_fg_unit: number
  unit: string
}
