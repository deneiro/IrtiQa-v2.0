"use client"

import React, { useState } from 'react'
import { Modal } from '@/shared/ui/modal'
import { Button } from '@/shared/ui/button'
import { useDebtStore, DebtDirection } from '@/entities/debt'
import { createClient } from '@/shared/api/supabase'
import { useAuthStore } from '@/entities/user'
import { DollarSign, FileText, ArrowUpRight, ArrowDownLeft } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface LogDebtModalProps {
  isOpen: boolean
  onClose: () => void
  contactId: string
  contactName: string
}

export function LogDebtModal({ isOpen, onClose, contactId, contactName }: LogDebtModalProps) {
  const { user } = useAuthStore()
  const { addDebt } = useDebtStore()
  const [loading, setLoading] = useState(false)
  const [direction, setDirection] = useState<DebtDirection>('they_owe')
  
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    currency: 'USD'
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !formData.amount) return

    setLoading(true)
    const supabase = createClient()
    
    const { data: debt, error } = await (supabase
      .from('debts') as any)
      .insert({
        user_id: user.id,
        contact_id: contactId,
        amount: parseFloat(formData.amount),
        direction,
        description: formData.description || null,
        currency: formData.currency
      })
      .select()
      .single()

    if (error) {
      console.error('Error logging debt:', error)
      setLoading(false)
      return
    }

    if (debt) {
      addDebt(debt)
      // Small XP reward for financial tracking?
      await supabase.rpc('award_xp', {
        p_user_id: user.id,
        p_xp: 5,
        p_attribute_types: ['money']
      } as any)
    }

    setLoading(false)
    onClose()
    setFormData({ amount: '', description: '', currency: 'USD' })
  }

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Log Transaction with ${contactName}`}>
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Direction Toggle */}
        <div className="flex p-1 bg-secondary rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setDirection('they_owe')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all text-sm font-medium",
              direction === 'they_owe' 
                ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                : "text-muted-foreground hover:bg-secondary-foreground/10"
            )}
          >
            <ArrowUpRight className="w-4 h-4" />
            They Owe Me
          </button>
          <button
            type="button"
            onClick={() => setDirection('i_owe')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 rounded-lg transition-all text-sm font-medium",
              direction === 'i_owe' 
                ? "bg-red-500 text-white shadow-lg shadow-red-500/20" 
                : "text-muted-foreground hover:bg-secondary-foreground/10"
            )}
          >
            <ArrowDownLeft className="w-4 h-4" />
            I Owe Them
          </button>
        </div>

        <div className="space-y-4">
          {/* Amount */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">Amount</label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="number"
                required
                step="0.01"
                min="0.01"
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-display text-lg"
                placeholder="0.00"
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
              />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-sm font-medium text-muted-foreground block mb-2">Description / Reason</label>
            <div className="relative">
              <FileText className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
              <textarea
                className="w-full bg-secondary/50 border border-border/50 rounded-xl px-10 py-3 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all min-h-[100px]"
                placeholder="Dinner, loan, share of bills..."
                value={formData.description}
                onChange={e => setFormData({ ...formData, description: e.target.value })}
              />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4 border-t border-border/50">
          <Button variant="ghost" onClick={onClose} type="button">Cancel</Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging...' : 'Log Transaction'}
          </Button>
        </div>
      </form>
    </Modal>
  )
}
