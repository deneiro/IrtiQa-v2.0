'use client'

import React from 'react'
import { FinanceDashboard } from '@/widgets/finance-dashboard'
import { AchievementsList } from '@/widgets/achievements-list'
import { TrendingUp, Trophy } from 'lucide-react'

export function FinancesView() {
  return (
    <div className="min-h-screen bg-background pb-20 animate-in fade-in duration-700">
      <header className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="mb-12">
            <div className="flex items-center gap-2 text-lime-500 mb-2 uppercase tracking-[0.2em] font-display font-bold text-sm">
              <TrendingUp className="w-4 h-4" />
              Wealth & Prosperity
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground uppercase italic underline decoration-lime-500 decoration-4 underline-offset-8">
              Finances <span className="text-muted-foreground/20">/</span> Ledger
            </h1>
          </div>

          <FinanceDashboard />
          
          <div className="mt-20">
            <h2 className="text-xl font-display font-black uppercase tracking-widest text-lime-500 mb-8 flex items-center gap-3">
              <Trophy className="w-6 h-6" />
              Financial Milestones
            </h2>
            <AchievementsList 
              scope="economy" 
              gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3 md:max-w-none"
            />
          </div>

          <div className="mt-20 p-8 rounded-3xl border-2 border-dashed border-white/5 bg-white/[0.02] text-center">
            <h3 className="text-lg font-display font-bold uppercase text-muted-foreground/40">
              Wealth consists not in having great possessions, but in having few wants.
            </h3>
          </div>
        </div>
      </header>
    </div>
  )
}
