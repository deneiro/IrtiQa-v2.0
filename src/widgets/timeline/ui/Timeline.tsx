'use client'

import React, { useEffect, useMemo } from 'react'
import { Clock, CheckSquare, Target, Cake, Flag } from 'lucide-react'
import { useQuestStore } from '@/entities/quest'
import { useContactStore } from '@/entities/contact'
import { TaskCheckbox } from '@/features/task-management'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_CORE } from '@/shared/config/game-core'
import { format, isWithinInterval, addDays, startOfDay } from 'date-fns'
import { cn } from '@/shared/lib/utils'

type TimelineEvent = {
  id: string
  type: 'task' | 'quest_deadline' | 'social'
  title: string
  date: string
  color?: string
  subtext?: string
  taskData?: any
}

export function Timeline() {
  const { quests, independentTasks, fetchQuests, fetchIndependentTasks } = useQuestStore()
  const { contacts, setContacts } = useContactStore()

  useEffect(() => {
    fetchQuests()
    fetchIndependentTasks()

    // Fetch contacts for social signals (Phase 7)
    const fetchContacts = async () => {
      const { createClient } = await import('@/shared/api/supabase')
      const supabase = createClient()
      const { data } = await supabase.from('contacts').select('*')
      if (data) setContacts(data)
    }
    fetchContacts()
  }, [fetchQuests, fetchIndependentTasks, setContacts])

  const allSignals = useMemo(() => {
    const today = startOfDay(new Date())
    const lookAhead = addDays(today, 7)
    const signals: TimelineEvent[] = []

    // 1. Quests Deadlines
    quests.forEach(q => {
      if (q.status !== 'completed' && q.deadline) {
        signals.push({
          id: `quest-${q.id}`,
          type: 'quest_deadline',
          title: q.title,
          date: q.deadline,
          color: q.attribute_ids?.[0] ? GAME_CORE.ATTRIBUTES[q.attribute_ids[0]]?.color : '#f43f5e',
          subtext: 'MISSION DEADLINE'
        })
      }
    })

    // 2. Active Tasks
    const linkedTasks = quests.flatMap(q => q.tasks.map(t => ({ 
      ...t, 
      questTitle: q.title, 
      questColor: q.attribute_ids?.[0] ? GAME_CORE.ATTRIBUTES[q.attribute_ids[0]]?.color : '#64748b'
    })));
    
    [...linkedTasks, ...independentTasks]
      .filter(t => t.status !== 'completed' && t.deadline)
      .forEach(t => {
        signals.push({
          id: `task-${t.id}`,
          type: 'task',
          title: t.title,
          date: t.deadline!,
          color: (t as any).questColor,
          subtext: (t as any).questTitle || 'INDEPENDENT TASK',
          taskData: t
        })
      })

    // 3. Social Birthdays (Looking 7 days ahead)
    contacts.forEach(c => {
      if (c.birthday) {
        const bd = new Date(c.birthday)
        const currentYearBd = new Date(new Date().getFullYear(), bd.getMonth(), bd.getDate())
        
        if (isWithinInterval(currentYearBd, { start: today, end: lookAhead })) {
          signals.push({
            id: `social-${c.id}`,
            type: 'social',
            title: `${c.name}'s Birthday`,
            date: currentYearBd.toISOString(),
            color: '#ec4899', // Pink for social
            subtext: 'SOCIAL SIGNAL'
          })
        }
      }
    })
    
    // Sort and limit
    return signals
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 6)
  }, [quests, independentTasks, contacts])

  if (allSignals.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-8 text-muted-foreground opacity-40">
        <Clock className="w-8 h-8 mb-2" />
        <span className="text-xs uppercase tracking-[0.2em] font-mono">No Active Signals</span>
      </div>
    )
  }

  return (
    <div className="space-y-6 relative before:absolute before:inset-0 before:ml-[11px] before:w-[1px] before:bg-gradient-to-b before:from-primary/50 before:via-border/30 before:to-transparent">
      <AnimatePresence mode="popLayout">
        {allSignals.map((signal, idx) => (
          <motion.div 
            key={signal.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ delay: idx * 0.05 }}
            className="relative pl-8 group"
          >
            {/* Timeline Dot */}
            <div 
              className="absolute left-0 top-1.5 w-[23px] h-[23px] -ml-[0.5px] rounded-full border border-border bg-card flex items-center justify-center z-10 transition-transform group-hover:scale-110"
              style={{ borderColor: signal.color ? `${signal.color}40` : undefined }}
            >
              {signal.type === 'quest_deadline' && <Flag className="w-2.5 h-2.5" style={{ color: signal.color }} />}
              {signal.type === 'task' && <Target className="w-2.5 h-2.5" style={{ color: signal.color }} />}
              {signal.type === 'social' && <Cake className="w-2.5 h-2.5" style={{ color: signal.color }} />}
            </div>

            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between gap-2">
                <span className={cn(
                  "text-sm font-medium transition-colors line-clamp-1",
                  signal.type === 'quest_deadline' ? "text-primary" : "text-foreground group-hover:text-primary"
                )}>
                  {signal.title}
                </span>
                <span className="text-[9px] font-mono text-muted-foreground uppercase whitespace-nowrap">
                  {format(new Date(signal.date), 'MMM dd')}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                   <span className="text-[9px] font-mono text-muted-foreground/50 uppercase tracking-widest line-clamp-1 max-w-[150px]">
                      {signal.subtext}
                   </span>
                </div>
                {signal.type === 'task' && (
                  <div className="scale-75 origin-right">
                    <TaskCheckbox task={signal.taskData} />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
