"use client"

import React, { useState } from 'react'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { createClient } from '@/shared/api/supabase'
import { useAuthStore } from '@/entities/user'
import { useEventStore } from '@/entities/event'
import { Calendar, Tag, Type, Loader2, Save } from 'lucide-react'
import { toast } from '@/shared/lib/toast'

interface AddEventModalProps {
  isOpen: boolean
  onClose: () => void
  contactId: string
  contactName: string
}

export function AddEventModal({ isOpen, onClose, contactId, contactName }: AddEventModalProps) {
  const { user } = useAuthStore()
  const { addEvent } = useEventStore()
  const [isSaving, setIsSaving] = useState(false)
  
  const [title, setTitle] = useState('')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [category, setCategory] = useState('meeting')
  const [description, setDescription] = useState('')

  const handleSave = async () => {
    if (!user || !title) return
    setIsSaving(true)
    
    const supabase = createClient()
    const { data, error } = await (supabase
      .from('events') as any)
      .insert({
        user_id: user.id,
        contact_id: contactId,
        title,
        event_date: new Date(date).toISOString(),
        category,
        description,
        is_recurring: false
      })
      .select()
      .single()

    if (!error && data) {
      addEvent(data)
      toast.success('Event logged in timeline.')
      onClose()
      setTitle('')
      setDescription('')
    } else {
      toast.error('Failed to log event.')
      console.error(error)
    }
    setIsSaving(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Event with ${contactName}`} className="max-w-md">
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Title</label>
          <div className="relative">
            <Type className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Coffee at Starbucks"
              className="w-full bg-secondary/20 border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Date</label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <input 
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-secondary/20 border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none"
              />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Category</label>
            <div className="relative">
              <Tag className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
              <select 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-secondary/20 border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none appearance-none"
              >
                <option value="meeting">Meeting</option>
                <option value="coffee">Coffee</option>
                <option value="call">Call</option>
                <option value="event">Event</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Description (Optional)</label>
          <textarea 
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Key discussion points or memories..."
            className="w-full bg-secondary/20 border-border/50 rounded-xl px-4 py-3 text-sm h-24 resize-none outline-none focus:ring-2 focus:ring-primary/20"
          />
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving || !title}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-display font-black uppercase tracking-widest gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Log Interaction
        </Button>
      </div>
    </Modal>
  )
}
