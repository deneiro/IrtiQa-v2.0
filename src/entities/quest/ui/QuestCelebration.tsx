'use client'

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Trophy, CheckCircle, Clock, Sparkles, TrendingUp } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { formatDistanceStrict } from 'date-fns'
import { GAME_CORE } from '@/shared/config/game-core'

interface QuestCelebrationProps {
  quest: {
    title: string
    xp_reward: number
    gold_reward: number
    attribute_ids?: string[]
    created_at: string
    completed_at?: string
  }
  isOpen: boolean
  onClose: () => void
}

export function QuestCelebration({ quest, isOpen, onClose }: QuestCelebrationProps) {
  // Use current time if completed_at is not available (since celebration happens at completion)
  const completionDate = quest.completed_at ? new Date(quest.completed_at) : new Date()
  const duration = formatDistanceStrict(new Date(quest.created_at), completionDate)

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-background/90 backdrop-blur-xl"
            onClick={onClose}
          />

          {/* Radiating Glow */}
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 0.15 }}
            transition={{ duration: 1.5, repeat: Infinity, repeatType: "reverse" }}
            className="absolute w-[500px] h-[500px] rounded-full bg-primary/20 blur-[120px]"
          />

          {/* Modal Content */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 40 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="relative w-full max-w-lg bg-card border border-border rounded-3xl overflow-hidden p-8 text-center shadow-2xl"
          >
            {/* Top Icon Burst */}
            <div className="flex justify-center mb-6 relative">
              <motion.div
                initial={{ rotate: -45, scale: 0 }}
                animate={{ rotate: 0, scale: 1 }}
                transition={{ type: "spring", delay: 0.2 }}
                className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 flex items-center justify-center relative z-10"
              >
                <Trophy className="w-10 h-10 text-primary" />
              </motion.div>
              
              <motion.div 
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"
              />
            </div>

            {/* Typography */}
            <div className="space-y-2 mb-8">
              <motion.p 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="text-xs font-mono uppercase tracking-[0.4em] text-primary"
              >
                Mission Accomplished
              </motion.p>
              <motion.h2 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-3xl font-display font-black tracking-tight text-foreground px-4"
              >
                {quest.title}
              </motion.h2>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <motion.div 
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="p-4 rounded-xl bg-secondary border border-border flex flex-col items-center gap-1"
              >
                <Clock className="w-4 h-4 text-muted-foreground mb-1" />
                <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">Duration</span>
                <span className="text-sm font-semibold text-foreground uppercase">{duration}</span>
              </motion.div>
              
              <motion.div 
                initial={{ x: 20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="p-4 rounded-xl bg-secondary border border-border flex flex-col items-center gap-1"
              >
                <TrendingUp className="w-4 h-4 text-primary mb-1" />
                <span className="text-[10px] uppercase font-mono text-muted-foreground tracking-wider">Impact</span>
                <div className="flex gap-2">
                   {quest.attribute_ids?.slice(0, 2).map(attr => (
                     <div 
                      key={attr} 
                      className="w-2 h-2 rounded-full" 
                      style={{ backgroundColor: (GAME_CORE.ATTRIBUTES as any)[attr]?.color }}
                      title={attr}
                     />
                   ))}
                </div>
              </motion.div>
            </div>

            {/* Reward Display */}
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.9 }}
              className="flex items-center justify-center gap-6 py-6 border-y border-border mb-8"
            >
              <div className="flex items-center gap-3">
                <div className="text-2xl font-display font-black text-primary">+{quest.xp_reward}</div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase border-l border-border pl-3">XP Bounty</div>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-display font-black text-yellow-500">+{quest.gold_reward}</div>
                <div className="text-[10px] font-mono text-muted-foreground uppercase border-l border-border pl-3">Gold Drops</div>
              </div>
            </motion.div>

            {/* Actions */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.1 }}
            >
              <Button 
                onClick={onClose}
                className="w-full bg-primary hover:bg-primary/90 text-black font-bold h-14 rounded-2xl group transition-all"
              >
                <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                <span className="uppercase tracking-widest font-display">Acknowledge Ascension</span>
              </Button>
            </motion.div>
          </motion.div>
          
          {/* Particles/Confetti placeholder (if we had a component for it) */}
          <Sparkles className="absolute left-1/4 top-1/4 text-primary/40 animate-pulse" />
          <Sparkles className="absolute right-1/4 bottom-1/4 text-primary/40 animate-pulse delay-700" />
        </div>
      )}
    </AnimatePresence>
  )
}
