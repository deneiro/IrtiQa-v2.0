'use client'

import React, { useState } from 'react'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { useFinance } from '../../model/useFinance'
import { Database } from '@/shared/types/database.types'

type AccountType = Database['public']['Enums']['finance_account_type']

interface CreateAccountModalProps {
  isOpen: boolean
  onClose: () => void
}

export function CreateAccountModal({ isOpen, onClose }: CreateAccountModalProps) {
  const { createAccount } = useFinance()
  const [name, setName] = useState('')
  const [type, setType] = useState<AccountType>('card')
  const [balance, setBalance] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name) return

    setIsLoading(true)
    try {
      await createAccount({
        name,
        type,
        balance: parseFloat(balance) || 0,
        currency: 'USD'
      })
      onClose()
      setName('')
      setBalance('')
    } catch (error) {
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Create Account">
      <form onSubmit={handleSubmit} className="space-y-4 pt-4">
        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">Account Name</label>
          <input
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Personal Card, Cash"
            className="w-full bg-muted/50 border-none rounded-xl p-4 text-lg focus:ring-2 focus:ring-primary transition-all dark:bg-zinc-800"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as AccountType)}
              className="w-full bg-muted/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all dark:bg-zinc-800"
            >
              <option value="card">💳 Card</option>
              <option value="cash">💵 Cash</option>
              <option value="bank">🏦 Bank</option>
              <option value="savings">🐷 Savings</option>
              <option value="other">📁 Other</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-muted-foreground">Initial Balance</label>
            <input
              type="number"
              step="0.01"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              placeholder="0.00"
              className="w-full bg-muted/50 border-none rounded-xl p-3 text-sm focus:ring-2 focus:ring-primary transition-all dark:bg-zinc-800"
            />
          </div>
        </div>

        <div className="pt-4">
          <Button type="submit" className="w-full py-6 text-lg" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Account'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
