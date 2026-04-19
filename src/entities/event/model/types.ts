import { Tables } from '@/shared/types/database.types'

export type SocialEvent = Tables<'events'>

export interface SocialEventWithContact extends SocialEvent {
  contact_name?: string
}
