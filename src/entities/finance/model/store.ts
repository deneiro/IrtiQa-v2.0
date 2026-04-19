import { create } from 'zustand'
import { Database } from '@/shared/types/database.types'

type Account = Database['public']['Tables']['finance_accounts']['Row']
type Category = Database['public']['Tables']['finance_categories']['Row']
type Transaction = Database['public']['Tables']['finance_transactions']['Row']

interface FinanceState {
  accounts: Account[]
  categories: Category[]
  transactions: Transaction[]
  isLoading: boolean
  
  // Actions
  setAccounts: (accounts: Account[]) => void
  setCategories: (categories: Category[]) => void
  setTransactions: (transactions: Transaction[]) => void
  addTransaction: (transaction: Transaction) => void
  addAccount: (account: Account) => void
  setLoading: (isLoading: boolean) => void
}

export const useFinanceStore = create<FinanceState>((set) => ({
  accounts: [],
  categories: [],
  transactions: [],
  isLoading: true,
  
  setAccounts: (accounts) => set({ accounts, isLoading: false }),
  setCategories: (categories) => set({ categories }),
  setTransactions: (transactions) => set({ transactions }),
  setLoading: (isLoading) => set({ isLoading }),
  
  addTransaction: (transaction) => set((state) => {
    // Optimistically update account balance
    const updatedAccounts = state.accounts.map(acc => {
      const amount = Number(transaction.amount)
      
      if (acc.id === transaction.account_id) {
        if (transaction.type === 'income') return { ...acc, balance: Number(acc.balance) + amount }
        if (transaction.type === 'expense') return { ...acc, balance: Number(acc.balance) - amount }
        if (transaction.type === 'transfer') return { ...acc, balance: Number(acc.balance) - amount }
      }
      
      if (transaction.type === 'transfer' && acc.id === transaction.to_account_id) {
        return { ...acc, balance: Number(acc.balance) + amount }
      }
      
      return acc
    });

    return {
      transactions: [transaction, ...state.transactions],
      accounts: updatedAccounts
    }
  }),
  
  addAccount: (account) => set((state) => ({
    accounts: [account, ...state.accounts]
  }))
}))
