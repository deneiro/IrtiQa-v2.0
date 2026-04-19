'use client'

import React from 'react'
import { cn } from '@/shared/lib/utils'
import { Database } from '@/shared/types/database.types'
import { format, subDays, isSameDay, startOfDay } from 'date-fns'
import { motion } from 'framer-motion'

type HabitLogRow = Database['public']['Tables']['habit_logs']['Row']

interface HabitMatrixProps {
  logs: HabitLogRow[]
  days?: number
  accentColor?: string
}

export function HabitMatrix({ logs, days = 28, accentColor = '#3b82f6' }: HabitMatrixProps) {
  const today = startOfDay(new Date())
  
  // Generate date range
  const dateRange = [...Array(days)].map((_, i) => subDays(today, days - 1 - i))

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/50">Tactical History</span>
        <div className="flex gap-4">
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-sm bg-white/10" />
            <span className="text-[9px] font-mono uppercase text-muted-foreground/30">Missed</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: accentColor }} />
            <span className="text-[9px] font-mono uppercase text-muted-foreground/30">Aligned</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1.5 p-3 rounded-xl bg-black/40 border border-white/5">
        {dateRange.map((date, idx) => {
          const dateStr = format(date, 'yyyy-MM-dd')
          const log = logs.find(l => isSameDay(new Date(l.logged_at), date))
          const isCompleted = log?.completed
          
          return (
            <motion.div 
              key={dateStr}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: idx * 0.01 }}
              className={cn(
                "aspect-square rounded-sm relative group/cell transition-all duration-300",
                isCompleted 
                  ? "shadow-[0_0_10px_rgba(var(--accent-rgb),0.2)]" 
                  : "bg-white/[0.03] hover:bg-white/[0.08]"
              )}
              style={{ 
                backgroundColor: isCompleted ? accentColor : undefined,
                opacity: isCompleted ? 1 : (isSameDay(date, today) ? 0.4 : 0.2)
              }}
            >
               {/* Tooltip */}
               <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-zinc-900 border border-white/10 rounded text-[9px] font-mono text-white opacity-0 group-hover/cell:opacity-100 pointer-events-none transition-opacity z-20 whitespace-nowrap">
                  {format(date, 'MMM dd')}: {isCompleted ? '✓ MISSION ALIGNED' : '∅ NO SIGNAL'}
               </div>
            </motion.div>
          )
        })}
      </div>
      
      <div className="grid grid-cols-7 gap-1.5 px-3">
         {['M','T','W','T','F','S','S'].map((day, i) => (
           <span key={i} className="text-[8px] font-mono text-center text-muted-foreground/20 font-bold">{day}</span>
         ))}
      </div>
    </div>
  )
}
