"use client"

import React from 'react'
import { ContactList } from '@/widgets/social-hub'
import { AchievementsList } from '@/widgets/achievements-list'
import { useDebtStore, calculateTotalBalance } from '@/entities/debt'
import { useContactStore } from '@/entities/contact'
import { Users, ArrowUpRight, ArrowDownLeft, Wallet, Trophy } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export default function SocialPage() {
  const { contacts } = useContactStore()
  const { debts } = useDebtStore()
  
  const totalBalance = calculateTotalBalance(debts)
  const isPositive = totalBalance > 0
  const isNegative = totalBalance < 0
  
  const theyOweTotal = debts
    .filter(d => !d.is_settled && d.direction === 'they_owe')
    .reduce((acc, d) => acc + Number(d.amount), 0)
    
  const iOweTotal = debts
    .filter(d => !d.is_settled && d.direction === 'i_owe')
    .reduce((acc, d) => acc + Number(d.amount), 0)

  return (
    <div className="container mx-auto p-4 md:p-12 space-y-12 max-w-7xl animate-in fade-in slide-in-from-bottom-4 duration-1000">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] border border-primary/20">
            <Users className="w-3.5 h-3.5" />
            Social Engine v2.0
          </div>
          <h1 className="text-5xl md:text-7xl font-display font-black tracking-tighter leading-tight">
            Social <span className="text-muted-foreground/30">Hub</span>
          </h1>
          <p className="text-muted-foreground text-lg max-w-lg leading-relaxed">
            Architect your network and track mutual commitments with tactical precision.
          </p>
        </div>

        {/* Global Net Balance Card */}
        <div className="bg-card border-2 border-border/50 p-8 rounded-[2.5rem] min-w-[320px] relative overflow-hidden group shadow-2xl">
           <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:scale-150 group-hover:rotate-12 transition-transform duration-1000 ease-out">
             <Wallet className="w-24 h-24" />
           </div>
           <p className="text-[10px] font-black uppercase tracking-[0.3em] text-muted-foreground/60 mb-4">Cumulative Net Position</p>
           <div className="flex items-baseline gap-3">
             <span className={cn(
               "text-5xl font-display font-black tracking-tighter transition-colors duration-500",
               isPositive ? "text-green-500" : isNegative ? "text-red-500" : "text-foreground"
             )}>
               {isNegative ? '-' : '+'}{Math.abs(totalBalance).toLocaleString()}
             </span>
             <span className="text-2xl font-display font-bold text-muted-foreground">$</span>
           </div>
           <div className="mt-4 h-1.5 w-full bg-secondary rounded-full overflow-hidden">
              <div 
                className={cn(
                  "h-full transition-all duration-1000 delay-300",
                  isPositive ? "bg-green-500" : isNegative ? "bg-red-500" : "bg-primary"
                )}
                style={{ width: '40%' }} // Visual placeholder for relative ratio
              />
           </div>
        </div>
      </div>

      {/* Summary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-card/30 backdrop-blur-sm border border-border/50 p-8 rounded-[2rem] relative overflow-hidden group hover:border-primary/40 transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] group-hover:scale-110 group-hover:rotate-12 transition-transform duration-700">
             <Users className="w-16 h-16" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Network Nodes</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black tracking-tight">{contacts.length}</span>
            <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">Active</span>
          </div>
        </div>

        <div className="bg-card/30 backdrop-blur-sm border border-border/50 p-8 rounded-[2rem] relative overflow-hidden group hover:border-green-500/40 transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-green-500 group-hover:translate-x-2 transition-transform duration-700">
             <ArrowUpRight className="w-16 h-16" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Total Receivables</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-green-500 tracking-tight">
              {theyOweTotal.toLocaleString()}
            </span>
            <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">$</span>
          </div>
        </div>

        <div className="bg-card/30 backdrop-blur-sm border border-border/50 p-8 rounded-[2rem] relative overflow-hidden group hover:border-red-500/40 transition-all duration-500">
          <div className="absolute top-0 right-0 p-6 opacity-[0.03] text-red-500 group-hover:translate-x-2 transition-transform duration-700">
             <ArrowDownLeft className="w-16 h-16" />
          </div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-2">Total Payables</p>
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-display font-black text-red-500 tracking-tight">
              {iOweTotal.toLocaleString()}
            </span>
            <span className="text-xs font-black text-muted-foreground/40 uppercase tracking-widest">$</span>
          </div>
        </div>
      </div>

      {/* Main Contact Management Layer */}
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
          <h2 className="text-[10px] font-black uppercase tracking-[0.5em] text-muted-foreground/30">Network Infrastructure</h2>
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border to-transparent" />
        </div>
        <ContactList />
      </div>

      {/* Achievements Section */}
      <div className="space-y-8">
        <h2 className="text-3xl font-display font-black uppercase tracking-tight flex items-center gap-3">
          <Trophy className="w-8 h-8 text-attribute-friends" />
          Network Milestones
        </h2>
        <AchievementsList 
          scope="social" 
          gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        />
      </div>
    </div>
  )
}
