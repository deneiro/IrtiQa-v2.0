import { create } from 'zustand'
import { supabase } from '@/shared/api/supabase'
import { Database } from '@/shared/types/database.types'

type StatsRow = Database['public']['Tables']['user_statistics']['Row']

interface StatsState {
  stats: StatsRow | null
  isLoading: boolean
  error: string | null
  
  // Actions
  fetchStats: (userId: string) => Promise<void>
  updateStats: (updates: Partial<StatsRow>) => void
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: null,
  isLoading: true,
  error: null,

  fetchStats: async (userId) => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('user_statistics')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error) throw error
      set({ stats: data, isLoading: false, error: null })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  updateStats: (updates) => set((state) => ({
    stats: state.stats ? { ...state.stats, ...updates } : null
  }))
}))
