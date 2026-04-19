"use client"

import React, { useState, useEffect } from 'react'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { Contact, useContactStore } from '@/entities/contact'
import { useDebtStore, calculateContactBalance } from '@/entities/debt'
import { useEventStore } from '@/entities/event'
import { useSharedHabitStore } from '@/entities/shared-habit'
import { useContactNoteStore } from '@/entities/contact-note'
import { createClient } from '@/shared/api/supabase'
import { useAuthStore } from '@/entities/user'
import { useVFXStore } from '@/shared/model/vfx-store'
import { 
  Instagram, 
  MessageSquare, 
  Send, 
  MapPin, 
  Plus, 
  CheckCircle2, 
  Clock,
  TrendingDown,
  TrendingUp,
  X,
  CreditCard,
  History,
  Phone,
  Mail,
  Calendar,
  StickyNote,
  Save,
  Loader2,
  User,
  Zap,
  Tag,
  AtSign,
  Briefcase
} from 'lucide-react'
import { LogDebtModal } from '@/features/social/manage-debt/ui/LogDebtModal'
import { AddEventModal } from '@/features/social/manage-events'
import { AddSharedHabitModal } from '@/features/social/manage-shared-habits'
import { QuickNoteInput } from '@/features/social/manage-notes'
import { cn } from '@/shared/lib/utils'
import { toast } from '@/shared/lib/toast'
import { motion, AnimatePresence } from 'framer-motion'

interface ContactDetailsProps {
  isOpen: boolean
  onClose: () => void
  contact: Contact
}

export function ContactDetails({ isOpen, onClose, contact }: ContactDetailsProps) {
  const { user } = useAuthStore()
  const { debts, settleDebt, setDebts } = useDebtStore()
  const { updateContact } = useContactStore()
  const { events, setEvents } = useEventStore()
  const { sharedHabits, setSharedHabits } = useSharedHabitStore()
  const { notes: chronologicalNotes, setNotes: setChronologicalNotes, deleteNote } = useContactNoteStore()
  const { addEffect } = useVFXStore()
  
  const [isLogDebtOpen, setIsLogDebtOpen] = useState(false)
  const [isAddEventOpen, setIsAddEventOpen] = useState(false)
  const [isAddHabitOpen, setIsAddHabitOpen] = useState(false)
  const [isSavingIdentity, setIsSavingIdentity] = useState(false)
  
  // Local state for identity editing
  const [personality, setPersonality] = useState(contact.personality || '')
  const [occupation, setOccupation] = useState(contact.occupation || '')

  useEffect(() => {
    if (isOpen && user) {
      fetchContactData()
    }
  }, [isOpen, contact.id, user])

  useEffect(() => {
    setPersonality(contact.personality || '')
    setOccupation(contact.occupation || '')
  }, [contact.id, contact.personality, contact.occupation])

  const fetchContactData = async () => {
    const supabase = createClient()
    
    // Fetch Events
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('contact_id', contact.id)
      .order('event_date', { ascending: false })
    if (eventData) setEvents(eventData)

    // Fetch Shared Habits
    const { data: habitData } = await supabase
      .from('shared_habits')
      .select('*')
      .eq('contact_id', contact.id)
    if (habitData) setSharedHabits(habitData)

    // Fetch Chronological Notes
    const { data: noteData } = await supabase
      .from('contact_notes')
      .select('*')
      .eq('contact_id', contact.id)
      .order('created_at', { ascending: false })
    if (noteData) setChronologicalNotes(noteData)
  }

  const handleSaveIdentity = async () => {
    if (!user) return
    setIsSavingIdentity(true)
    
    const supabase = createClient()
    const { error } = await (supabase
      .from('contacts') as any)
      .update({ personality, occupation })
      .eq('id', contact.id)

    if (!error) {
      updateContact({ ...contact, personality, occupation })
      toast.success('Identity profile synchronized.')
    } else {
      toast.error('Failed to update identity.')
    }
    setIsSavingIdentity(false)
  }

  const handleSettle = async (debtId: string) => {
    if (!user) return
    const supabase = createClient()
    const { error } = await (supabase
      .from('debts') as any)
      .update({ is_settled: true, settled_at: new Date().toISOString() })
      .eq('id', debtId)

    if (!error) {
      settleDebt(debtId)
      addEffect('xp_gain' as any, 15, window.innerWidth / 2, window.innerHeight / 2)
      await supabase.rpc('award_xp', { p_user_id: user.id, p_xp: 15, p_attribute_types: ['friends'] } as any)
      toast.success('Debt settled. Network integrity restored.')
    }
  }

  const handleHabitCheckIn = async (habitId: string) => {
    if (!user) return
    const supabase = createClient()
    
    // In a real app, we'd add a log entry for this check-in.
    // For now, we award XP and show a success message.
    addEffect('xp_gain' as any, 10, window.innerWidth / 2, window.innerHeight / 2)
    await supabase.rpc('award_xp', { 
      p_user_id: user.id, 
      p_xp: 10, 
      p_attribute_types: ['friends'] 
    } as any)
    toast.success('Connection loop strengthened. +10 XP')
  }

  const handleAddGroup = async () => {
    const groupName = prompt('Enter group name:')
    if (!groupName || !user) return

    const newGroups = [...(contact.groups || []), groupName]
    const supabase = createClient()
    const { error } = await (supabase
      .from('contacts') as any)
      .update({ groups: newGroups })
      .eq('id', contact.id)

    if (!error) {
      updateContact({ ...contact, groups: newGroups })
      toast.success(`Contact added to ${groupName}.`)
    }
  }

  const handleDeleteNote = async (noteId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('contact_notes').delete().eq('id', noteId)
    if (!error) {
      deleteNote(noteId)
      toast.success('Observation purged.')
    }
  }

  const netBalance = calculateContactBalance(debts, contact.id)
  const contactDebts = debts.filter(d => d.contact_id === contact.id).sort((a, b) => 
    new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )
  const contactEvents = events.filter(e => e.contact_id === contact.id)
  const contactHabits = sharedHabits.filter(h => h.contact_id === contact.id)

  const socialLinks = (contact.social_links as any) || {}

  // Native behavioral triggers
  const openProtocol = (type: string, value: string) => {
    switch (type) {
      case 'whatsapp': window.open(`https://wa.me/${value}`, '_blank'); break;
      case 'telegram': window.open(`https://t.me/${value}`, '_blank'); break;
      case 'instagram': window.open(`https://instagram.com/${value}`, '_blank'); break;
      case 'phone': window.open(`tel:${value}`); break;
      case 'email': window.open(`mailto:${value}`); break;
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Network Profile" className="max-w-3xl p-0 overflow-hidden bg-background/95 backdrop-blur-2xl">
      <div className="flex flex-col h-[85vh]">
        {/* Header/Cover Section */}
        <div className="relative h-48 bg-gradient-to-br from-primary/20 via-primary/5 to-transparent shrink-0">
           <div className="absolute top-6 right-6 z-10">
              <div className={cn(
                "px-5 py-2 rounded-2xl backdrop-blur-xl border-2 font-display font-black text-xl shadow-2xl",
                netBalance > 0 ? "bg-green-500/10 border-green-500/20 text-green-500" : netBalance < 0 ? "bg-red-500/10 border-red-500/20 text-red-500" : "bg-muted/10 border-border/20 text-muted-foreground/40"
              )}>
                {netBalance === 0 ? '$0' : (netBalance > 0 ? '+' : '-') + Math.abs(netBalance).toLocaleString()}
              </div>
           </div>
        </div>

        {/* Scrollable Content Layers */}
        <div className="flex-grow overflow-y-auto px-10 pb-20 -mt-24 relative z-10 scrollbar-hide">
          
          {/* Layer 1: Identity */}
          <div className="flex flex-col items-center mb-10">
            <div className="w-32 h-32 rounded-[2.5rem] bg-card border-4 border-background shadow-2xl overflow-hidden group mb-6 relative">
              {contact.photo_url ? (
                <img src={contact.photo_url} alt={contact.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-secondary/30">
                  <User className="w-12 h-12 text-muted-foreground/20" />
                </div>
              )}
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight mb-2 text-center">{contact.name}</h2>
            <div className="w-full max-w-sm relative">
                <AtSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-primary/40" />
                <input 
                  value={personality}
                  onChange={(e) => setPersonality(e.target.value)}
                  onBlur={handleSaveIdentity}
                  placeholder="Personality Tags (e.g. Visionary, Introvert)"
                  className="w-full bg-secondary/20 border-border/10 rounded-xl pl-9 pr-4 py-2 text-xs font-bold text-center placeholder:text-muted-foreground/30 focus:bg-secondary/30 transition-all outline-none"
                />
            </div>
          </div>

          <div className="space-y-10">
            {/* Layer 2: Groups */}
            <div className="flex flex-wrap justify-center gap-2">
              {contact.groups?.map(group => (
                <span key={group} className="px-4 py-1.5 bg-primary/10 text-primary text-[10px] font-black uppercase tracking-widest rounded-full border border-primary/20 shadow-sm">
                  {group}
                </span>
              ))}
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={handleAddGroup}
                className="h-7 w-7 p-0 rounded-full border border-dashed border-border/40 text-muted-foreground/40 hover:text-primary"
              >
                <Plus className="w-3.5 h-3.5" />
              </Button>
            </div>

            {/* Layer 3 & 5: Contact & Social Action Layer */}
            <div className="grid grid-cols-5 gap-3">
               {[
                 { id: 'phone', icon: Phone, color: 'text-primary', value: socialLinks.phone },
                 { id: 'email', icon: Mail, color: 'text-primary', value: socialLinks.email },
                 { id: 'whatsapp', icon: MessageSquare, color: 'text-green-500', value: socialLinks.whatsapp },
                 { id: 'telegram', icon: Send, color: 'text-blue-400', value: socialLinks.telegram },
                 { id: 'instagram', icon: Instagram, color: 'text-pink-500', value: socialLinks.instagram }
               ].map((item) => (
                 <Button 
                   key={item.id}
                   variant="outline"
                   disabled={!item.value}
                   onClick={() => item.value && openProtocol(item.id, item.value)}
                   className={cn(
                     "h-16 rounded-2xl flex flex-col items-center justify-center gap-1.5 border-border/50 bg-card hover:border-primary/50 transition-all group",
                     !item.value && "opacity-20 grayscale cursor-not-allowed"
                   )}
                 >
                   <item.icon className={cn("w-5 h-5 transition-transform group-hover:scale-110", item.color)} />
                   <span className="text-[8px] font-black uppercase tracking-widest opacity-40">{item.id}</span>
                 </Button>
               ))}
            </div>

            {/* Layer 4: Personal Data */}
            <div className="bg-secondary/10 rounded-3xl p-6 grid grid-cols-2 gap-8 border border-border/20">
               <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                    <MapPin className="w-3 h-3 text-primary/50" /> Location
                  </span>
                  <p className="text-sm font-bold">{contact.city || 'Undisclosed'}</p>
               </div>
               <div className="space-y-1.5">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                    <Calendar className="w-3 h-3 text-primary/50" /> Lifecycle Start
                  </span>
                  <p className="text-sm font-bold">
                    {contact.birthday ? new Date(contact.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' }) : 'Unknown'}
                  </p>
               </div>
               <div className="col-span-2 space-y-1.5 pt-4 border-t border-border/10">
                  <span className="text-[9px] font-black uppercase tracking-[0.2em] text-muted-foreground/40 flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-primary/50" /> Occupational Context
                  </span>
                   <input 
                    value={occupation}
                    onChange={(e) => setOccupation(e.target.value)}
                    onBlur={handleSaveIdentity}
                    placeholder="Set occupation..."
                    className="w-full bg-transparent border-none text-sm font-bold focus:ring-0 p-0 placeholder:text-muted-foreground/20"
                  />
               </div>
            </div>

            {/* Layer 6: Events (Timeline) */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 flex items-center gap-3">
                  <History className="w-4 h-4" /> Interaction Registry
                </h4>
                <Button variant="ghost" size="sm" onClick={() => setIsAddEventOpen(true)} className="h-8 rounded-xl bg-primary/5 text-primary text-[10px] font-black hover:bg-primary/10 uppercase tracking-widest gap-2">
                   <Plus className="w-3 h-3" /> Log Event
                </Button>
              </div>

              <div className="relative pl-6 space-y-8 before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-px before:bg-gradient-to-b before:from-primary/30 before:via-border before:to-transparent">
                  {contactEvents.length > 0 ? contactEvents.map((event) => (
                    <div key={event.id} className="relative group">
                       <div className="absolute -left-[23px] top-1 w-4 h-4 rounded-full bg-background border-2 border-primary group-hover:scale-125 transition-transform" />
                       <div className="bg-card/50 rounded-2xl p-4 border border-border/50 group-hover:border-primary/30 hover:shadow-lg transition-all">
                          <div className="flex items-start justify-between mb-1">
                             <h5 className="text-sm font-bold tracking-tight">{event.title}</h5>
                             <span className="text-[9px] font-black text-primary uppercase tracking-widest px-2 py-0.5 bg-primary/5 rounded-full border border-primary/10">
                               {event.category}
                             </span>
                          </div>
                          <p className="text-[10px] text-muted-foreground font-medium flex items-center gap-1.5">
                             <Clock className="w-3 h-3" /> {new Date(event.event_date).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </p>
                          {event.description && <p className="mt-2 text-xs text-muted-foreground/70 leading-relaxed italic">{event.description}</p>}
                       </div>
                    </div>
                  )) : (
                    <div className="text-center py-10 opacity-20 filter grayscale">
                       <History className="w-12 h-12 mx-auto mb-2" />
                       <p className="text-[10px] font-black uppercase tracking-widest">No Events Recorded</p>
                    </div>
                  )}
              </div>
            </div>

            {/* Layer 7: Obligations & Shared Habits */}
            <div className="space-y-6">
               <div className="flex items-center justify-between">
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 flex items-center gap-3">
                  <Zap className="w-4 h-4" /> Active Loops & Obligations
                </h4>
                <div className="flex gap-2">
                   <Button variant="ghost" size="sm" onClick={() => setIsAddHabitOpen(true)} className="h-8 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest gap-2">
                      <Plus className="w-3 h-3" /> Loop
                   </Button>
                   <Button variant="ghost" size="sm" onClick={() => setIsLogDebtOpen(true)} className="h-8 rounded-xl bg-primary/5 text-primary text-[10px] font-black uppercase tracking-widest gap-2">
                      <Plus className="w-3 h-3" /> Ledger
                   </Button>
                </div>
              </div>

              <div className="grid grid-cols-1 gap-4">
                  {/* Shared Habits */}
                  {contactHabits.map((habit) => (
                    <div key={habit.id} className="bg-gradient-to-r from-primary/5 to-transparent border border-primary/10 rounded-2xl p-5 flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:rotate-12 transition-transform">
                             <Zap className="w-5 h-5" />
                          </div>
                          <div>
                             <h5 className="text-sm font-bold tracking-tight">{habit.title}</h5>
                             <span className="text-[9px] font-black text-muted-foreground uppercase tracking-widest opacity-60">Frequency: {habit.frequency}</span>
                          </div>
                       </div>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => handleHabitCheckIn(habit.id)}
                         className="h-10 w-10 p-0 rounded-xl hover:bg-primary hover:text-white transition-colors border border-border/50 group-hover:border-primary/50"
                       >
                         <CheckCircle2 className="w-5 h-5" />
                       </Button>
                    </div>
                  ))}

                  {/* Active Debts */}
                  {contactDebts.filter(d => !d.is_settled).map((debt) => (
                    <div key={debt.id} className="bg-card border border-border/50 rounded-2xl p-5 flex items-center justify-between hover:border-primary/30 transition-all group">
                       <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center",
                            debt.direction === 'they_owe' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                          )}>
                             {debt.direction === 'they_owe' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />}
                          </div>
                          <div>
                             <h5 className="text-sm font-bold tracking-tight">{debt.description || 'General Debt'}</h5>
                             <p className="text-base font-display font-black leading-tight">
                                {debt.direction === 'they_owe' ? '+' : '-'}{debt.amount}{debt.currency}
                             </p>
                          </div>
                       </div>
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => handleSettle(debt.id)}
                         className="h-10 w-10 p-0 rounded-xl hover:bg-primary hover:text-white transition-colors border border-border/50 group-hover:border-primary/50"
                       >
                         <CheckCircle2 className="w-5 h-5" />
                       </Button>
                    </div>
                  ))}
              </div>
            </div>

            {/* Layer 8: Memory Layer (Notes) */}
            <div className="space-y-6">
               <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/50 flex items-center gap-3">
                  <StickyNote className="w-4 h-4" /> Intelligence Archive
                </h4>
                
                <QuickNoteInput contactId={contact.id} />

                <div className="space-y-4">
                  <AnimatePresence initial={false}>
                    {chronologicalNotes.map((note) => (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        key={note.id} 
                        className="bg-muted/30 border border-border/30 rounded-2xl p-5 group relative"
                      >
                         <button 
                           onClick={() => handleDeleteNote(note.id)}
                           className="absolute top-4 right-4 text-muted-foreground/20 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                         >
                            <X className="w-4 h-4" />
                         </button>
                         <p className="text-sm font-medium leading-relaxed text-foreground/80 pr-4">{note.content}</p>
                         <div className="mt-3 flex items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground/40">
                              {new Date(note.created_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                            </span>
                         </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
            </div>
          </div>
        </div>
      </div>

      <LogDebtModal 
        isOpen={isLogDebtOpen} 
        onClose={() => setIsLogDebtOpen(false)} 
        contactId={contact.id} 
        contactName={contact.name}
      />

      <AddEventModal 
        isOpen={isAddEventOpen} 
        onClose={() => setIsAddEventOpen(false)}
        contactId={contact.id}
        contactName={contact.name}
      />

      <AddSharedHabitModal 
        isOpen={isAddHabitOpen} 
        onClose={() => setIsAddHabitOpen(false)}
        contactId={contact.id}
        contactName={contact.name}
      />
    </Modal>
  )
}
