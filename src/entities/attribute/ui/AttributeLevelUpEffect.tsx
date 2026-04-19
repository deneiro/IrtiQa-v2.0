"use client"

import React, { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAttributeStore } from '../model/store'
import { Confetti } from '@/shared/ui/vfx/Confetti'
import { useVFXStore } from '@/shared/model/vfx-store'
import { GAME_CORE } from '@/shared/config/game-core'
import { ArrowUpCircle, Sparkles } from 'lucide-react'

export function AttributeLevelUpEffect() {
  const { attributes } = useAttributeStore()
  const { addEffect } = useVFXStore()
  const [prevLevels, setPrevLevels] = useState<Record<string, number>>({})
  const [activeCelebration, setActiveCelebration] = useState<{
    id: string
    type: string
    name: string
    color: string
  } | null>(null)

  useEffect(() => {
    if (!attributes) return

    const currentLevels = Object.entries(attributes).reduce((acc, [type, attr]) => {
      acc[type] = attr.level
      return acc
    }, {} as Record<string, number>)

    // Check for level ups
    Object.entries(currentLevels).forEach(([type, level]) => {
      const prevLevel = prevLevels[type]
      if (prevLevel !== undefined && level > prevLevel) {
        // Attribute Level Up!
        const attrConfig = (GAME_CORE.ATTRIBUTES as any)[type]
        const celebrationId = Math.random().toString(36).substring(7)
        
        // Trigger generic VFX popup first
        addEffect('attribute_up', level, window.innerWidth / 2, window.innerHeight / 2)
        
        setActiveCelebration({
          id: celebrationId,
          type,
          name: attrConfig?.name || type,
          color: attrConfig?.color || '#ffffff'
        })

        // Auto-hide after 3 seconds
        setTimeout(() => {
          setActiveCelebration(prev => prev?.id === celebrationId ? null : prev)
        }, 3000)
      }
    })

    setPrevLevels(currentLevels)
  }, [attributes, prevLevels, addEffect])

  return (
    <AnimatePresence>
      {activeCelebration && (
        <div className="fixed inset-0 z-[2500] pointer-events-none flex items-center justify-center">
          {/* Targeted Confetti */}
          <Confetti count={40} colors={[activeCelebration.color, '#ffffff']} />

          <motion.div
            initial={{ scale: 0.8, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 1.1, opacity: 0, y: -20 }}
            className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-black/40 backdrop-blur-xl border border-white/10 shadow-2xl"
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 opacity-20 blur-xl rounded-full"
                style={{ backgroundColor: activeCelebration.color }}
              />
              <ArrowUpCircle 
                className="w-12 h-12 relative z-10" 
                style={{ color: activeCelebration.color }} 
              />
            </div>
            
            <div className="text-center">
              <p className="text-[10px] font-mono uppercase tracking-[0.3em] text-muted-foreground mb-1">
                Attribute Ascension
              </p>
              <h3 className="text-2xl font-display font-black uppercase italic text-white flex items-center gap-2">
                <span style={{ color: activeCelebration.color }}>{activeCelebration.name}</span>
                <span className="text-white/40">Reached</span>
                <Sparkles className="w-5 h-5 text-yellow-400" />
              </h3>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
