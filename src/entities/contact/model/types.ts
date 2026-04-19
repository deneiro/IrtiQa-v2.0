import { Tables } from '@/shared/types/database.types'

export type Contact = Tables<'contacts'>

export interface SocialLinks {
  instagram?: string
  whatsapp?: string
  telegram?: string
  phone?: string
  email?: string
}

export interface PersonalityType {
  tags: string[]
  description: string
}

export interface ContactWithDebts extends Contact {
  netDebt: number
}
