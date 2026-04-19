'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { GAME_CORE } from '@/shared/config/game-core'
import { useHabits } from '../model/useHabits'
import useSound from 'use-sound'
import { Database } from '@/shared/types/database.types'
import { X, Activity, Info, Calendar as CalendarIcon, Clock, Skull } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { format, addDays } from 'date-fns'

type AttributeType = Database['public']['Enums']['attribute_type']
type HabitFrequency = Database['public']['Enums']['habit_frequency']

interface CreateHabitModalProps {
  onClose: () => void
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function CreateHabitModal({ onClose }: CreateHabitModalProps) {
  const { createHabit } = useHabits()
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [playPuff] = useSound('/sounds/puff.mp3', { volume: 0.5 })
  
  const [title, setTitle] = useState('')
  const [type, setType] = useState<'good' | 'bad'>('good')
  const [frequency, setFrequency] = useState<HabitFrequency>('daily')
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]) // Mon-Fri
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeType[]>(['health'])

  const toggleAttribute = (attr: AttributeType) => {
    setSelectedAttributes(prev => {
      if (prev.includes(attr)) return prev.filter(a => a !== attr)
      if (prev.length >= 3) return prev
      return [...prev, attr]
    })
  }

  const toggleDay = (day: number) => {
    setSelectedDays(prev => prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day])
  }

  const handleCreate = async () => {
    if (!title.trim()) return
    
    setIsLoading(true)
    setErrorMsg(null)
    playPuff() 

    try {
      await createHabit({
        title,
        type,
        attribute_ids: selectedAttributes,
        xp_reward: 10,
        frequency,
        schedule_days: frequency === 'weekly' || frequency === 'custom' ? selectedDays : null,
        schedule_dates: frequency === 'occasional' ? selectedDates : []
      })
      onClose()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to initiate routine')
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-background/90 backdrop-blur-md"
      />

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="relative bg-card backdrop-blur-2xl border border-border/50 rounded-[2.5rem] w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col"
      >
        {/* Header */}
        <div className="p-8 border-b border-border/50 flex items-center justify-between bg-secondary/10">
          <div className="flex items-center gap-4">
            <div className="p-3 rounded-2xl bg-primary/10 text-primary">
              <Activity className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-display font-black text-2xl tracking-tight uppercase italic flex items-center gap-2">
                Routine <span className="opacity-20 text-xl">::</span> Initiation
              </h2>
              <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground/60">System core habitualization protocol</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-secondary rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 space-y-8 overflow-y-auto max-h-[65vh] custom-scrollbar">
          {errorMsg && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-xs font-mono uppercase tracking-wider flex items-center gap-3">
              <Info className="w-4 h-4" />
              {errorMsg}
            </div>
          )}

          {/* Title input */}
          <div className="space-y-4">
            <label className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">
              Habit Designation (Title)
            </label>
            <input 
              autoFocus
              className="w-full bg-secondary/20 border border-border/50 rounded-3xl p-6 text-2xl font-display font-black text-foreground focus:outline-none focus:border-primary/50 transition-all placeholder:text-muted-foreground/10 uppercase italic"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. NEURAL MAPPING" 
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Type Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">
                Polarity (Alignment)
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setType('good')}
                  className={cn(
                    "p-5 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-32",
                    type === 'good' 
                      ? "border-green-500 bg-green-500/10 text-green-500 shadow-lg shadow-green-500/10" 
                      : "border-border/50 text-muted-foreground/40 hover:border-border"
                  )}
                >
                  <Activity className="w-5 h-5" />
                  <div>
                    <div className="font-display font-black text-xs uppercase italic">Constructive</div>
                    <div className="text-[9px] opacity-60 font-mono leading-tight mt-1 uppercase">Build streaks & XP via check-ins.</div>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={() => setType('bad')}
                  className={cn(
                    "p-5 rounded-3xl border-2 transition-all text-left flex flex-col justify-between h-32",
                    type === 'bad' 
                      ? "border-red-500 bg-red-500/10 text-red-500 shadow-lg shadow-red-500/10" 
                      : "border-border/50 text-muted-foreground/40 hover:border-border"
                  )}
                >
                  <Skull className="w-5 h-5" />
                  <div>
                    <div className="font-display font-black text-xs uppercase italic">Destructive</div>
                    <div className="text-[9px] opacity-60 font-mono leading-tight mt-1 uppercase">Avoid to stay clean. HP risk.</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Frequency Selection */}
            <div className="space-y-4">
              <label className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-muted-foreground ml-1">
                Recurrence (Frequency)
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['daily', 'weekly', 'occasional'].map((f) => (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFrequency(f as HabitFrequency)}
                    className={cn(
                      "p-3 rounded-2xl border-2 transition-all flex flex-col items-center justify-center gap-2",
                      frequency === f 
                        ? "border-primary bg-primary/10 text-primary shadow-lg shadow-primary/10" 
                        : "border-border/50 text-muted-foreground/40 hover:border-border"
                    )}
                  >
                    {f === 'daily' && <Clock className="w-4 h-4" />}
                    {f === 'weekly' && <CalendarIcon className="w-4 h-4" />}
                    {f === 'occasional' && <Activity className="w-4 h-4" />}
                    <span className="font-display font-bold text-[9px] uppercase italic">{f}</span>
                  </button>
                ))}
              </div>

              {/* Weekly/Occasional Config */}
              <AnimatePresence mode="wait">
                {frequency === 'weekly' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="flex justify-between gap-1 mt-2"
                  >
                    {DAYS_OF_WEEK.map((day, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => toggleDay(i)}
                        className={cn(
                          "w-8 h-8 rounded-lg border text-[9px] font-mono font-bold transition-all",
                          selectedDays.includes(i) ? "bg-primary text-black border-primary" : "bg-secondary/40 border-border/50 text-muted-foreground/40"
                        )}
                      >
                        {day[0]}
                      </button>
                    ))}
                  </motion.div>
                )}
                {frequency === 'occasional' && (
                   <motion.div 
                    initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
                    className="text-[10px] font-mono text-muted-foreground/40 bg-secondary/20 p-3 rounded-2xl border border-border/50 italic"
                   >
                     Experimental: Log will appear only on manually specified dates.
                   </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Attribute Multi-select */}
          <div className="space-y-4">
            <label className="text-[10px] font-mono font-black uppercase tracking-[0.3em] text-muted-foreground ml-1 flex justify-between">
              Linked Attributes (Sync)
              <span className={cn(selectedAttributes.length >= 3 ? "text-orange-500" : "")}>
                {selectedAttributes.length} / 3
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(GAME_CORE.ATTRIBUTES).map(([key, attr]) => {
                const isSelected = selectedAttributes.includes(key as AttributeType)
                const isLimitReached = selectedAttributes.length >= 3
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAttribute(key as AttributeType)}
                    disabled={!isSelected && isLimitReached}
                    className={cn(
                      "p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 group",
                      isSelected
                        ? "bg-secondary border-border text-foreground border-opacity-100"
                        : "bg-secondary/20 border-border/30 text-muted-foreground/40 hover:border-border/60 hover:text-muted-foreground opacity-60 hover:opacity-100",
                      !isSelected && isLimitReached && "opacity-20 cursor-not-allowed hover:border-border"
                    )}
                    style={{ 
                      borderColor: isSelected ? attr.color : undefined,
                      backgroundColor: isSelected ? attr.color + '05' : undefined,
                      color: isSelected ? attr.color : undefined
                    }}
                  >
                    <div 
                      className="w-2.5 h-2.5 rounded-full shadow-[0_0_10px_rgba(0,0,0,0.5)]" 
                      style={{ backgroundColor: attr.color }} 
                    />
                    <span className="font-display font-black text-[9px] uppercase tracking-tighter italic">{attr.name}</span>
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-8 border-t border-border/50 bg-secondary/10 flex justify-end gap-4">
          <Button variant="ghost" onClick={onClose} disabled={isLoading} className="font-mono uppercase text-xs tracking-widest hover:text-red-500">
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={isLoading || !title.trim() || selectedAttributes.length === 0}
            className="bg-primary hover:bg-primary/90 text-black font-display font-black uppercase tracking-widest px-12 h-14 rounded-2xl shadow-xl shadow-primary/10 transition-all hover:scale-105 active:scale-95"
          >
            {isLoading ? 'Processing' : 'Initiate Routine'}
          </Button>
        </div>
      </motion.div>
    </div>
  )
}
