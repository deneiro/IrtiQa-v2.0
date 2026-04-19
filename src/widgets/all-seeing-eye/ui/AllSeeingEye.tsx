"use client"

import React, { useMemo } from 'react'
import { RadarChart } from '@/shared/ui/vfx/RadarChart'
import { useAttributeStore } from '@/entities/attribute'
import { GAME_CORE } from '@/shared/config/game-core'
import { motion } from 'framer-motion'
import { cn } from '@/shared/lib/utils'

interface AllSeeingEyeProps {
  size?: number
  className?: string
}

export function AllSeeingEye({ size = 280, className }: AllSeeingEyeProps) {
  const { attributes } = useAttributeStore()

  // Format data for the radar chart based on established 8 attributes
  const radarData = useMemo(() => {
    return Object.keys(GAME_CORE.ATTRIBUTES).map((key) => {
      const attrConfig = (GAME_CORE.ATTRIBUTES as any)[key]
      const attrData = (attributes as any)?.[key]
      
      const level = attrData?.level || 1
      const xp = attrData?.xp || 0
      const nextXp = GAME_CORE.calculateXpForNextLevel(level)
      
      // Calculate progress percentage for scale (0-100)
      // We can use (Level * 10 + progress%) to show absolute power, 
      // but for "Wheel of Life" balance, progress% within level or 
      // normalized power is better.
      // Let's use (level - 1) * 20 + (xp/nextXp * 20) capped at 100 
      // to show growth across ranks.
      const normalizedValue = Math.min(100, ((level - 1) * 20) + (xp / nextXp * 20))

      return {
        key,
        label: attrConfig.name,
        value: normalizedValue || 5, // Minimum visibility
        color: attrConfig.color
      }
    })
  }, [attributes])

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={cn(
        "relative flex items-center justify-center p-4 bg-card/50 rounded-[3rem] border border-border shadow-inner overflow-hidden group",
        className
      )}
    >
      {/* Background Pulsing Aura */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 to-purple-500/5 opacity-50" />
      
      {/* Tactical Scanlines Overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03] z-20" 
           style={{ 
             backgroundImage: 'linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))',
             backgroundSize: '100% 4px, 3px 100%' 
           }} 
      />

      {/* Radar Chart Component */}
      <RadarChart 
        data={radarData} 
        size={size} 
        showGrid={true}
      />

      {/* Central "Eye" Pulse & Heartbeat */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
        <motion.div
          animate={{ 
            scale: [1, 1.15, 1],
            opacity: [0.3, 0.7, 0.3],
            boxShadow: [
              "0 0 20px rgba(255,255,255,0.1)",
              "0 0 40px rgba(255,255,255,0.3)",
              "0 0 20px rgba(255,255,255,0.1)"
            ]
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            ease: "easeInOut",
            times: [0, 0.2, 1] // Heartbeat rhythm
          }}
          className="w-14 h-14 rounded-full bg-primary/20 blur-xl"
        />
        <div className="absolute inset-0 flex items-center justify-center">
            <motion.div 
               animate={{ scale: [1, 1.4, 1] }}
               transition={{ duration: 2, repeat: Infinity, times: [0, 0.1, 1] }}
               className="w-2 h-2 rounded-full bg-primary shadow-[0_0_15px_rgba(var(--primary),0.8)]" 
            />
        </div>
      </div>

      {/* Decorative Corner Scanlines (Tactical UI feel) */}
      <div className="absolute top-4 left-4 w-4 h-4 border-t-2 border-l-2 border-primary/20" />
      <div className="absolute top-4 right-4 w-4 h-4 border-t-2 border-r-2 border-primary/20" />
      <div className="absolute bottom-4 left-4 w-4 h-4 border-b-2 border-l-2 border-primary/20" />
      <div className="absolute bottom-4 right-4 w-4 h-4 border-b-2 border-r-2 border-primary/20" />
    </motion.div>
  )
}
