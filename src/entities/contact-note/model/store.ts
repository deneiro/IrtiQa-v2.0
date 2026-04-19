import { create } from 'zustand'
import { ContactNote } from './types'

interface ContactNoteState {
  notes: ContactNote[]
  isLoading: boolean
  
  // Actions
  setNotes: (notes: ContactNote[]) => void
  addNote: (note: ContactNote) => void
  deleteNote: (noteId: string) => void
}

export const useContactNoteStore = create<ContactNoteState>((set) => ({
  notes: [],
  isLoading: true,
  
  setNotes: (notes) => set({ notes, isLoading: false }),
  
  addNote: (note) => set((state) => ({
    notes: [note, ...state.notes].sort((a, b) => 
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    )
  })),
  
  deleteNote: (noteId) => set((state) => ({
    notes: state.notes.filter(n => n.id !== noteId)
  }))
}))
