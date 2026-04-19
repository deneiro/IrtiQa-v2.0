import { Database } from '@/shared/types/database.types'

export type AchievementRarity = Database['public']['Enums']['achievement_rarity']
export type AchievementScope = Database['public']['Enums']['achievement_scope']

export interface Achievement {
  id: string
  title: string
  description: string | null
  icon: string | null
  rarity: AchievementRarity
  scope: AchievementScope
  condition_key: string
  condition_value: number
  xp_reward: number
  gold_reward: number
  created_at: string
}

export interface UserAchievement {
  id: string
  user_id: string
  achievement_id: string
  unlocked_at: string
  created_at: string
}

export interface AchievementWithStatus extends Achievement {
  isUnlocked: boolean
  unlockedAt?: string
}
