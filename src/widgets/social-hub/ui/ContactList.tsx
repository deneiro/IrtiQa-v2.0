"use client"

import React, { useState, useEffect } from 'react'
import { useContactStore, ContactCard, Contact } from '@/entities/contact'
import { useDebtStore, calculateContactBalance } from '@/entities/debt'
import { createClient } from '@/shared/api/supabase'
import { useAuthStore } from '@/entities/user'
import { Search, Plus, Filter, Users } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { AddContactModal } from '@/features/social/add-contact/ui/AddContactModal'
import { ContactDetails } from './ContactDetails'

export function ContactList() {
  const { user } = useAuthStore()
  const { contacts, setContacts, isLoading: contactsLoading } = useContactStore()
  const { debts, setDebts, isLoading: debtsLoading } = useDebtStore()
  const [search, setSearch] = useState('')
  const [selectedGroup, setSelectedGroup] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null)

  useEffect(() => {
    if (!user) return

    const fetchData = async () => {
      const supabase = createClient()
      
      const { data: contactsData } = await supabase
        .from('contacts')
        .select('*')
        .order('name')

      const { data: debtsData } = await supabase
        .from('debts')
        .select('*')
        .eq('is_settled', false)

      if (contactsData) setContacts(contactsData)
      if (debtsData) setDebts(debtsData)
    }

    fetchData()
  }, [user, setContacts, setDebts])

  const allGroups = Array.from(new Set(contacts.flatMap(c => c.groups || [])))

  const filteredContacts = contacts.filter(c => {
    const matchesSearch = c.name.toLowerCase().includes(search.toLowerCase())
    const matchesGroup = !selectedGroup || (c.groups && c.groups.includes(selectedGroup))
    return matchesSearch && matchesGroup
  })

  if (contactsLoading || debtsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-muted-foreground gap-4">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        <p>Loading contacts...</p>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div className="relative flex-1 w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search contacts..."
            className="w-full bg-card border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-display"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={() => setIsAddModalOpen(true)} className="gap-2 shadow-lg shadow-primary/20">
            <Plus className="w-4 h-4" />
            Add Contact
          </Button>
        </div>
      </div>

      {/* Filter Chips */}
      {allGroups.length > 0 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          <button
            onClick={() => setSelectedGroup(null)}
            className={`px-4 py-1.5 rounded-full border text-sm transition-all whitespace-nowrap ${
              !selectedGroup 
                ? 'bg-primary border-primary text-primary-foreground shadow-md' 
                : 'bg-card border-border/50 text-muted-foreground hover:border-primary/50'
            }`}
          >
            All
          </button>
          {allGroups.map(group => (
            <button
              key={group}
              onClick={() => setSelectedGroup(group)}
              className={`px-4 py-1.5 rounded-full border text-sm transition-all whitespace-nowrap ${
                selectedGroup === group
                  ? 'bg-primary border-primary text-primary-foreground shadow-md'
                  : 'bg-card border-border/50 text-muted-foreground hover:border-primary/50'
              }`}
            >
              {group}
            </button>
          ))}
        </div>
      )}

      {/* Grid */}
      {filteredContacts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredContacts.map(contact => (
            <ContactCard
              key={contact.id}
              contact={contact}
              netBalance={calculateContactBalance(debts, contact.id)}
              onClick={() => setSelectedContact(contact)}
            />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-20 bg-card/30 border border-dashed border-border rounded-3xl text-muted-foreground gap-4">
          <Users className="w-12 h-12 opacity-20" />
          <div className="text-center">
            <p className="font-display font-medium">No contacts found</p>
            <p className="text-sm">Try adjusting your search or add a new contact</p>
          </div>
        </div>
      )}

      <AddContactModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
      />

      {selectedContact && (
        <ContactDetails
          isOpen={!!selectedContact}
          onClose={() => setSelectedContact(null)}
          contact={selectedContact}
        />
      )}
    </div>
  )
}
