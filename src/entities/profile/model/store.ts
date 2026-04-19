import { create } from 'zustand'
import { Database } from '@/shared/types/database.types'
import { GAME_CORE } from '@/shared/config/game-core'

type ProfileRow = Database['public']['Tables']['profiles']['Row']
type Rank = Database['public']['Enums']['player_rank']

interface ProfileState {
  profile: ProfileRow | null
  isLoading: boolean
  
  // Actions
  setProfile: (profile: ProfileRow) => void
  addXp: (amount: number) => void
  addGold: (amount: number) => void
  takeDamage: (amount: number) => void
  healHp: (amount: number) => void
}

export const useProfileStore = create<ProfileState>((set) => ({
  profile: null,
  isLoading: true,
  
  setProfile: (profile) => set({ profile, isLoading: false }),

  // Optimistic UI updates
  addXp: (amount) => set((state) => {
    if (!state.profile) return state
    
    let newXp = state.profile.current_xp + amount
    let newLevel = state.profile.level
    
    // Level-up loop
    while (true) {
      const xpNeeded = GAME_CORE.calculateXpForNextLevel(newLevel)
      if (newXp < xpNeeded) break
      
      newXp -= xpNeeded
      newLevel += 1
    }
    
    const newRank = GAME_CORE.getRankForLevel(newLevel)
    
    return {
      profile: {
        ...state.profile,
        current_xp: newXp,
        level: newLevel,
        rank: newRank
      }
    }
  }),
  
  addGold: (amount) => set((state) => {
    if (!state.profile) return state
    return {
      profile: {
        ...state.profile,
        gold: state.profile.gold + amount
      }
    }
  }),
  
  takeDamage: (amount) => set((state) => {
    if (!state.profile) return state
    const newHp = Math.max(0, state.profile.current_hp - amount)
    return {
      profile: {
        ...state.profile,
        current_hp: newHp
      }
    }
  }),
  
  healHp: (amount) => set((state) => {
    if (!state.profile) return state
    const newHp = Math.min(state.profile.max_hp, state.profile.current_hp + amount)
    return {
      profile: {
        ...state.profile,
        current_hp: newHp
      }
    }
  })
}))
