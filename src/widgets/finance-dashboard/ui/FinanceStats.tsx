'use client'

import React from 'react'
import { Card } from '@/shared/ui/card'
import { FinanceAccount } from '@/entities/finance'

interface FinanceStatsProps {
  accounts: FinanceAccount[]
}

export function FinanceStats({ accounts }: FinanceStatsProps) {
  const totalBalance = accounts.reduce((acc, curr) => acc + Number(curr.balance), 0)
  
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <Card className="p-6 bg-gradient-to-br from-lime-500/10 to-emerald-500/10 border-lime-500/20">
        <h3 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Total Net Worth</h3>
        <p className="text-4xl font-display font-bold mt-2 text-lime-500">
          ${totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
        </p>
      </Card>
      <Card className="p-6 bg-muted/30 border-dashed border-muted flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Monthly insights coming soon</p>
      </Card>
      <Card className="p-6 bg-muted/30 border-dashed border-muted flex items-center justify-center text-muted-foreground">
        <p className="text-sm">Saving goals coming soon</p>
      </Card>
    </div>
  )
}
