import { Database } from '@/shared/types/database.types'

export type MoodType = Database['public']['Enums']['mood_type']

export interface ProductivityStats {
  habits_done: number
  tasks_done: number
  xp_earned: number
}

export type JournalEntry = Database['public']['Tables']['journals']['Row']
export type JournalInsert = Database['public']['Tables']['journals']['Insert']
export type JournalUpdate = Database['public']['Tables']['journals']['Update']

export interface JournalFormData {
  mood: MoodType | null
  stress_level: number
  answers: string[]
}
