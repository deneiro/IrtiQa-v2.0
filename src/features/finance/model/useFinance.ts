'use client'

import { useEffect, useCallback } from 'react'
import { createClient } from '@/shared/api/supabase'
import { useFinanceStore } from '@/entities/finance'
import { useAuthStore } from '@/entities/user'
import { Database } from '@/shared/types/database.types'

type TransactionInsert = Database['public']['Tables']['finance_transactions']['Insert']
type AccountInsert = Database['public']['Tables']['finance_accounts']['Insert']

export function useFinance() {
  const supabase = createClient()
  const { user } = useAuthStore()
  const { 
    accounts, 
    categories,
    transactions, 
    isLoading, 
    setAccounts, 
    setCategories,
    setTransactions,
    addTransaction: optimisticAddTransaction,
    addAccount: optimisticAddAccount
  } = useFinanceStore()

  const fetchData = useCallback(async () => {
    if (!user) return

    // Fetch accounts
    const { data: accountsData } = await supabase
      .from('finance_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: true })

    if (accountsData) setAccounts(accountsData)

    // Fetch categories
    const { data: categoriesData } = await supabase
      .from('finance_categories')
      .select('*')
      .or(`user_id.is.null,user_id.eq.${user.id}`)
      .order('name', { ascending: true })

    if (categoriesData) setCategories(categoriesData)

    // Fetch recent transactions (last 50)
    const { data: transactionsData } = await supabase
      .from('finance_transactions')
      .select('*, finance_categories(*), finance_accounts(*)')
      .eq('user_id', user.id)
      .order('transaction_date', { ascending: false })
      .limit(50)

    if (transactionsData) setTransactions(transactionsData as any)
  }, [user, supabase, setAccounts, setCategories, setTransactions])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const createTransaction = async (data: Partial<TransactionInsert>) => {
    if (!user) return

    const transaction = {
      ...data,
      user_id: user.id,
      transaction_date: data.transaction_date || new Date().toISOString()
    } as TransactionInsert

    const { data: result, error } = await (supabase
      .from('finance_transactions') as any)
      .insert(transaction)
      .select('*, finance_categories(*), finance_accounts(*)')
      .single()

    if (result) {
      optimisticAddTransaction(result as any)
      
      // Award XP for financial diligence (Phase 7)
      try {
        await supabase.rpc('award_xp', {
          p_user_id: user.id,
          p_xp: 5,
          p_attribute_types: ['money']
        } as any)
      } catch (xpError) {
        console.error('Failed to award Finance XP:', xpError)
      }
    }

    return result
  }

  const createAccount = async (data: Partial<AccountInsert>) => {
    if (!user) return

    const account = {
      ...data,
      user_id: user.id,
      balance: data.balance || 0,
      currency: data.currency || 'USD'
    } as AccountInsert

    const { data: result, error } = await (supabase
      .from('finance_accounts') as any)
      .insert(account)
      .select()
      .single()

    if (error) {
      console.error('Error creating account:', error)
      throw error
    }

    if (result) {
      optimisticAddAccount(result)
    }

    return result
  }

  return {
    accounts,
    categories,
    transactions,
    isLoading,
    createTransaction,
    createAccount,
    refresh: fetchData
  }
}
