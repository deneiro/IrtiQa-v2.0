'use client'

import React, { useState } from 'react'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { useFinance } from '../../model/useFinance'
import { Database } from '@/shared/types/database.types'
import { XPGainVFX } from '@/features/progression/ui/XPGainVFX'
import useSound from 'use-sound'

type TransactionType = Database['public']['Enums']['finance_transaction_type']

interface AddTransactionModalProps {
  isOpen: boolean
  onClose: () => void
}

export function AddTransactionModal({ isOpen, onClose }: AddTransactionModalProps) {
  const { accounts, categories, createTransaction } = useFinance()
  const [amount, setAmount] = useState('')
  const [type, setType] = useState<TransactionType>('expense')
  const [accountId, setAccountId] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [reward, setReward] = useState<{ xp: number; gold: number } | null>(null)
  const [playSuccess] = useSound('/sounds/pop.mp3', { volume: 0.5 })

  // Auto-select first account if not selected
  React.useEffect(() => {
    if (accounts.length > 0 && !accountId) {
      setAccountId(accounts[0].id)
    }
  }, [accounts, accountId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!amount || !accountId) return

    setIsLoading(true)
    try {
      await createTransaction({
        amount: parseFloat(amount),
        type,
        account_id: accountId,
        category_id: categoryId || null,
        description
      })
      
      // Phase 7: Trigger RPG feedback
      playSuccess()
      setReward({ xp: 5, gold: 0 })
      
      // Delay closing to show VFX
      setTimeout(() => {
        onClose()
        setReward(null)
        setAmount('')
        setDescription('')
      }, 1200)

    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const filteredCategories = categories.filter(c => c.type === type)

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Add Transaction">
      {reward && <XPGainVFX rewards={reward} onComplete={() => {}} />}
      
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="flex gap-2 p-1 bg-muted rounded-lg">
          <button
            type="button"
            onClick={() => setType('expense')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              type === 'expense' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Expense
          </button>
          <button
            type="button"
            onClick={() => setType('income')}
            className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
              type === 'income' 
                ? 'bg-background text-foreground shadow-sm' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Income
          </button>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Amount</label>
          <input
            type="number"
            step="0.01"
            required
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="w-full bg-muted/50 border-none rounded-xl p-4 text-2xl font-bold focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Account</label>
            <select
              value={accountId}
              onChange={(e) => setAccountId(e.target.value)}
              required
              className="w-full bg-muted/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all dark:bg-zinc-800"
            >
              {accounts.map(acc => (
                <option key={acc.id} value={acc.id}>
                  {acc.name} ({acc.balance} {acc.currency})
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Category</label>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full bg-muted/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all dark:bg-zinc-800"
            >
              <option value="">No category</option>
              {filteredCategories.map(cat => (
                <option key={cat.id} value={cat.id}>
                  {cat.icon} {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Description (Optional)</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What was this for?"
            className="w-full bg-muted/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all"
          />
        </div>

        <div className="pt-4">
          <Button 
            type="submit" 
            className="w-full py-6 text-lg" 
            disabled={isLoading || accounts.length === 0}
          >
            {isLoading ? 'Processing...' : 'Save Transaction'}
          </Button>
          {accounts.length === 0 && (
            <p className="text-xs text-destructive text-center mt-2">
              Create an account first to start tracking.
            </p>
          )}
        </div>
      </form>
    </Modal>
  )
}
