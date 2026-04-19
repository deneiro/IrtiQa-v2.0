"use client"

import React, { useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAchievementStore } from '@/entities/achievement'
import { Confetti } from '@/shared/ui/vfx/Confetti'
import useSound from 'use-sound'
import { Star, Trophy, Sparkles } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export function AchievementCeremony() {
  const { newlyUnlockedAchievement, clearNewlyUnlocked } = useAchievementStore()
  const [playFanfare] = useSound('/sounds/achievement-fanfare.mp3', { volume: 0.6 })
  const [playGold] = useSound('/sounds/gold-gain.mp3', { volume: 0.4 })

  useEffect(() => {
    if (newlyUnlockedAchievement) {
      playFanfare()
      // Play gold sound slightly delayed
      setTimeout(() => playGold(), 1000)
    }
  }, [newlyUnlockedAchievement, playFanfare, playGold])

  if (!newlyUnlockedAchievement) return null

  const achievement = newlyUnlockedAchievement

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[4000] flex items-center justify-center">
        {/* Backdrop overlay - click to clear */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto cursor-pointer"
          onClick={clearNewlyUnlocked}
        />

        <Confetti count={150} />

        <motion.div
          initial={{ scale: 0.5, opacity: 0, rotateX: 90 }}
          animate={{ scale: 1, opacity: 1, rotateX: 0 }}
          exit={{ scale: 1.2, opacity: 0, rotateX: -90 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative z-10 w-full max-w-sm"
        >
          {/* Main Card */}
          <div className="relative p-8 rounded-[3rem] bg-gradient-to-b from-white/10 to-white/5 border-2 border-amber-500/50 shadow-[0_0_100px_rgba(245,158,11,0.2)] overflow-hidden">
            
            {/* Ambient Pulse */}
            <motion.div
              animate={{ opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="absolute inset-0 bg-amber-500/10 blur-3xl"
            />

            <div className="relative z-20 flex flex-col items-center text-center">
              {/* Icon Burst */}
              <div className="relative mb-8">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                  className="absolute inset-0 scale-150 opacity-20"
                >
                  <Sparkles className="w-full h-full text-amber-500" />
                </motion.div>
                
                <motion.div
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 0.2 }}
                  className="w-24 h-24 rounded-3xl bg-amber-500 border-4 border-white/20 flex items-center justify-center text-5xl shadow-2xl relative"
                >
                  {achievement.icon || '🏆'}
                </motion.div>
              </div>

              {/* Text Group */}
              <div className="space-y-3 mb-8">
                <motion.p
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-[10px] font-black uppercase tracking-[0.8em] text-amber-500"
                >
                  New Legacy Unlocked
                </motion.p>
                <motion.h2
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-4xl font-display font-black tracking-tighter text-white uppercase italic"
                >
                  {achievement.title}
                </motion.h2>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="text-sm text-white/60 leading-relaxed font-medium"
                >
                  {achievement.description}
                </motion.p>
              </div>

              {/* Rewards */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.8 }}
                className="flex items-center gap-6"
              >
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-white">+{achievement.xp_reward}</span>
                  <span className="text-[9px] uppercase font-bold text-amber-500 tracking-widest">XP gained</span>
                </div>
                <div className="w-px h-8 bg-white/10" />
                <div className="flex flex-col items-center">
                  <span className="text-2xl font-black text-white">+{achievement.gold_reward}</span>
                  <span className="text-[9px] uppercase font-bold text-yellow-400 tracking-widest">Gold found</span>
                </div>
              </motion.div>

              {/* Rarity Star */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2 }}
                className="mt-10 inline-flex items-center gap-2 px-6 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 text-[10px] font-black uppercase tracking-widest"
              >
                <Star className="w-3.5 h-3.5 fill-current" /> {achievement.rarity} feat
              </motion.div>
            </div>
          </div>

          <motion.p
            animate={{ opacity: [0.2, 0.5, 0.2] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-center mt-8 text-[9px] font-black uppercase tracking-[0.4em] text-white/40"
          >
            Acknowledge to resume journey
          </motion.p>
        </motion.div>
      </div>
    </AnimatePresence>
  )
}
