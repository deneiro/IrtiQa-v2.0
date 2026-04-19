'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfileStore } from '@/entities/profile'
import { useAttributeStore } from '@/entities/attribute'
import { GAME_CORE } from '@/shared/config/game-core'
import { AllSeeingEye } from '@/widgets/all-seeing-eye'
import { RankProgressGauge } from '@/features/progression'
import { ActivityFeed } from '@/features/activity-journal'
import { HallOfFameView } from '@/views/achievements'
import { cn } from '@/shared/lib/utils'
import { 
  Shield, 
  Target, 
  Flame, 
  Heart, 
  Users, 
  Home, 
  Coins, 
  Briefcase, 
  Sparkles, 
  Brain, 
  Sun,
  Crown,
  History,
  Trophy,
  ArrowLeft
} from 'lucide-react'
import Link from 'next/link'
import { Badge } from '@/shared/ui/badge'

const DUMMY_AVATAR = "https://api.dicebear.com/7.x/notionists/svg?seed=Irtiqa"

const ATTRIBUTE_ICONS: Record<string, any> = {
  health: Heart,
  friends: Users,
  family: Home,
  money: Coins,
  career: Briefcase,
  spirituality: Sparkles,
  development: Brain,
  brightness: Sun,
}

export function ProfileView() {
  const { profile } = useProfileStore()
  const { attributes } = useAttributeStore()
  const [activeTab, setActiveTab] = useState<'history' | 'legacy'>('history')

  const level = profile?.level || 1
  const rank = profile?.rank || 'F'
  const rarity = GAME_CORE.getRarityForRank(rank)

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Top Navigation */}
      <div className="container mx-auto px-4 py-6">
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-muted-foreground hover:text-primary transition-colors group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Command
        </Link>
      </div>

      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Character Summary (Stat Card + Radar) */}
          <div className="lg:col-span-4 space-y-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="relative p-8 rounded-[2.5rem] bg-card/80 border border-border shadow-2xl overflow-hidden"
            >
              {/* Rarity Background Aura */}
              <div 
                className="absolute inset-0 opacity-10 blur-[100px] -z-10"
                style={{ backgroundColor: rarity.color }}
              />

              <div className="flex flex-col items-center text-center">
                <div className="relative mb-6">
                  <motion.div 
                    initial={{ scale: 0.8 }}
                    animate={{ scale: 1 }}
                    className={cn(
                      "h-32 w-32 rounded-full border-4 p-1 relative z-10 bg-background",
                      rarity.glow
                    )}
                    style={{ borderColor: rarity.color }}
                  >
                    <img src={DUMMY_AVATAR} alt="Avatar" className="h-full w-full rounded-full" />
                  </motion.div>
                  
                  <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 z-20">
                    <Badge className={cn("px-4 py-1 font-black uppercase tracking-widest text-[10px]", rarity.bg)}>
                      {rarity.label}
                    </Badge>
                  </div>
                </div>

                <h1 className="text-3xl font-black tracking-tight mb-1 text-foreground">
                  {profile?.display_name || "Adventurer"}
                </h1>
                <p className="text-primary font-black uppercase tracking-[0.3em] text-[10px] mb-6">
                  {profile?.class || "Cyber Mage"} • Level {level}
                </p>

                <div className="w-full space-y-6 pt-6 border-t border-border">
                   <RankProgressGauge currentLevel={level} />
                </div>
              </div>
            </motion.div>

            {/* Radar Centerpiece */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="p-8 rounded-[2.5rem] bg-card/30 border border-border flex flex-col items-center"
            >
              <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-muted-foreground/40 mb-8">
                Wheel of Life Alignment
              </h3>
              <AllSeeingEye size={360} className="bg-transparent border-none" />
            </motion.div>
          </div>

          {/* Right Column: Dynamic Feed (History / Legacy) */}
          <div className="lg:col-span-8">
            <div className="flex flex-col h-full">
              {/* Tabs Container */}
              <div className="flex items-center gap-4 mb-8 bg-secondary/40 p-1.5 rounded-2xl border border-border w-fit">
                <button
                  onClick={() => setActiveTab('history')}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === 'history' ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <History className="w-4 h-4" />
                  Activity Journal
                </button>
                <button
                  onClick={() => setActiveTab('legacy')}
                  className={cn(
                    "flex items-center gap-2.5 px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all",
                    activeTab === 'legacy' ? "bg-primary text-black" : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  <Trophy className="w-4 h-4" />
                  Hall of Fame
                </button>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === 'history' ? (
                  <motion.div
                    key="history"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1 rounded-[2.5rem] bg-card/30 border border-border p-8 lg:p-12"
                  >
                    <div className="max-w-2xl">
                      <h2 className="text-3xl font-black tracking-tight mb-2">Chronological History</h2>
                      <p className="text-muted-foreground text-sm mb-12">Behold the sequential records of your evolution and protocols executed.</p>
                      <ActivityFeed />
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="legacy"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="flex-1"
                  >
                    {/* Integrated existing view but simplified */}
                    <HallOfFameView hideHeader={true} />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
