import { Tables } from '@/shared/types/database.types'

export type SharedHabit = Tables<'shared_habits'>

export interface SharedHabitWithContact extends SharedHabit {
  contact_name?: string
}
