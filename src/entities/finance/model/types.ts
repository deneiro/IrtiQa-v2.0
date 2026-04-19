import { Tables } from '@/shared/types/database.types'

export type FinanceAccount = Tables<'finance_accounts'>
export type FinanceCategory = Tables<'finance_categories'>
export type FinanceTransaction = Tables<'finance_transactions'>

export type FinanceAccountType = FinanceAccount['type']
export type FinanceTransactionType = FinanceTransaction['type']

export interface FinanceSummary {
  totalBalance: number
  accounts: FinanceAccount[]
  recentTransactions: FinanceTransaction[]
}
