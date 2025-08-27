import { supabase } from './supabase'

export interface ItemOption {
  id: string
  name: string
  base_unit?: string
  size?: string | null
}

export async function getItems({ 
  type, 
  activeOnly = true 
}: { 
  type: 'raw' | 'finished' | 'packaging'
  activeOnly?: boolean 
}) {
  let query = supabase
    .from('items')
    .select('id, name, base_unit, size')
    .eq('type', type)
    .order('name')

  if (activeOnly) {
    query = query.eq('active', true)
  }

  const { data, error } = await query

  if (error) throw error
  return data || []
}
