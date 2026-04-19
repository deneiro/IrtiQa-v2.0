import { create } from 'zustand'
import { SharedHabit } from './types'

interface SharedHabitState {
  sharedHabits: SharedHabit[]
  isLoading: boolean
  
  // Actions
  setSharedHabits: (habits: SharedHabit[]) => void
  addSharedHabit: (habit: SharedHabit) => void
  updateSharedHabit: (habit: SharedHabit) => void
  deleteSharedHabit: (habitId: string) => void
}

export const useSharedHabitStore = create<SharedHabitState>((set) => ({
  sharedHabits: [],
  isLoading: true,
  
  setSharedHabits: (habits) => set({ sharedHabits: habits, isLoading: false }),
  
  addSharedHabit: (habit) => set((state) => ({
    sharedHabits: [habit, ...state.sharedHabits]
  })),
  
  updateSharedHabit: (updatedHabit) => set((state) => ({
    sharedHabits: state.sharedHabits.map(h => h.id === updatedHabit.id ? updatedHabit : h)
  })),
  
  deleteSharedHabit: (habitId) => set((state) => ({
    sharedHabits: state.sharedHabits.filter(h => h.id !== habitId)
  }))
}))
