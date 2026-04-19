'use client'

import React from 'react'
import { format, subDays, startOfToday, eachDayOfInterval, isSameDay } from 'date-fns'
import { cn } from '@/shared/lib/utils'
import { Database } from '@/shared/types/database.types'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/shared/ui/tooltip'
import { isHabitScheduled } from '@/entities/habit'

type HabitRow = Database['public']['Tables']['habits']['Row']
type HabitLogRow = Database['public']['Tables']['habit_logs']['Row']

interface HabitCalendarProps {
  habit: HabitRow
  logs: HabitLogRow[]
  days?: number
  accentColor?: string
}

export function HabitCalendar({ 
  habit,
  logs, 
  days = 35, // 5 weeks
  accentColor = '#3b82f6'
}: HabitCalendarProps) {
  const today = startOfToday()
  const dateRange = eachDayOfInterval({
    start: subDays(today, days - 1),
    end: today
  })

  const getStatus = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')
    const log = logs.find(l => l.date === dateStr)
    return log?.status || 'none'
  }

  return (
    <TooltipProvider>
      <div className="grid grid-cols-7 gap-1.5">
        {dateRange.map((date, i) => {
          const scheduled = isHabitScheduled(habit, date)
          const status = getStatus(date)
          const isToday = isSameDay(date, today)

          return (
            <Tooltip key={i}>
              <TooltipTrigger asChild>
                <div 
                  className={cn(
                    "w-full aspect-square rounded-sm border transition-all relative overflow-hidden",
                    !scheduled ? "bg-muted/5 border-transparent opacity-20" : "bg-muted/10 border-border/20",
                    status === 'completed' && "border-opacity-50",
                    status === 'failed' && "border-red-500/50 bg-red-500/10",
                    isToday && "ring-1 ring-white/20"
                  )}
                  style={{
                    backgroundColor: status === 'completed' ? `${accentColor}40` : undefined,
                    borderColor: status === 'completed' ? accentColor : undefined
                  }}
                >
                  {isToday && (
                    <div className="absolute top-0 right-0 w-1.5 h-1.5">
                       <div className="absolute top-0 right-0 w-full h-full bg-white opacity-20 animate-pulse" />
                    </div>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="bg-popover/90 backdrop-blur-md border-border/50 text-[10px] font-mono uppercase tracking-widest">
                <p>{format(date, 'MMM d, yyyy')}</p>
                <p className={cn(
                  "font-bold",
                  status === 'completed' ? "text-green-500" : status === 'failed' ? "text-red-500" : "text-muted-foreground"
                )}>
                  {status === 'none' ? (scheduled ? 'EMPTY' : 'NOT SCHEDULED') : status.toUpperCase()}
                </p>
              </TooltipContent>
            </Tooltip>
          )
        })}
      </div>
    </TooltipProvider>
  )
}
