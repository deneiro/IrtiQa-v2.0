'use client'

import React, { useMemo } from 'react'
import { useHabits } from '@/features/habits/model/useHabits'
import { HabitCard } from '@/entities/habit/ui/HabitCard'
import { isHabitScheduled } from '@/entities/habit'
import { motion, AnimatePresence } from 'framer-motion'
import { format } from 'date-fns'

export function HabitsList() {
  const { habits, isLoading, checkIn, getLogForDate, getLogsForHabit } = useHabits()
  const today = new Date()
  const todayStr = format(today, 'yyyy-MM-dd')

  const sortedHabits = useMemo(() => {
    return [...habits].sort((a, b) => {
      const aScheduled = isHabitScheduled(a, today)
      const bScheduled = isHabitScheduled(b, today)
      
      if (aScheduled && !bScheduled) return -1
      if (!aScheduled && bScheduled) return 1
      
      // If both are same scheduled state, keep original order (created_at desc)
      return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    })
  }, [habits, today])

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 rounded-xl bg-secondary animate-pulse" />
        ))}
      </div>
    )
  }

  if (habits.length === 0) {
    return (
      <div className="text-center py-12 border-2 border-dashed border-border rounded-2xl">
        <p className="text-muted-foreground">No active habits. Create one to start leveling up!</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <AnimatePresence mode="popLayout">
        {sortedHabits.map((habit) => {
          const todaysLog = getLogForDate(habit.id, todayStr)
          const isScheduledToday = isHabitScheduled(habit, today)
          
          return (
            <motion.div
              key={habit.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
            >
              <HabitCard
                habit={habit}
                logs={getLogsForHabit(habit.id)}
                isScheduledToday={isScheduledToday}
                currentStatus={todaysLog?.status || 'empty'}
                onUpdateStatus={checkIn}
              />
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
