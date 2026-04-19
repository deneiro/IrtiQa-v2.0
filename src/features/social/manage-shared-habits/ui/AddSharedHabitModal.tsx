"use client"

import React, { useState } from 'react'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { createClient } from '@/shared/api/supabase'
import { useAuthStore } from '@/entities/user'
import { useSharedHabitStore } from '@/entities/shared-habit'
import { Zap, RefreshCcw, Save, Loader2 } from 'lucide-react'
import { toast } from '@/shared/lib/toast'

interface AddSharedHabitModalProps {
  isOpen: boolean
  onClose: () => void
  contactId: string
  contactName: string
}

export function AddSharedHabitModal({ isOpen, onClose, contactId, contactName }: AddSharedHabitModalProps) {
  const { user } = useAuthStore()
  const { addSharedHabit } = useSharedHabitStore()
  const [isSaving, setIsSaving] = useState(false)
  
  const [title, setTitle] = useState('')
  const [frequency, setFrequency] = useState<'daily'|'weekly'|'custom'>('weekly')

  const handleSave = async () => {
    if (!user || !title) return
    setIsSaving(true)
    
    const supabase = createClient()
    const { data, error } = await (supabase
      .from('shared_habits') as any)
      .insert({
        user_id: user.id,
        contact_id: contactId,
        title,
        frequency: frequency
      })
      .select()
      .single()

    if (!error && data) {
      addSharedHabit(data as any)
      toast.success('Shared loop established.')
      onClose()
      setTitle('')
    } else {
      toast.error('Failed to sync shared habit.')
    }
    setIsSaving(false)
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Establish Habit with ${contactName}`} className="max-w-md">
      <div className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Habit Title</label>
          <div className="relative">
            <Zap className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/60" />
            <input 
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Weekly Strategy Sync"
              className="w-full bg-secondary/20 border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-[10px] uppercase font-black tracking-widest text-muted-foreground ml-1">Frequency</label>
          <div className="relative">
            <RefreshCcw className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40" />
            <select 
              value={frequency}
              onChange={(e) => setFrequency(e.target.value as any)}
              className="w-full bg-secondary/20 border-border/50 rounded-xl pl-10 pr-4 py-3 text-sm outline-none appearance-none"
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="custom">Monthly / Custom</option>
            </select>
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={isSaving || !title}
          className="w-full h-12 rounded-xl bg-primary text-primary-foreground font-display font-black uppercase tracking-widest gap-2"
        >
          {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          Establish Connection
        </Button>
      </div>
    </Modal>
  )
}
