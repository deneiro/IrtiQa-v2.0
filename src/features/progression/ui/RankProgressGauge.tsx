'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GAME_CORE } from '@/shared/config/game-core'
import { Crown, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface RankProgressGaugeProps {
  currentLevel: number
  className?: string
}

export function RankProgressGauge({ currentLevel, className }: RankProgressGaugeProps) {
  // Find current rank and next rank
  const ranks = [...GAME_CORE.RANKS]
  const currentRankIdx = ranks.findIndex((r, idx) => {
    const next = ranks[idx+1]
    return currentLevel >= r.threshold && (!next || currentLevel < next.threshold)
  })

  const currentRank = ranks[currentRankIdx]
  const nextRank = ranks[currentRankIdx + 1]

  if (!nextRank) {
    return (
      <div className={cn("p-6 rounded-2xl bg-primary/10 border border-primary/20 text-center", className)}>
         <Crown className="w-8 h-8 text-primary mx-auto mb-2 animate-pulse" />
         <p className="text-sm font-black uppercase tracking-[0.2em] text-primary">MAX RANK ATTAINED</p>
         <p className="text-[10px] text-muted-foreground mt-1">THE LEGEND WALKS AMONG US</p>
      </div>
    )
  }

  const range = nextRank.threshold - currentRank.threshold
  const progress = ((currentLevel - currentRank.threshold) / range) * 100
  const levelsLeft = nextRank.threshold - currentLevel

  return (
    <div className={cn("space-y-6", className)}>
      <div className="flex items-center justify-between px-2">
        <div className="flex flex-col">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Current Status</span>
          <span className="text-xl font-black text-foreground italic">Rank {currentRank.rank}</span>
        </div>
        
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-muted-foreground uppercase tracking-widest">Next Evolution</span>
          <span className="text-xl font-black text-primary italic">Rank {nextRank.rank}</span>
        </div>
      </div>

      <div className="relative h-4 w-full bg-secondary/30 rounded-full border border-border p-1 overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1.5, ease: "circOut" }}
          className="h-full rounded-full bg-gradient-to-r from-primary/40 via-primary to-primary shadow-[0_0_20px_rgba(var(--primary),0.5)] relative overflow-hidden"
        >
          {/* Animated Shine */}
          <motion.div 
            animate={{ x: ['-100%', '200%'] }}
            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
            className="absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-white/20 to-transparent skew-x-12"
          />
        </motion.div>
      </div>

      <div className="flex justify-center">
        <div className="px-4 py-2 rounded-xl bg-secondary/50 border border-border flex items-center gap-3">
          <Sparkles className="w-4 h-4 text-primary animate-pulse" />
          <p className="text-xs font-bold tracking-tight text-foreground/80">
            Reach <span className="text-primary">Level {nextRank.threshold}</span> to ascend ({levelsLeft} Levels left)
          </p>
        </div>
      </div>
    </div>
  )
}
