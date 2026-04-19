import { create } from 'zustand'
import { createClient } from '@/shared/api/supabase'
import { JournalEntry, JournalInsert, JournalUpdate } from './types'

interface JournalState {
  journals: JournalEntry[]
  isLoading: boolean
  error: string | null
  
  fetchJournals: () => Promise<void>
  addJournal: (entry: JournalInsert) => Promise<JournalEntry | null>
  updateJournal: (id: string, entry: JournalUpdate) => Promise<void>
  getJournalByDate: (date: string) => JournalEntry | undefined
}

export const useJournalStore = create<JournalState>((set, get) => ({
  journals: [],
  isLoading: false,
  error: null,

  fetchJournals: async () => {
    set({ isLoading: true, error: null })
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('journals')
        .select('*')
        .order('entry_date', { ascending: false })

      if (error) throw error
      set({ journals: data || [], isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  addJournal: async (entry) => {
    set({ isLoading: true, error: null })
    const supabase = createClient()
    try {
      const { data, error } = await supabase
        .from('journals')
        .insert(entry as any)
        .select()
        .single()

      if (error) throw error
      
      set((state) => ({ 
        journals: [data, ...state.journals],
        isLoading: false 
      }))
      
      return data
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
      return null
    }
  },

  updateJournal: async (id, entry) => {
    set({ isLoading: true, error: null })
    const supabase = createClient()
    try {
      const { error } = await (supabase
        .from('journals' as any) as any)
        .update(entry as any)
        .eq('id', id)

      if (error) throw error
      
      set((state) => ({
        journals: state.journals.map((j) => (j.id === id ? { ...j, ...entry } : j)) as JournalEntry[],
        isLoading: false
      }))
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  getJournalByDate: (date) => {
    return get().journals.find(j => j.entry_date === date)
  }
}))
