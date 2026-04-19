'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle2, Target, BookOpen, TrendingUp, AlertCircle, Clock } from 'lucide-react'
import { useActivityStore } from '@/entities/activity'
import { format } from 'date-fns'
import { cn } from '@/shared/lib/utils'
import { GAME_CORE } from '@/shared/config/game-core'

export function ActivityFeed() {
  const { events, isLoading, fetchHistory } = useActivityStore()

  useEffect(() => {
    fetchHistory()
  }, [fetchHistory])

  if (isLoading && events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-40">
        <Clock className="w-8 h-8 mb-4 animate-spin-slow" />
        <span className="text-xs uppercase tracking-[0.3em] font-mono">Syncing History...</span>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 opacity-30">
        <AlertCircle className="w-8 h-8 mb-4" />
        <span className="text-xs uppercase tracking-[0.3em] font-mono">No Records Found</span>
      </div>
    )
  }

  return (
    <div className="space-y-8 relative before:absolute before:inset-0 before:ml-[1.2rem] before:w-[1px] before:bg-gradient-to-b before:from-primary/30 before:via-border/40 before:to-transparent">
      <AnimatePresence mode="popLayout">
        {events.map((event, idx) => {
          const Icon = getEventIcon(event.type)
          const color = getEventColor(event)
          
          return (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.03 }}
              className="relative pl-12 group"
            >
              {/* Timeline Dot */}
              <div 
                className="absolute left-0 top-1 w-10 h-10 -ml-[5px] rounded-xl border border-border bg-background flex items-center justify-center z-10 transition-transform group-hover:scale-110 shadow-[0_4px_20px_rgba(0,0,0,0.1)] group-hover:border-primary/50"
              >
                <Icon className="w-4 h-4" style={{ color }} />
              </div>

              <div className="flex flex-col gap-1.5 py-1">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold tracking-tight text-foreground/90 group-hover:text-primary transition-colors">
                    {event.title}
                  </span>
                  <span className="text-[10px] font-mono text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded border border-border uppercase">
                    {format(new Date(event.timestamp), 'MMM dd, HH:mm')}
                  </span>
                </div>
                
                <p className="text-xs text-muted-foreground/80 leading-relaxed font-medium">
                  {event.description}
                </p>
                
                {event.metadata?.attr_key && (
                  <div className="flex mt-1">
                    <span 
                      className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border border-border"
                      style={{ 
                        backgroundColor: `${GAME_CORE.ATTRIBUTES[event.metadata.attr_key as keyof typeof GAME_CORE.ATTRIBUTES]?.color}15`,
                        color: GAME_CORE.ATTRIBUTES[event.metadata.attr_key as keyof typeof GAME_CORE.ATTRIBUTES]?.color
                      }}
                    >
                      {event.metadata.attr_key}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

function getEventIcon(type: string) {
  switch (type) {
    case 'habit': return CheckCircle2
    case 'task': return Target
    case 'journal': return BookOpen
    case 'level_up': return TrendingUp
    default: return Clock
  }
}

function getEventColor(event: any) {
  if (event.type === 'habit' && event.metadata?.completed === false) return '#ef4444'
  if (event.type === 'habit') return '#10b981'
  if (event.type === 'task') return '#3b82f6'
  if (event.type === 'journal') return '#8b5cf6'
  return '#fbbf24'
}
