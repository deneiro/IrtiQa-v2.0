"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { useProfileStore } from '@/entities/profile'
import { useAttributeStore } from '@/entities/attribute'
import { GAME_CORE } from '@/shared/config/game-core'
import { 
  Shield, 
  Target, 
  Heart, 
  Users, 
  Home, 
  Coins, 
  Briefcase, 
  Sparkles, 
  Brain, 
  Sun,
  Crown,
  Settings
} from 'lucide-react'
import { DashboardSettingsMenu } from '@/features/dashboard-settings'
import { useState } from 'react'
import { cn } from '@/shared/lib/utils'
import Link from 'next/link'

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

export function ProfileSidebar() {
  const { profile } = useProfileStore()
  const { attributes } = useAttributeStore()
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  
  const level = profile?.level || 1
  const rank = profile?.rank || 'F'
  const rarity = GAME_CORE.getRarityForRank(rank)
  
  const current_xp = profile?.current_xp || 0
  const current_hp = profile?.current_hp || 100
  const max_hp = profile?.max_hp || GAME_CORE.MAX_HP
  const next_level_xp = GAME_CORE.calculateXpForNextLevel(level)
  const xp_percentage = (current_xp / next_level_xp) * 100

  return (
    <div className="flex flex-col space-y-6">
      {/* Primary Profile Card - Clickable Header */}
      <Card className="border-border bg-card/50 backdrop-blur-sm overflow-hidden relative group">
        <Link href="/profile" className="block outline-none">
          {/* Rarity Header Strip */}
          <div 
            className={cn(
              "absolute top-0 left-0 w-full h-1.5 transition-colors duration-1000",
              rarity.bg
            )} 
          />
          
          <CardHeader className="text-center pb-2 pt-8 group-hover:bg-white/5 transition-colors">
            {/* Avatar Area with Rarity Glow & Aura */}
            <div className="flex justify-center mb-6 relative">
              {/* Background Aura (Epic/Divine only) */}
              {['Epic', 'Divine'].includes(rarity.label) && (
                <motion.div
                  animate={{ 
                    scale: [1, 1.2, 1],
                    opacity: [0.1, 0.3, 0.1]
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                  className="absolute inset-0 rounded-full blur-[40px] z-0"
                  style={{ backgroundColor: rarity.color }}
                />
              )}

              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className={cn(
                  "h-28 w-28 rounded-full border-4 shadow-2xl relative z-10 p-1 flex items-center justify-center transition-all duration-1000",
                  rarity.glow,
                  rarity.animation
                )}
                style={{ borderColor: `${rarity.color}80` }}
              >
                <div className="h-full w-full rounded-full overflow-hidden flex items-center justify-center bg-background border border-white/10 group-hover:border-primary/50 transition-colors">
                  <img src={DUMMY_AVATAR} alt="Avatar" className="h-24 w-24" />
                </div>

                {/* Rarity Flare (Divine only) */}
                {rarity.label === 'Divine' && (
                  <div className="absolute -top-2 -right-2 bg-amber-400 rounded-full p-1 shadow-[0_0_15px_rgba(251,191,36,0.8)] border border-white/20 animate-bounce">
                    <Crown className="w-4 h-4 text-amber-900" />
                  </div>
                )}
              </motion.div>
              
              {/* Rank Badge */}
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="absolute -bottom-3 z-20"
              >
                <Badge 
                  className={cn(
                    "shadow-lg px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] border-none text-white transition-all duration-1000 relative overflow-hidden",
                    rarity.bg,
                    ['Epic', 'Divine', 'Legendary'].includes(rarity.label) && "before:absolute before:inset-0 before:bg-gradient-to-r before:from-transparent before:via-white/20 before:to-transparent before:animate-shimmer"
                  )}
                >
                  <span className="relative z-10">{rarity.label} Rank {rank}</span>
                </Badge>
              </motion.div>
            </div>
            
            <CardTitle className="text-2xl font-bold tracking-tight text-white/90 group-hover:text-primary transition-colors flex items-center justify-center gap-2">
              {profile?.display_name || "Adventurer"}
              <button 
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIsSettingsOpen(true)
                }}
                className="p-1.5 rounded-full hover:bg-white/10 text-muted-foreground hover:text-primary transition-all duration-300 transform group-hover:rotate-90"
              >
                <Settings className="w-4 h-4" />
              </button>
            </CardTitle>
            <DashboardSettingsMenu isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
            <div className="text-xs text-muted-foreground font-black uppercase tracking-widest flex items-center justify-center gap-2.5 mt-1">
              <span className="px-2 py-0.5 rounded bg-white/5 border border-white/5 text-[9px]">
                {profile?.class || "Cyber Mage"}
              </span>
              <span className="opacity-30">•</span>
              <span className="text-primary italic">Lvl {level}</span>
            </div>
          </CardHeader>
        </Link>
        
        <CardContent className="space-y-5 pt-4">
          {/* Health Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <span className="flex items-center gap-1.5 text-attribute-health">
                <Shield className="w-3.5 h-3.5 fill-attribute-health/10" /> Vitality
              </span>
              <span>{Math.floor(current_hp)} / {max_hp}</span>
            </div>
            <div className="relative h-2 w-full bg-secondary/30 rounded-full overflow-hidden border border-border/50">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-red-600 to-red-400 shadow-[0_0_15px_rgba(239,68,68,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${(current_hp/max_hp)*100}%` }}
                transition={{ duration: 1, ease: "easeOut" }}
              />
            </div>
          </div>

          {/* XP Bar */}
          <div className="space-y-2">
            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
              <span className="flex items-center gap-1.5 text-attribute-brightness">
                <Target className="w-3.5 h-3.5 fill-attribute-brightness/10" /> Experience
              </span>
              <span>{current_xp.toLocaleString()} / {next_level_xp.toLocaleString()}</span>
            </div>
            <div className="relative h-2 w-full bg-secondary/30 rounded-full overflow-hidden border border-border/50">
              <motion.div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-600 to-pink-400 shadow-[0_0_15px_rgba(236,72,153,0.4)]"
                initial={{ width: 0 }}
                animate={{ width: `${xp_percentage}%` }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.1 }}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Unfolded Attributes for Dashboard - Direct Visibility */}
      <Card className="bg-card/50 border-border overflow-hidden shadow-sm">
        <CardHeader className="pb-2 border-b border-border">
           <CardTitle className="text-[10px] font-black uppercase tracking-[0.3em] flex items-center justify-between text-muted-foreground/50">
             <div className="flex items-center gap-2.5">
               <Sparkles className="w-4 h-4 text-primary opacity-40" />
               Character Attributes
             </div>
           </CardTitle>
        </CardHeader>
        <CardContent className="px-5 py-6">
          <div className="space-y-5">
            {Object.values(GAME_CORE.ATTRIBUTES).map((attr, index) => {
              const attrData = attributes?.[attr.key as keyof typeof attributes];
              const attrLevel = attrData?.level || 1;
              const attrXp = attrData?.xp || 0;
              const attrNextXp = GAME_CORE.calculateXpForNextLevel(attrLevel);
              const progress = (attrXp / attrNextXp) * 100;
              const Icon = ATTRIBUTE_ICONS[attr.key] || Target;

              return (
                <motion.div 
                  key={attr.key} 
                  initial={{ x: -10, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="space-y-2 group"
                >
                  <div className="flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <div 
                          className="p-1.5 rounded-lg bg-secondary/50 border border-border group-hover:scale-110 transition-transform duration-500"
                          style={{ color: attr.color }}
                        >
                          <Icon className="w-3.5 h-3.5 shadow-sm" />
                        </div>
                        <span className="text-xs font-bold tracking-tight text-foreground/70">{attr.name}</span>
                      </div>
                      <div className="text-[9px] font-black text-muted-foreground flex items-center gap-2 bg-secondary/50 px-2 py-0.5 rounded-full border border-border">
                        <span className="text-foreground/80 opacity-60">Lvl {attrLevel}</span>
                        <span style={{ color: attr.color }}>{Math.floor(progress)}%</span>
                      </div>
                  </div>
                  
                  <div className="h-1 w-full bg-secondary/20 rounded-full overflow-hidden border border-border/50">
                    <motion.div 
                        className="h-full rounded-full"
                        style={{ 
                          backgroundColor: attr.color, 
                          boxShadow: `0 0 10px ${attr.color}33` 
                        }}
                        initial={{ width: 0 }}
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 1, ease: "circOut" }}
                    />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
