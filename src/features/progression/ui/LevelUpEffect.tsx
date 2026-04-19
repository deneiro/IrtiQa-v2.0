"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useProfileStore } from '@/entities/profile'
import { Confetti } from '@/shared/ui/vfx/Confetti'
import useSound from 'use-sound'
import { Sparkles, Trophy, Star } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export function LevelUpEffect() {
  const { profile } = useProfileStore()
  const [lastLevel, setLastLevel] = useState<number | null>(null)
  const [showCelebration, setShowCelebration] = useState(false)
  const [playLevelUp] = useSound('/sounds/level-up.mp3', { volume: 0.6 })

  useEffect(() => {
    if (profile && lastLevel !== null && profile.level > lastLevel) {
      // Level Up Detected!
      setShowCelebration(true)
      playLevelUp()
      
      // Auto-hide after 5 seconds
      const timer = setTimeout(() => {
        setShowCelebration(false)
      }, 5000)
      
      return () => clearTimeout(timer)
    }
    
    if (profile) {
      setLastLevel(profile.level)
    }
  }, [profile?.level, lastLevel, playLevelUp])

  if (!profile) return null

  return (
    <AnimatePresence>
      {showCelebration && (
        <div className="fixed inset-0 z-[3000] flex items-center justify-center pointer-events-none">
          {/* Background Dimming */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm pointer-events-auto"
            onClick={() => setShowCelebration(false)}
          />

          {/* Confetti Particles */}
          <Confetti count={100} />

          {/* Central Notification */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, y: 50 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.2, opacity: 0, y: -50 }}
            transition={{ type: "spring", stiffness: 200, damping: 20 }}
            className="relative z-10 flex flex-col items-center gap-6"
          >
            {/* Pulsing Trophy */}
            <div className="relative">
              <motion.div
                animate={{ 
                  scale: [1, 1.2, 1],
                  rotate: [0, 5, -5, 0]
                }}
                transition={{ duration: 2, repeat: Infinity }}
                className="w-32 h-32 rounded-full bg-attribute-brightness/20 border-2 border-attribute-brightness/40 flex items-center justify-center shadow-[0_0_50px_rgba(236,72,153,0.3)]"
              >
                <Trophy className="w-16 h-16 text-attribute-brightness" />
              </motion.div>
              
              <div className="absolute -top-4 -right-4">
                <motion.div
                  animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
                  transition={{ duration: 1, repeat: Infinity }}
                >
                  <Sparkles className="w-8 h-8 text-yellow-400" />
                </motion.div>
              </div>
            </div>

            {/* Level Announcement */}
            <div className="text-center space-y-2">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="text-xs font-black uppercase tracking-[0.6em] text-attribute-brightness"
              >
                Character Ascension
              </motion.p>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-6xl font-display font-black tracking-tighter text-white uppercase italic"
              >
                Level <span className="text-attribute-brightness">{profile.level}</span>
              </motion.h2>
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: '100%' }}
                className="h-1 bg-gradient-to-r from-transparent via-attribute-brightness to-transparent"
              />
            </div>

            {/* Rank Update */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
              className="flex items-center gap-3 px-6 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md"
            >
              <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-bold uppercase tracking-widest text-white/80">
                Rank <span className="text-white">{profile.rank}</span> Achievement
              </span>
            </motion.div>

            {/* Tap to continue hint */}
            <motion.p
              animate={{ opacity: [0.3, 0.7, 0.3] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-[10px] uppercase tracking-widest text-muted-foreground mt-8"
            >
              Acknowledge to continue
            </motion.p>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
