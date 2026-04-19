import { create } from 'zustand'
import { ActivityState, ActivityEvent } from './types'
import { createClient } from '@/shared/api/supabase'

export const useActivityStore = create<ActivityState>((set) => ({
  events: [],
  isLoading: false,

  fetchHistory: async () => {
    set({ isLoading: true })
    const supabase = createClient()

    try {
      // Fetch concurrent streams
      const [habitsRes, tasksRes, journalsRes] = await Promise.all([
        supabase
          .from('habit_logs')
          .select(`
            id,
            created_at,
            completed,
            habits (
              title,
              attribute_ids
            )
          `)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('tasks')
          .select(`
            id,
            title,
            completed_at,
            quests (
              title,
              attribute_ids
            )
          `)
          .filter('status', 'eq', 'completed')
          .order('completed_at', { ascending: false })
          .limit(20),
        supabase
          .from('journals')
          .select('id, created_at, mood, stress_level')
          .order('created_at', { ascending: false })
          .limit(10)
      ])

      const habitEvents: ActivityEvent[] = (habitsRes.data || []).map((hl: any) => ({
        id: `hl-${hl.id}`,
        type: 'habit',
        title: (hl.habits as any)?.title || 'Habit Session',
        description: hl.completed ? 'Habit routine secured.' : 'Habit protocol breached.',
        timestamp: hl.created_at,
        metadata: {
          completed: hl.completed,
          attr_key: (hl.habits as any)?.attribute_ids?.[0]
        }
      }))

      const taskEvents: ActivityEvent[] = (tasksRes.data || []).map((t: any) => ({
        id: `task-${t.id}`,
        type: 'task',
        title: t.title,
        description: `Objective secured within ${(t.quests as any)?.title || 'Direct Ops'}.`,
        timestamp: t.completed_at!,
        metadata: {
          attr_key: (t.quests as any)?.attribute_ids?.[0]
        }
      }))

      const journalEvents: ActivityEvent[] = (journalsRes.data || []).map((j: any) => ({
        id: `journal-${j.id}`,
        type: 'journal',
        title: 'Mission Debrief',
        description: `Reflexion recorded with mood: ${j.mood}.`,
        timestamp: j.created_at,
        metadata: {
          mood: j.mood,
          stress_level: j.stress_level
        }
      }))

      // Combine and sort
      const allEvents = [...habitEvents, ...taskEvents, ...journalEvents]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 50)

      set({ events: allEvents, isLoading: false })
    } catch (error) {
      console.error('Error fetching activity history:', error)
      set({ isLoading: false })
    }
  }
}))
