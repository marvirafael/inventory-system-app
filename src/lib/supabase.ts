import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface Item {
  id: string
  name: string
  unit: string
  type: 'raw_material' | 'packaging' | 'finished_good'
  is_active: boolean
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
  fg_item_name: string
  waste_pct: number
}

export interface RecipeComponent {
  recipe_id: string
  rm_item_id: string
  rm_item_name: string
  qty_per_fg_unit: number
  unit: string
}
