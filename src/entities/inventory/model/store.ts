import { create } from 'zustand'
import { supabase } from '@/shared/api/supabase'
import { Database } from '@/shared/types/database.types'

type InventoryRow = Database['public']['Tables']['inventory']['Row']

interface InventoryState {
  items: InventoryRow[]
  isLoading: boolean
  
  // Actions
  fetchInventory: (userId: string) => Promise<void>
  addItem: (item: Omit<InventoryRow, 'id' | 'created_at' | 'updated_at' | 'purchased_at'>) => void
  removeItem: (itemId: string, quantity?: number) => void
  setItems: (items: InventoryRow[]) => void
}

export const useInventoryStore = create<InventoryState>((set) => ({
  items: [],
  isLoading: false,
  
  fetchInventory: async (userId: string) => {
    set({ isLoading: true })
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
    
    if (!error && data) {
      set({ items: data, isLoading: false })
    } else {
      set({ isLoading: false })
    }
  },

  setItems: (items) => set({ items }),

  addItem: (item) => set((state) => {
    const existingIndex = state.items.findIndex(i => i.item_key === item.item_key)
    
    if (existingIndex !== -1) {
      const newItems = [...state.items]
      newItems[existingIndex] = {
        ...newItems[existingIndex],
        quantity: newItems[existingIndex].quantity + (item.quantity || 1)
      }
      return { items: newItems }
    }
    
    // For new items, we'd normally wait for DB and re-fetch, 
    // but for optimistic UI we can push a temp one
    return {
      items: [
        {
          id: crypto.randomUUID(),
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          purchased_at: new Date().toISOString(),
          ...item,
          quantity: item.quantity || 1
        } as InventoryRow,
        ...state.items
      ]
    }
  }),

  removeItem: (itemId, quantity = 1) => set((state) => {
    const newItems = state.items
      .map(item => {
        if (item.id === itemId) {
          return { ...item, quantity: Math.max(0, item.quantity - quantity) }
        }
        return item
      })
      .filter(item => item.quantity > 0)
    
    return { items: newItems }
  })
}))
