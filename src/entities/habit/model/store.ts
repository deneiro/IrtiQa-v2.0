import { create } from 'zustand'
import { Database } from '@/shared/types/database.types'

type HabitRow = Database['public']['Tables']['habits']['Row']
type HabitLogRow = Database['public']['Tables']['habit_logs']['Row']
type HabitLogStatus = Database['public']['Enums']['habit_log_status']

interface HabitState {
  habits: HabitRow[]
  habitLogs: HabitLogRow[]
  isLoading: boolean
  
  // Actions
  setHabits: (habits: HabitRow[]) => void
  setHabitLogs: (logs: HabitLogRow[]) => void
  addHabit: (habit: HabitRow) => void
  updateHabitLog: (habitId: string, date: string, status: HabitLogStatus) => void
}

export const useHabitStore = create<HabitState>((set) => ({
  habits: [],
  habitLogs: [],
  isLoading: true,
  
  setHabits: (habits) => set({ habits, isLoading: false }),
  setHabitLogs: (habitLogs) => set({ habitLogs }),
  
  addHabit: (habit) => set((state) => ({
    habits: [habit, ...state.habits]
  })),

  // Optimistic UI updates
  updateHabitLog: (habitId, date, status) => set((state) => {
    const habit = state.habits.find(h => h.id === habitId);
    if (!habit) return state;

    const existingLogIndex = state.habitLogs.findIndex(l => l.habit_id === habitId && l.date === date);
    let newLogs = [...state.habitLogs];
    
    const newLog: HabitLogRow = {
      id: existingLogIndex >= 0 ? state.habitLogs[existingLogIndex].id : 'temp-' + Math.random(),
      habit_id: habitId,
      date: date,
      status: status,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      user_id: habit.user_id,
      completed: status === 'completed', // Legacy field support
      logged_at: date // Legacy field support
    };

    if (existingLogIndex >= 0) {
      newLogs[existingLogIndex] = newLog;
    } else {
      newLogs.push(newLog);
    }

    // Update habit streaks optimistically
    const newHabits = state.habits.map(h => {
      if (h.id === habitId) {
        let newStreak = h.current_streak;
        if (status === 'completed') {
          newStreak += 1;
        } else if (status === 'failed') {
          newStreak = 0;
        } else if (status === 'empty') {
          // If we reset back to empty (e.g. undo if allowed), we'd need more complex logic.
          // For now, keep as is or decrement if coming from completed.
        }
        return {
          ...h,
          current_streak: newStreak,
          best_streak: Math.max(h.best_streak, newStreak)
        };
      }
      return h;
    });

    return {
      habitLogs: newLogs,
      habits: newHabits
    };
  })
}))
