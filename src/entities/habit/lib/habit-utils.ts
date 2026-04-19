import { format } from 'date-fns'
import { Database } from '@/shared/types/database.types'

type HabitRow = Database['public']['Tables']['habits']['Row']

/**
 * Determines if a habit is scheduled for a specific date based on its frequency and configuration.
 */
export function isHabitScheduled(habit: HabitRow, date: Date): boolean {
  const dateStr = format(date, 'yyyy-MM-dd')
  const dayOfWeek = date.getDay()

  if (habit.frequency === 'daily') return true
  
  if (habit.frequency === 'weekly' || habit.frequency === 'custom') {
    return habit.schedule_days?.includes(dayOfWeek) ?? false
  }
  
  if (habit.frequency === 'occasional') {
    return habit.schedule_dates?.includes(dateStr) ?? false
  }
  
  return false
}
