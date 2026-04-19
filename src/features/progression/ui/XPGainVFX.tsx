'use client'

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Flame, Coins } from 'lucide-react'

interface RewardParticle {
  id: string
  x: number
  y: number
  amount: number
  type: 'xp' | 'gold'
}

interface XPGainVFXProps {
  rewards: { xp: number; gold: number } | null
  onComplete: () => void
}

export function XPGainVFX({ rewards, onComplete }: XPGainVFXProps) {
  const [particles, setParticles] = useState<RewardParticle[]>([])

  useEffect(() => {
    if (rewards && (rewards.xp > 0 || rewards.gold > 0)) {
      const newParticles: RewardParticle[] = []
      
      if (rewards.xp > 0) {
        newParticles.push({
          id: `xp-${Date.now()}`,
          x: -30, // Offset to the left
          y: -10,
          amount: rewards.xp,
          type: 'xp'
        })
      }
      
      if (rewards.gold > 0) {
        newParticles.push({
          id: `gold-${Date.now()}`,
          x: 30, // Offset to the right
          y: -30, // Slightly higher
          amount: rewards.gold,
          type: 'gold'
        })
      }

      setParticles(newParticles)

      const timer = setTimeout(() => {
        setParticles([])
        onComplete()
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [rewards, onComplete])

  return (
    <div className="absolute inset-0 pointer-events-none z-[60] flex items-center justify-center">
      <AnimatePresence>
        {particles.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 0, scale: 0.5 }}
            animate={{ 
              opacity: [0, 1, 1, 0], 
              y: -80, 
              scale: [0.5, 1.2, 1],
              x: p.x 
            }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className="absolute flex items-center gap-1.5 whitespace-nowrap"
          >
            {p.type === 'xp' ? (
              <>
                <Flame className="w-4 h-4 text-primary fill-primary/20" />
                <span className="text-xl font-display font-black text-primary italic drop-shadow-[0_0_8px_rgba(var(--primary),0.5)]">
                  +{p.amount} XP
                </span>
              </>
            ) : (
              <>
                <Coins className="w-4 h-4 text-yellow-500 fill-yellow-500/20" />
                <span className="text-xl font-display font-black text-yellow-500 italic drop-shadow-[0_0_8px_rgba(234,179,8,0.5)]">
                  +{p.amount} G
                </span>
              </>
            )}
          </motion.div>
        ))}
        
        {/* High Reward Visual (Fireworks-like burst for >100 XP) */}
        {rewards && rewards.xp >= 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: [0, 1, 0], scale: [0, 4] }}
            transition={{ duration: 1 }}
            className="absolute w-16 h-16 rounded-full border-4 border-primary/30"
          />
        )}
      </AnimatePresence>
    </div>
  )
}
