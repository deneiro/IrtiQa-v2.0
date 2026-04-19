'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/shared/api/supabase'
import { useHabitStore } from '@/entities/habit'
import { useAuthStore } from '@/entities/user'
import { subDays, format } from 'date-fns'
import { Database } from '@/shared/types/database.types'

type HabitInsert = Database['public']['Tables']['habits']['Insert']
type HabitLogStatus = Database['public']['Enums']['habit_log_status']
type AttributeType = Database['public']['Enums']['attribute_type']

export function useHabits() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const { 
    habits, 
    habitLogs, 
    isLoading, 
    setHabits, 
    setHabitLogs, 
    addHabit,
    updateHabitLog: optimisticUpdate 
  } = useHabitStore()

  const fetchHabits = useCallback(async () => {
    if (!user) return

    const { data: habitsData } = await supabase
      .from('habits')
      .select('*')
      .eq('user_id', user.id)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (habitsData) setHabits(habitsData)

    // Fetch last 60 days for a better history view
    const startDate = format(subDays(new Date(), 60), 'yyyy-MM-dd')
    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('date', startDate)

    if (logsData) setHabitLogs(logsData)
  }, [user, supabase, setHabits, setHabitLogs])

  useEffect(() => {
    if (user) {
      fetchHabits()
    }
  }, [fetchHabits, user])

  const checkIn = async (habitId: string, status: HabitLogStatus = 'completed', date: string = format(new Date(), 'yyyy-MM-dd')) => {
    if (!user) return

    // 1. Optimistic Update
    optimisticUpdate(habitId, date, status)

    // 2. Real Update using upsert
    const { error } = await (supabase
      .from('habit_logs') as any)
      .upsert({
        habit_id: habitId,
        user_id: user.id,
        date: date,
        status: status,
        updated_at: new Date().toISOString()
      }, { onConflict: 'habit_id, date' })

    await supabase.rpc('award_xp', {
      p_user_id: user.id,
      p_xp: 5,
      p_attribute_types: ['money']
    } as any)

    if (error) {
      console.error('Error updating habit status:', error)
      await fetchHabits()
    }
  }

  const createHabit = async (habitData: Partial<HabitInsert>) => {
    if (!user) return

    const newHabit = {
      ...habitData,
      user_id: user.id,
      title: habitData.title || 'New Habit',
      type: habitData.type || 'good',
      frequency: habitData.frequency || 'daily',
      xp_reward: habitData.xp_reward || 10,
      attribute_ids: (habitData.attribute_ids as AttributeType[]) || []
    } as HabitInsert

    const { data, error } = await (supabase
      .from('habits') as any)
      .insert(newHabit)
      .select()
      .single()

    if (error) {
      console.error('Error creating habit:', error)
      throw error
    }

    if (data) {
      addHabit(data)
    }
    
    return data
  }

  const isCompletedToday = (habitId: string) => {
    const today = format(new Date(), 'yyyy-MM-dd')
    return habitLogs.some(log => log.habit_id === habitId && log.date === today && log.status === 'completed')
  }

  const getLogForDate = (habitId: string, date: string) => {
    return habitLogs.find(log => log.habit_id === habitId && log.date === date)
  }

  const getLogsForHabit = (habitId: string) => {
    return habitLogs.filter(log => log.habit_id === habitId)
  }

  return {
    habits,
    habitLogs,
    isLoading,
    checkIn,
    isCompletedToday,
    createHabit,
    getLogForDate,
    getLogsForHabit,
    refresh: fetchHabits
  }
}
