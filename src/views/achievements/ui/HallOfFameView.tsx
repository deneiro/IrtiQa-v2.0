"use client"

import React, { useState, useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, Star, Shield, Target, Users, Coins, Sparkles, Lock, Filter } from 'lucide-react'
import { useAchievementStore, AchievementCard } from '@/entities/achievement'
import { useProfileStore } from '@/entities/profile'
import { cn } from '@/shared/lib/utils'
import { Badge } from '@/shared/ui/badge'

const SCOPE_CONFIG = {
  all: { label: 'All Feats', icon: Trophy, color: 'text-white', iconColor: 'text-white' },
  global: { label: 'Global', icon: Star, iconColor: 'text-amber-400' },
  quests: { label: 'Quests', icon: Target, iconColor: 'text-blue-400' },
  habits: { label: 'Habits', icon: Shield, iconColor: 'text-green-400' },
  social: { label: 'Social', icon: Users, iconColor: 'text-pink-400' },
  economy: { label: 'Economy', icon: Coins, iconColor: 'text-yellow-400' },
  journal: { label: 'Spirit', icon: Sparkles, iconColor: 'text-purple-400' },
}

interface HallOfFameViewProps {
  hideHeader?: boolean
}

export function HallOfFameView({ hideHeader = false }: HallOfFameViewProps) {
  const { achievements, userAchievements, fetchAchievements, isLoading, getAchievementsByScope } = useAchievementStore()
  const { profile } = useProfileStore()
  const [activeTab, setActiveTab] = useState<keyof typeof SCOPE_CONFIG>('all')

  useEffect(() => {
    fetchAchievements()
    if (profile?.user_id) {
      useAchievementStore.getState().fetchUserAchievements(profile.user_id)
    }
  }, [fetchAchievements, profile?.user_id])

  // Get processed achievements for stats and display
  const allProcessed = useMemo(() => getAchievementsByScope('all'), [achievements, userAchievements, getAchievementsByScope])
  const filteredAchievements = useMemo(() => getAchievementsByScope(activeTab), [activeTab, achievements, userAchievements, getAchievementsByScope])

  const stats = useMemo(() => {
    const total = allProcessed.length
    const unlocked = allProcessed.filter(a => a.isUnlocked).length
    const percentage = total > 0 ? Math.round((unlocked / total) * 100) : 0
    
    return { total, unlocked, percentage }
  }, [allProcessed])

  const legendaryFeats = useMemo(() => {
    return allProcessed.filter(a => (a.rarity === 'legendary' || a.rarity === 'divine') && a.isUnlocked)
  }, [allProcessed])

  return (
    <div className="min-h-screen bg-background pb-20">
      {!hideHeader && (
        <section className="relative overflow-hidden bg-secondary/20 border-b border-border py-12 md:py-20 mb-10">
          <div className="container mx-auto px-4 relative z-10">
            <div className="flex flex-col md:flex-row gap-8 items-center">
              <div className="flex-1 text-center md:text-left">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-500 text-[10px] font-black uppercase tracking-widest mb-4"
                >
                  <Trophy className="w-3 h-3" /> Hall of Fame
                </motion.div>
                
                <h1 className="text-5xl md:text-7xl font-display font-black mb-6 tracking-tight">
                  Your <span className="text-amber-500">Legacy</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-xl leading-relaxed">
                  Behold the summary of your evolution. Every achievement here represents a barrier broken and a new standard of excellence established.
                </p>
              </div>

              {/* Stats Circle */}
              <div className="relative w-48 h-48 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="96"
                    cy="96"
                    r="88"
                    className="stroke-border fill-none"
                    strokeWidth="8"
                  />
                  <motion.circle
                    cx="96"
                    cy="96"
                    r="88"
                    className="stroke-amber-500 fill-none"
                    strokeWidth="8"
                    strokeDasharray={2 * Math.PI * 88}
                    initial={{ strokeDashoffset: 2 * Math.PI * 88 }}
                    animate={{ strokeDashoffset: 2 * Math.PI * 88 * (1 - stats.percentage / 100) }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-4xl font-black">{stats.percentage}%</span>
                  <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest">Completed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Decorative Background */}
          <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-amber-500/5 to-transparent pointer-events-none" />
        </section>
      )}

      <div className="container mx-auto px-4">
        {/* Legendary Banner */}
        {legendaryFeats.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-6 text-amber-500 font-black uppercase tracking-[0.2em] text-xs">
              <Star className="w-4 h-4 fill-current" /> Feats of Strength
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {legendaryFeats.map(feat => (
                <AchievementCard 
                  key={feat.id} 
                  achievement={feat} 
                  className="h-32 scale-105"
                />
              ))}
            </div>
          </div>
        )}

        {/* Tabs & Filtering */}
        <div className="flex flex-col md:flex-row gap-6 justify-between items-center mb-10 pb-6 border-b border-border">
          <div className="flex overflow-x-auto pb-2 md:pb-0 scrollbar-hide gap-1 w-full md:w-auto">
            {(Object.keys(SCOPE_CONFIG) as Array<keyof typeof SCOPE_CONFIG>).map((key) => {
              const TabIcon = SCOPE_CONFIG[key].icon
              const isActive = activeTab === key
              return (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold transition-all whitespace-nowrap border border-transparent",
                    isActive 
                      ? "bg-primary/20 text-foreground border-primary/20 shadow-lg" 
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <TabIcon className={cn("w-4 h-4", !isActive && "opacity-50", SCOPE_CONFIG[key].iconColor)} />
                  {SCOPE_CONFIG[key].label}
                </button>
              )
            })}
          </div>

          <div className="flex items-center gap-4 text-xs font-bold text-muted-foreground uppercase tracking-widest bg-secondary/50 px-4 py-2 rounded-xl border border-border">
            <span className="text-foreground">{stats.unlocked}</span> / {stats.total} Unlocked
          </div>
        </div>

        {/* Achievement Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {[...Array(12)].map((_, i) => (
               <div key={i} className="h-24 rounded-2xl bg-secondary/20 border border-border animate-pulse" />
             ))}
          </div>
        ) : filteredAchievements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredAchievements.map(achievement => (
              <AchievementCard 
                key={achievement.id} 
                achievement={achievement} 
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-24 bg-secondary/20 rounded-[3rem] border border-dashed border-border">
             <Trophy className="w-16 h-16 text-muted-foreground/10 mx-auto mb-6" />
             <h3 className="text-2xl font-display font-black mb-2 uppercase tracking-widest">No Feats Found</h3>
             <p className="text-muted-foreground max-w-sm mx-auto">The path to glory is still open. Continue your journey to populate this hall.</p>
          </div>
        )}
      </div>
    </div>
  )
}
