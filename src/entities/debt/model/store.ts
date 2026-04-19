import { create } from 'zustand'
import { Debt } from './types'

interface DebtState {
  debts: Debt[]
  isLoading: boolean
  
  // Actions
  setDebts: (debts: Debt[]) => void
  addDebt: (debt: Debt) => void
  settleDebt: (debtId: string) => void
}

export const useDebtStore = create<DebtState>((set) => ({
  debts: [],
  isLoading: true,
  
  setDebts: (debts) => set({ debts, isLoading: false }),
  
  addDebt: (debt) => set((state) => ({
    debts: [debt, ...state.debts]
  })),

  settleDebt: (debtId) => set((state) => ({
    debts: state.debts.map(d => d.id === debtId ? { ...d, is_settled: true, settled_at: new Date().toISOString() } : d)
  }))
}))
