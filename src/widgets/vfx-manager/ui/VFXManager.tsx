"use client"

import React, { useEffect } from 'react'
import { FloatingText } from '@/shared/ui/vfx/FloatingText'
import { useVFXStore } from '@/shared/model/vfx-store'
import useSound from 'use-sound'
import { AnimatePresence } from 'framer-motion'

export function VFXManager() {
  const { activeEffects } = useVFXStore()
  
  // Audio Hooks
  const [playXp] = useSound('/sounds/xp-gain.mp3', { volume: 0.4 })
  const [playGold] = useSound('/sounds/gold-gain.mp3', { volume: 0.5 })
  const [playDamage] = useSound('/sounds/hurt.mp3', { volume: 0.3 })
  const [playHeal] = useSound('/sounds/heal.mp3', { volume: 0.4 })
  const [playJournal] = useSound('/sounds/journal-seal.mp3', { volume: 0.5 })
  const [playQuest] = useSound('/sounds/quest-deploy.mp3', { volume: 0.5 })
  const [playAttrUp] = useSound('/sounds/attribute-up.mp3', { volume: 0.5 })
  const [playPowerup] = useSound('/sounds/powerup-activate.mp3', { volume: 0.5 })
  const [playHealGlug] = useSound('/sounds/heal-glug.mp3', { volume: 0.5 })
  const [playShield] = useSound('/sounds/shield-break.mp3', { volume: 0.5 })

  useEffect(() => {
    if (activeEffects.length === 0) return
    
    // Play sound for the most recent effect
    const latest = activeEffects[activeEffects.length - 1]
    
    // Only play if it was created very recently (to avoid sound spam on batch loads)
    const isNew = Date.now() - latest.createdAt < 100
    if (!isNew) return

    switch (latest.type) {
      case 'xp': playXp(); break
      case 'gold': playGold(); break
      case 'damage': playDamage(); break
      case 'heal': playHeal(); playHealGlug(); break
      case 'journal_complete': playJournal(); break
      case 'quest_deploy': playQuest(); break
      case 'attribute_up': playAttrUp(); break
      case 'item_use': playPowerup(); break
      case 'shield_activate': playShield(); break
      case 'temporal_shift': playPowerup(); break
    }
  }, [activeEffects.length, playXp, playGold, playDamage, playHeal])

  return (
    <div className="fixed inset-0 pointer-events-none z-[999]">
      <AnimatePresence>
        {activeEffects.map((effect) => (
          <FloatingText
            key={effect.id}
            type={effect.type}
            amount={effect.amount}
            x={effect.x}
            y={effect.y}
          />
        ))}
      </AnimatePresence>
    </div>
  )
}
