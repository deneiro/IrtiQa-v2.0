import { Tables } from '@/shared/types/database.types'

export type Debt = Tables<'debts'>

export type DebtDirection = 'i_owe' | 'they_owe'
