import { create } from 'zustand'
import { Contact } from './types'

interface ContactState {
  contacts: Contact[]
  isLoading: boolean
  
  // Actions
  setContacts: (contacts: Contact[]) => void
  addContact: (contact: Contact) => void
  updateContact: (contact: Contact) => void
  deleteContact: (id: string) => void
}

export const useContactStore = create<ContactState>((set) => ({
  contacts: [],
  isLoading: true,
  
  setContacts: (contacts) => set({ contacts, isLoading: false }),
  
  addContact: (contact) => set((state) => ({
    contacts: [contact, ...state.contacts]
  })),

  updateContact: (updatedContact) => set((state) => ({
    contacts: state.contacts.map(c => c.id === updatedContact.id ? updatedContact : c)
  })),

  deleteContact: (id) => set((state) => ({
    contacts: state.contacts.filter(c => c.id !== id)
  }))
}))
