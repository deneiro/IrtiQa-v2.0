"use client"

import React, { useState } from 'react'
import { createClient } from '@/shared/api/supabase'
import { useAuthStore } from '@/entities/user'
import { useContactNoteStore } from '@/entities/contact-note'
import { Send, Loader2 } from 'lucide-react'
import { toast } from '@/shared/lib/toast'

interface QuickNoteInputProps {
  contactId: string
  onNoteAdded?: () => void
}

export function QuickNoteInput({ contactId, onNoteAdded }: QuickNoteInputProps) {
  const { user } = useAuthStore()
  const { addNote } = useContactNoteStore()
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  const handleSave = async () => {
    if (!user || !content.trim()) return
    setIsSaving(true)
    
    const supabase = createClient()
    const { data, error } = await (supabase
      .from('contact_notes') as any)
      .insert({
        user_id: user.id,
        contact_id: contactId,
        content: content.trim()
      })
      .select()
      .single()

    if (!error && data) {
      addNote(data)
      setContent('')
      onNoteAdded?.()
      toast.success('Observation recorded.')
    } else {
      toast.error('Failed to save note.')
    }
    setIsSaving(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSave()
    }
  }

  return (
    <div className="relative group">
      <textarea 
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="Enter new intelligence data... (Shift+Enter for newline)"
        className="w-full bg-secondary/10 border border-border/50 rounded-2xl px-5 py-4 text-sm resize-none outline-none focus:bg-secondary/20 focus:border-primary/30 transition-all min-h-[100px] font-medium leading-relaxed"
      />
      <button 
        onClick={handleSave}
        disabled={isSaving || !content.trim()}
        className="absolute bottom-4 right-4 p-2.5 rounded-xl bg-primary text-primary-foreground hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 shadow-lg shadow-primary/20"
      >
        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
      </button>
    </div>
  )
}
