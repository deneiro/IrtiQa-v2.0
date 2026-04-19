'use client'

import React, { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { Card } from '@/shared/ui/card'
import { Plus, Wallet, History, TrendingUp, TrendingDown } from 'lucide-react'
import { useFinance, AddTransactionModal, CreateAccountModal } from '@/features/finance'
import { FinanceStats } from './FinanceStats'
import { format } from 'date-fns'

export function FinanceDashboard() {
  const { accounts, transactions, isLoading } = useFinance()
  const [isAddTxOpen, setIsAddTxOpen] = useState(false)
  const [isCreateAccountOpen, setIsCreateAccountOpen] = useState(false)

  if (isLoading) {
    return <div className="space-y-6">
      <div className="h-32 bg-muted/50 rounded-2xl animate-pulse" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="h-64 bg-muted/50 rounded-2xl animate-pulse" />
        <div className="md:col-span-2 h-64 bg-muted/50 rounded-2xl animate-pulse" />
      </div>
    </div>
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-4xl font-display font-bold tracking-tight">Finances</h1>
          <p className="text-muted-foreground mt-1">Real-world assets and transaction management</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" className="rounded-xl border-muted hover:bg-muted" onClick={() => setIsCreateAccountOpen(true)}>
            <Wallet className="w-4 h-4 mr-2" />
            New Account
          </Button>
          <Button className="rounded-xl bg-lime-500 hover:bg-lime-600 text-black font-bold shadow-lg shadow-lime-500/20" onClick={() => setIsAddTxOpen(true)}>
            <Plus className="w-5 h-5 mr-1" />
            Log Entry
          </Button>
        </div>
      </div>

      <FinanceStats accounts={accounts} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left: Accounts */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">My Virtual Vaults</h3>
          </div>
          <div className="space-y-3">
            {accounts.map(acc => (
              <Card key={acc.id} className="p-5 border-muted bg-zinc-900/40 backdrop-blur-sm hover:border-lime-500/40 transition-all group overflow-hidden relative">
                <div className="absolute inset-0 bg-gradient-to-r from-lime-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="flex justify-between items-center relative z-10">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-zinc-800 flex items-center justify-center text-2xl shadow-inner border border-white/5">
                      {acc.type === 'card' && '💳'}
                      {acc.type === 'cash' && '💵'}
                      {acc.type === 'bank' && '🏦'}
                      {acc.type === 'savings' && '🐷'}
                      {acc.type === 'other' && '📁'}
                    </div>
                    <div>
                      <p className="font-bold tracking-tight">{acc.name}</p>
                      <p className="text-xs font-medium text-muted-foreground capitalize">{acc.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-display font-bold leading-none">
                      ${Number(acc.balance).toLocaleString(undefined, { minimumFractionDigits: 0 })}
                    </p>
                    <p className="text-[10px] uppercase tracking-tighter text-muted-foreground mt-1">{acc.currency}</p>
                  </div>
                </div>
              </Card>
            ))}
            {accounts.length === 0 && (
              <div 
                onClick={() => setIsCreateAccountOpen(true)}
                className="p-12 border-2 border-dashed border-muted rounded-2xl flex flex-col items-center justify-center text-muted-foreground hover:border-lime-500/50 hover:text-lime-500 cursor-pointer transition-all"
              >
                <Wallet className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-sm font-medium">Initialize your first vault</p>
              </div>
            )}
          </div>
        </div>

        {/* Right: Recent Transactions */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Recent Log Records</h3>
            <History className="w-4 h-4 text-muted-foreground" />
          </div>
          <Card className="bg-zinc-900/40 backdrop-blur-sm border-muted overflow-hidden">
            <div className="divide-y divide-white/5">
              {transactions.map(tx => (
                <div key={tx.id} className="p-4 flex items-center justify-between hover:bg-white/5 transition-colors group">
                  <div className="flex items-center gap-4">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-lg ${
                      tx.type === 'income' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'
                    }`}>
                      {(tx as any).finance_categories?.icon || (tx.type === 'income' ? <TrendingUp className="w-5 h-5" /> : <TrendingDown className="w-5 h-5" />)}
                    </div>
                    <div>
                      <p className="font-bold text-sm tracking-tight">{tx.description || (tx as any).finance_categories?.name || 'Unlabeled Transaction'}</p>
                      <p className="text-[10px] text-muted-foreground flex items-center gap-1">
                        <span className="font-semibold text-muted-foreground/80 uppercase">{(tx as any).finance_accounts?.name}</span>
                        <span>•</span>
                        <span>{format(new Date(tx.transaction_date), 'MMM d, HH:mm')}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={`font-display font-bold text-lg ${
                      tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}>
                      {tx.type === 'income' ? '+' : '-'}${Number(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </p>
                    {(tx as any).finance_categories && (
                       <p className="text-[9px] uppercase font-bold tracking-widest text-muted-foreground/60">{(tx as any).finance_categories.name}</p>
                    )}
                  </div>
                </div>
              ))}
              {transactions.length === 0 && (
                <div className="p-20 text-center">
                  <p className="text-muted-foreground text-sm font-medium opacity-60">No ledger entries detected.</p>
                  <p className="text-xs text-muted-foreground/30 mt-2 italic">Building wealth requires tracking every gold coin.</p>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>

      <AddTransactionModal isOpen={isAddTxOpen} onClose={() => setIsAddTxOpen(false)} />
      <CreateAccountModal isOpen={isCreateAccountOpen} onClose={() => setIsCreateAccountOpen(false)} />
    </div>
  )
}
