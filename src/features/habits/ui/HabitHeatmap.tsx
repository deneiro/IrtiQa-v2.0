'use client'

import React from 'react'
import { cn } from '@/shared/lib/utils'
import { Database } from '@/shared/types/database.types'
import { format, subDays, isSameDay } from 'date-fns'

type HabitLogRow = Database['public']['Tables']['habit_logs']['Row']

interface HabitHeatmapProps {
  logs: HabitLogRow[]
  days?: number
  accentColor?: string
}

export function HabitHeatmap({ logs, days = 14, accentColor = '#ef4444' }: HabitHeatmapProps) {
  const today = new Date()
  const dateRange = [...Array(days)].map((_, i) => subDays(today, days - 1 - i))

  return (
    <div className="flex gap-1 items-end h-8">
      {dateRange.map((date) => {
        const dateStr = format(date, 'yyyy-MM-dd')
        const isCompleted = logs.some(log => log.logged_at === dateStr && log.completed)
        
        return (
          <div 
            key={dateStr}
            className={cn(
              "w-2 rounded-full transition-all duration-300",
              isCompleted ? "h-6 shadow-sm" : "h-2 bg-white/5"
            )}
            style={{ 
              backgroundColor: isCompleted ? accentColor : undefined,
              boxShadow: isCompleted ? `0 0 8px ${accentColor}44` : undefined
            }}
            title={format(date, 'MMM do')}
          />
        )
      })}
    </div>
  )
}
