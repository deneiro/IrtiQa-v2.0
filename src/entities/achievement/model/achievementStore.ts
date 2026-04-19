import { create } from 'zustand'
import { supabase } from '@/shared/api/supabase'
import { Achievement, UserAchievement, AchievementWithStatus, AchievementScope } from './types'

interface AchievementState {
  achievements: Achievement[]
  userAchievements: UserAchievement[]
  newlyUnlockedAchievement: Achievement | null
  error: string | null
  isLoading: boolean
  
  fetchAchievements: () => Promise<void>
  fetchUserAchievements: (userId: string) => Promise<void>
  clearNewlyUnlocked: () => void
  getAchievementsByScope: (scope: AchievementScope | 'all') => AchievementWithStatus[]
}

export const useAchievementStore = create<AchievementState>((set, get) => ({
  achievements: [],
  userAchievements: [],
  isLoading: false,
  newlyUnlockedAchievement: null,
  error: null,

  clearNewlyUnlocked: () => set({ newlyUnlockedAchievement: null }),

  fetchAchievements: async () => {
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('achievements')
        .select('*')
        .order('rarity', { ascending: true })

      if (error) throw error
      set({ achievements: data || [], error: null })
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoading: false })
    }
  },

  fetchUserAchievements: async (userId: string) => {
    if (!userId) return
    
    set({ isLoading: true })
    try {
      const { data, error } = await supabase
        .from('user_achievements')
        .select('*')
        .eq('user_id', userId)

      if (error) throw error
      set({ userAchievements: data || [], error: null })
    } catch (err: any) {
      set({ error: err.message })
    } finally {
      set({ isLoading: false })
    }
  },

  getAchievementsByScope: (scope: AchievementScope | 'all') => {
    const { achievements, userAchievements } = get()
    
    let filtered = achievements
    if (scope !== 'all') {
      filtered = achievements.filter(a => a.scope === scope)
    }

    return filtered.map(achievement => {
      const userUnlock = userAchievements.find(ua => ua.achievement_id === achievement.id)
      return {
        ...achievement,
        isUnlocked: !!userUnlock,
        unlockedAt: userUnlock?.unlocked_at
      }
    })
  }
}))
