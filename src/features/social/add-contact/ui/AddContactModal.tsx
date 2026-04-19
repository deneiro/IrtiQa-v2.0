"use client"

import React, { useState } from 'react'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { useContactStore } from '@/entities/contact'
import { createClient } from '@/shared/api/supabase'
import { 
  UserPlus, 
  Users,
  Image as ImageIcon, 
  MapPin, 
  Group, 
  Instagram, 
  Send, 
  Phone,
  Mail,
  Calendar,
  MessageSquare
} from 'lucide-react'
import { useAuthStore } from '@/entities/user'
import { toast } from '@/shared/lib/toast'

interface AddContactModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddContactModal({ isOpen, onClose }: AddContactModalProps) {
  const { user } = useAuthStore()
  const { addContact } = useContactStore()
  const [loading, setLoading] = useState(false)
  
  const [formData, setFormData] = useState({
    name: '',
    photo_url: '',
    city: '',
    birthday: '',
    groups: '',
    instagram: '',
    whatsapp: '',
    telegram: '',
    phone: '',
    email: '',
    personality: '',
    occupation: '',
    gender: 'neutral',
    notes: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.name) return

    setLoading(true)
    const supabase = createClient()
    
    const social_links = {
      instagram: formData.instagram.trim(),
      whatsapp: formData.whatsapp.trim(),
      telegram: formData.telegram.trim(),
      phone: formData.phone.trim(),
      email: formData.email.trim()
    }

    const { data: contact, error } = await (supabase
      .from('contacts') as any)
      .insert({
        user_id: user.id,
        name: formData.name,
        photo_url: formData.photo_url || null,
        city: formData.city || null,
        birthday: formData.birthday || null,
        groups: formData.groups.split(',').map(g => g.trim()).filter(Boolean),
        social_links,
        personality: formData.personality || null,
        occupation: formData.occupation || null,
        gender: formData.gender as any || 'neutral',
        notes: formData.notes || null
      })
      .select()
      .single()

    if (error) {
      console.error('Error adding contact:', error)
      toast.error('Failed to add contact.')
      setLoading(false)
      return
    }

    if (contact) {
      addContact(contact)
      toast.success(`${contact.name} added to your network!`)
      
      // Award XP for adding a contact
      await supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_xp: 15,
        p_attribute_types: ['friends']
      } as any)
      
      // Increment stat for achievements
      await supabase.rpc('increment_stat', {
        p_user_id: user.id,
        p_stat_key: 'total_contacts_added'
      } as any)
    }

    setLoading(false)
    onClose()
    setFormData({
      name: '',
      photo_url: '',
      city: '',
      birthday: '',
      groups: '',
      instagram: '',
      whatsapp: '',
      telegram: '',
      phone: '',
      email: '',
      personality: '',
      occupation: '',
      gender: 'neutral',
      notes: ''
    })
  }

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Establish Intelligence Connection" 
      className="max-w-2xl"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {/* Identity Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2 px-1">Full Identity</label>
              <div className="relative">
                <UserPlus className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary" />
                <input
                  type="text"
                  required
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-bold"
                  placeholder="Subject Name"
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2 px-1">Visual ID (URL)</label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-display"
                  placeholder="https://..."
                  value={formData.photo_url}
                  onChange={e => setFormData({ ...formData, photo_url: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2 px-1">Sector (City)</label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-display"
                  placeholder="San Francisco"
                  value={formData.city}
                  onChange={e => setFormData({ ...formData, city: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* New v2.0 Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2 px-1">Temporal Origin (Birthday)</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="date"
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                  value={formData.birthday}
                  onChange={e => setFormData({ ...formData, birthday: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2 px-1">Archetype (Gender)</label>
              <select
                className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm appearance-none outline-none font-display font-medium"
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
              >
                <option value="neutral">Neutral/Other</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2 px-1">Personality Baseline (Tags)</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-primary/40" />
                <input
                  type="text"
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-display"
                  placeholder="Visionary, Strategic, Quiet..."
                  value={formData.personality}
                  onChange={e => setFormData({ ...formData, personality: e.target.value })}
                />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2 px-1">Occupational Context</label>
              <input
                type="text"
                className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm font-display"
                placeholder="Software Architect"
                value={formData.occupation}
                onChange={e => setFormData({ ...formData, occupation: e.target.value })}
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2 px-1">Classification (Groups)</label>
            <div className="relative">
              <Group className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm opacity-80"
                placeholder="Colleagues, Friends (Comma separated)"
                value={formData.groups}
                onChange={e => setFormData({ ...formData, groups: e.target.value })}
              />
            </div>
          </div>

          {/* Social Links Grid */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-3 px-1">Communication Channels</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="relative">
                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-pink-500/50 transition-all text-sm"
                  placeholder="Instagram handle"
                  value={formData.instagram}
                  onChange={e => setFormData({ ...formData, instagram: e.target.value })}
                />
              </div>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-green-500/50 transition-all text-sm"
                  placeholder="WhatsApp Number"
                  value={formData.whatsapp}
                  onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                />
              </div>
              <div className="relative">
                <Send className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                  placeholder="Telegram Username"
                  value={formData.telegram}
                  onChange={e => setFormData({ ...formData, telegram: e.target.value })}
                />
              </div>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="text"
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  placeholder="Direct Phone"
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                />
              </div>
              <div className="md:col-span-2 relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="email"
                  className="w-full bg-secondary/30 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all text-sm"
                  placeholder="Primary Email Address"
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60 block mb-2 px-1">Tactical Notes</label>
            <textarea
              className="w-full bg-secondary/30 border border-border/50 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px] text-sm"
              placeholder="Record known weaknesses, strengths, or shared history..."
              value={formData.notes}
              onChange={e => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-6 border-t border-border/50">
          <Button variant="ghost" onClick={onClose} type="button" className="rounded-xl uppercase font-black text-[10px] tracking-widest">Cancel</Button>
          <Button type="submit" disabled={loading} className="rounded-xl px-8 h-12 bg-primary text-primary-foreground font-display font-black shadow-lg shadow-primary/20">
            {loading ? 'SYNCING...' : 'ESTABLISH LINK'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
