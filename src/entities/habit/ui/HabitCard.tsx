'use client'

import React, { useState } from 'react'
import { Card } from '@/shared/ui/card'
import { 
  Flame, 
  CheckCircle2, 
  MoreHorizontal, 
  Skull, 
  ChevronDown,
  Activity,
  ShieldCheck,
  Clock
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { Database } from '@/shared/types/database.types'
import { GAME_CORE } from '@/shared/config/game-core'
import { HabitCalendar } from '@/features/habits/ui/HabitCalendar'
import { useVFXStore } from '@/shared/model/vfx-store'
import { motion, AnimatePresence } from 'framer-motion'
import useSound from 'use-sound'

type HabitRow = Database['public']['Tables']['habits']['Row']
type HabitLogRow = Database['public']['Tables']['habit_logs']['Row']
type HabitLogStatus = Database['public']['Enums']['habit_log_status']

interface HabitCardProps {
  habit: HabitRow
  logs: HabitLogRow[]
  currentStatus?: HabitLogStatus
  isScheduledToday?: boolean
  onUpdateStatus?: (id: string, status: HabitLogStatus) => void
  onOpenDetails?: (id: string) => void
  className?: string
}

export function HabitCard({ 
  habit, 
  logs,
  currentStatus = 'empty', 
  isScheduledToday = true,
  onUpdateStatus, 
  onOpenDetails,
  className 
 }: HabitCardProps) {
  const { addEffect } = useVFXStore()
  const [intelExpanded, setIntelExpanded] = useState(false)
  const [playPop] = useSound('/sounds/pop.mp3', { volume: 0.5 })
  const [playHurt] = useSound('/sounds/hurt.mp3', { volume: 0.5 })
  
  const isBad = habit.type === 'bad'
  const primaryAttr = habit.attribute_ids?.[0] || 'health'
  const attrConfig = (GAME_CORE.ATTRIBUTES as any)[primaryAttr]
  const accentColor = isBad ? '#ef4444' : (attrConfig?.color || '#3b82f6')
  
  const handleStatusUpdate = (status: HabitLogStatus, e: React.MouseEvent) => {
    if (!isScheduledToday) return
    e.stopPropagation()
    const x = e.clientX
    const y = e.clientY

    if (onUpdateStatus) {
      if (status === 'completed') {
        playPop()
        if (!isBad) {
          addEffect('xp', habit.xp_reward, x, y)
          addEffect('gold', 2, x + 20, y - 20)
        } else {
          addEffect('xp', 5, x, y) // Small reward for active avoidance
        }
      } else if (status === 'failed') {
        playHurt()
        addEffect('damage', isBad ? 15 : 10, x, y)
      }
      onUpdateStatus(habit.id, status)
    }
  }

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-500 border-2 bg-card/80 backdrop-blur-md",
        !isScheduledToday && "opacity-60 grayscale-[0.7] border-border/30 bg-secondary/5",
        currentStatus === 'completed' && isScheduledToday && "border-green-500/20 bg-green-500/5",
        currentStatus === 'failed' && isScheduledToday && "border-red-500/20 bg-red-500/5",
        currentStatus === 'empty' && isScheduledToday && "border-border/50 hover:border-border",
        className
      )}
      style={{
        boxShadow: (intelExpanded && isScheduledToday) ? `0 10px 30px -10px ${accentColor}15` : 'none'
      }}
    >
      <div 
        className="absolute -right-4 -top-4 w-32 h-32 blur-[80px] opacity-0 group-hover:opacity-10 transition-opacity rounded-full pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      <div className="relative z-10">
        <div className="p-5 flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
               <div className="text-[10px] font-mono tracking-[0.3em] uppercase opacity-20">Protocol :: {habit.type}</div>
               {!isScheduledToday && (
                 <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-secondary text-muted-foreground/60 animate-pulse">
                   <Clock className="w-2.5 h-2.5" />
                   <span className="text-[8px] font-mono font-bold uppercase tracking-widest">Awaiting Window</span>
                 </div>
               )}
            </div>
            <h3 className="font-display font-black text-xl truncate tracking-tight uppercase italic decoration-primary/20 decoration-2 underline-offset-4">
              {habit.title}
            </h3>
            
            <div className="flex items-center gap-4 mt-2">
              <div className="flex items-center text-orange-500 font-bold text-xs bg-orange-500/5 px-2 py-0.5 rounded border border-orange-500/10">
                <Flame className="w-3.5 h-3.5 mr-1 fill-orange-500/20" />
                {habit.current_streak} {isBad ? 'CLEAN' : 'STREAK'}
              </div>
              <div className="text-[10px] uppercase font-mono text-muted-foreground/40 tracking-widest">
                Target: {habit.xp_reward}XP
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            {!isBad ? (
              // GOOD HABIT UI
              <button
                onClick={(e) => handleStatusUpdate('completed', e)}
                disabled={currentStatus !== 'empty' || !isScheduledToday}
                className={cn(
                  "w-14 h-14 rounded-xl flex flex-col items-center justify-center transition-all duration-500 active:scale-90 shadow-xl border-2 gap-1 group/btn",
                  currentStatus === 'completed' 
                    ? "bg-green-500 border-green-400 text-black cursor-default" 
                    : "bg-secondary/60 border-border text-muted-foreground/40 hover:border-green-500/50 hover:text-green-500",
                  (currentStatus === 'failed' || !isScheduledToday) && "opacity-50 grayscale cursor-not-allowed"
                )}
                style={{
                   borderColor: currentStatus === 'completed' && isScheduledToday ? '#22c55e' : undefined,
                   backgroundColor: currentStatus === 'completed' && isScheduledToday ? '#22c55e' : undefined,
                   color: currentStatus === 'completed' && isScheduledToday ? '#fff' : undefined
                }}
              >
                {currentStatus === 'completed' ? (
                  <CheckCircle2 className="w-7 h-7 stroke-[3px]" />
                ) : (
                  <>
                    <div className={cn(
                      "w-2 h-2 rounded-full transition-colors",
                      isScheduledToday ? "bg-green-500/30 group-hover/btn:bg-green-500 group-hover/btn:animate-ping" : "bg-muted-foreground/20"
                    )} />
                    <span className="text-[8px] font-mono font-bold uppercase tracking-tighter">Done</span>
                  </>
                )}
              </button>
            ) : (
              // BAD HABIT UI
              <div className="flex gap-2">
                {/* AVOIDED BUTTON */}
                <button
                  onClick={(e) => handleStatusUpdate('completed', e)}
                  disabled={currentStatus !== 'empty' || !isScheduledToday}
                  className={cn(
                    "w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-300 active:scale-95 border-2 gap-1",
                    currentStatus === 'completed'
                      ? "bg-green-500 border-green-400 text-white cursor-default"
                      : "bg-secondary/40 border-border text-muted-foreground/40 hover:border-green-500 hover:text-green-500",
                    (currentStatus === 'failed' || !isScheduledToday) && "opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  <ShieldCheck className="w-5 h-5" />
                  <span className="text-[7px] font-mono uppercase font-black">Avoid</span>
                </button>

                {/* RELAPSE BUTTON */}
                <button
                  onClick={(e) => handleStatusUpdate('failed', e)}
                  disabled={currentStatus !== 'empty' || !isScheduledToday}
                  className={cn(
                    "w-12 h-12 rounded-xl flex flex-col items-center justify-center transition-all duration-300 active:scale-95 border-2 gap-1",
                    currentStatus === 'failed'
                      ? "bg-red-500 border-red-400 text-white cursor-default"
                      : "bg-secondary/40 border-red-500/20 text-red-500/60 hover:border-red-500 hover:text-red-500",
                    (currentStatus === 'completed' || !isScheduledToday) && "opacity-50 grayscale cursor-not-allowed"
                  )}
                >
                  <Skull className="w-5 h-5" />
                  <span className="text-[7px] font-mono uppercase font-black">Fail</span>
                </button>
              </div>
            )}
            
            <button 
              onClick={() => onOpenDetails?.(habit.id)}
              className="p-1 px-3 text-muted-foreground/10 hover:text-foreground transition-colors"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tactical Footer */}
        <div className="border-t border-border bg-secondary/10 group/footer">
           <button 
             onClick={() => setIntelExpanded(!intelExpanded)}
             className="w-full flex items-center justify-between px-5 py-2 hover:bg-secondary/30 transition-colors"
           >
              <div className="flex items-center gap-2">
                 <Activity className="w-3 h-3 text-muted-foreground/30" />
                 <span className="text-[9px] font-mono uppercase tracking-[0.3em] text-muted-foreground/40 group-hover/footer:text-muted-foreground/80 transition-colors italic font-bold">Progress Intel</span>
              </div>
              <motion.div animate={{ rotate: intelExpanded ? 180 : 0 }}>
                 <ChevronDown className="w-3 h-3 text-muted-foreground/30" />
              </motion.div>
           </button>

           <AnimatePresence>
              {intelExpanded && (
                <motion.div 
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-5 pb-6">
                    <div className="mt-4">
                      <HabitCalendar 
                        habit={habit}
                        logs={logs} 
                        days={35} 
                        accentColor={accentColor}
                      />
                    </div>
                  </div>
                </motion.div>
              )}
           </AnimatePresence>
        </div>
      </div>
    </Card>
  )
}
