"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { AchievementWithStatus } from '../model/types'
import { cn } from '@/shared/lib/utils'
import { Trophy, Lock, Star } from 'lucide-react'
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shared/ui/tooltip"
import { Badge } from "@/shared/ui/badge"

interface AchievementCardProps {
  achievement: AchievementWithStatus
  className?: string
}

const RARITY_STYLES: Record<string, { color: string, shadow: string, border: string }> = {
  common: {
    color: 'text-slate-400',
    shadow: 'shadow-[0_0_10px_rgba(148,163,184,0.2)]',
    border: 'border-slate-500/30'
  },
  uncommon: {
    color: 'text-green-400',
    shadow: 'shadow-[0_0_10px_rgba(34,197,94,0.2)]',
    border: 'border-green-500/30'
  },
  rare: {
    color: 'text-blue-400',
    shadow: 'shadow-[0_0_10px_rgba(59,130,246,0.2)]',
    border: 'border-blue-500/30'
  },
  epic: {
    color: 'text-purple-400',
    shadow: 'shadow-[0_0_10px_rgba(168,85,247,0.2)]',
    border: 'border-purple-500/30'
  },
  legendary: {
    color: 'text-amber-400',
    shadow: 'shadow-[0_0_15px_rgba(245,158,11,0.3)]',
    border: 'border-amber-500/40'
  },
  divine: {
    color: 'text-cyan-400',
    shadow: 'shadow-[0_0_20px_rgba(6,182,212,0.4)]',
    border: 'border-cyan-500/50'
  }
}

import { useStatsStore } from '@/entities/profile/model/statsStore'
import { Progress } from '@/shared/ui/progress'

export function AchievementCard({ achievement, className }: AchievementCardProps) {
  const { title, description, rarity, isUnlocked, icon, xp_reward, gold_reward, condition_key, condition_value } = achievement
  const style = RARITY_STYLES[rarity] || RARITY_STYLES.common
  
  const { stats } = useStatsStore()
  
  // Calculate progress
  const currentValue = stats ? (stats as any)[condition_key] || 0 : 0
  const progressPercent = Math.min(100, (currentValue / condition_value) * 100)
  const isNearCompletion = !isUnlocked && progressPercent >= 80

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <motion.div
            whileHover={{ scale: 1.02, y: -2 }}
            className={cn(
              "relative group p-4 rounded-2xl border bg-black/40 backdrop-blur-md transition-all duration-500 overflow-hidden",
              style.border,
              isUnlocked ? style.shadow : "opacity-60 border-white/5",
              isNearCompletion && "border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.15)]",
              className
            )}
          >
            {/* Dynamic Background Glow */}
            {isUnlocked && (
              <div className={cn(
                "absolute -inset-1 rounded-2xl opacity-0 group-hover:opacity-20 transition-opacity duration-700 blur-2xl",
                style.color.replace('text', 'bg')
              )} />
            )}

            <div className="relative z-10 flex flex-col gap-3">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-12 w-12 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                  isUnlocked ? style.color : "text-muted-foreground grayscale"
                )}>
                  {icon ? (
                    <span className="text-2xl">{icon}</span>
                  ) : (
                    <Trophy className="w-6 h-6" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1.5 mb-2">
                    <h4 className={cn(
                      "font-black text-[11px] uppercase tracking-wider truncate",
                      isUnlocked ? "text-white" : "text-muted-foreground/60"
                    )}>
                      {title}
                    </h4>
                    {isUnlocked ? (
                      <div className={cn("w-1.5 h-1.5 rounded-full animate-pulse", style.color.replace('text', 'bg'))} />
                    ) : (
                      <Lock className="w-2.5 h-2.5 text-muted-foreground/30 flex-shrink-0" />
                    )}
                  </div>
                  
                  <div className="flex items-center">
                    <span className={cn(
                      "text-[7px] uppercase font-black tracking-[0.25em] px-2 py-0.5 rounded-md border transition-all duration-500",
                      isUnlocked 
                        ? cn("bg-white/10 border-current shadow-[0_0_10px_rgba(255,255,255,0.1)]", style.color) 
                        : "bg-black/20 border-white/5 text-muted-foreground/40 opacity-50"
                    )}>
                      {rarity}
                    </span>
                  </div>
                </div>
              </div>

              {/* Progress Section (Only for Locked) */}
              {!isUnlocked && (
                <div className="space-y-2 mt-4">
                  <div className="flex justify-between text-[8px] font-black tracking-widest uppercase opacity-40">
                    <span>Progress</span>
                    <span>{currentValue} / {condition_value}</span>
                  </div>
                  <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${progressPercent}%` }}
                      className="h-full bg-white/20 rounded-full"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Unlocked Aura Effect */}
            {isUnlocked && (
              <div className={cn(
                "absolute -right-4 -bottom-4 w-24 h-24 blur-3xl opacity-20 -z-10 transition-opacity duration-1000",
                style.color.replace('text', 'bg')
              )} />
            )}
          </motion.div>
        </TooltipTrigger>
        <TooltipContent className="bg-popover/90 backdrop-blur-md border-secondary p-3 max-w-[200px]">
          <div className="space-y-1.5">
            <p className="font-bold text-xs">{title}</p>
            <p className="text-[10px] text-muted-foreground leading-relaxed">
              {description || "A mysterious milestone yet to be reached."}
            </p>
            <div className="flex items-center justify-between pt-1 border-t border-white/5 mt-1.5">
              <div className="flex items-center gap-2 text-[10px] font-bold">
                <span className="text-attribute-brightness">{xp_reward} XP</span>
                <span className="text-attribute-money">{gold_reward} Gold</span>
              </div>
              <Badge variant="outline" className={cn("text-[8px] h-4", style.color, style.border)}>
                {rarity}
              </Badge>
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}
