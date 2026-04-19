"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { Plus, Minus, Coins, Zap, BookOpen, Target, ArrowUpCircle, Sparkles, ShieldCheck } from 'lucide-react'
import { cn } from '@/shared/lib/utils'
import { VFXType } from '@/shared/model/vfx-store'

interface FloatingTextProps {
  type: VFXType
  amount: number
  x: number
  y: number
}

export function FloatingText({ type, amount, x, y }: FloatingTextProps) {
  const isPositive = type !== 'damage'
  
  const config = {
    xp: {
      color: 'text-attribute-brightness',
      shadow: 'shadow-attribute-brightness/40',
      icon: <Zap className="w-4 h-4" />,
      label: 'XP'
    },
    gold: {
      color: 'text-yellow-400',
      shadow: 'shadow-yellow-500/40',
      icon: <Coins className="w-4 h-4" />,
      label: 'G'
    },
    damage: {
      color: 'text-red-500',
      shadow: 'shadow-red-600/40',
      icon: <Minus className="w-4 h-4" />,
      label: 'HP'
    },
    heal: {
      color: 'text-green-400',
      shadow: 'shadow-green-500/40',
      icon: <Plus className="w-4 h-4" />,
      label: 'HP'
    },
    journal_complete: {
      color: 'text-attribute-spirituality',
      shadow: 'shadow-attribute-spirituality/40',
      icon: <BookOpen className="w-4 h-4" />,
      label: 'Reflected'
    },
    quest_deploy: {
      color: 'text-primary',
      shadow: 'shadow-primary/40',
      icon: <Target className="w-4 h-4" />,
      label: 'Mission Deployed'
    },
    attribute_up: {
      color: 'text-yellow-400',
      shadow: 'shadow-yellow-500/40',
      icon: <ArrowUpCircle className="w-4 h-4" />,
      label: 'Attr LVL UP'
    },
    item_use: {
      color: 'text-amber-400',
      shadow: 'shadow-amber-500/40',
      icon: <Sparkles className="w-4 h-4" />,
      label: 'Consumable Applied'
    },
    shield_activate: {
      color: 'text-cyan-400',
      shadow: 'shadow-cyan-500/40',
      icon: <ShieldCheck className="w-4 h-4" />,
      label: 'Shield Active'
    },
    xp_gain: {
      color: 'text-attribute-brightness',
      shadow: 'shadow-attribute-brightness/40',
      icon: <Zap className="w-4 h-4" />,
      label: 'XP'
    },
    gold_gain: {
      color: 'text-yellow-400',
      shadow: 'shadow-yellow-500/40',
      icon: <Coins className="w-4 h-4" />,
      label: 'G'
    },
    temporal_shift: {
      color: 'text-cyan-400',
      shadow: 'shadow-cyan-500/40',
      icon: <ArrowUpCircle className="w-4 h-4" />,
      label: 'Time Shift'
    }
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.5, x: x, y: y }}
      animate={{ 
        opacity: [0, 1, 1, 0],
        scale: [0.5, 1.2, 1, 0.8],
        y: y - 120,
        x: x + (Math.random() * 40 - 20) // Slight random horizontal drift
      }}
      transition={{ 
        duration: 1.5, 
        times: [0, 0.2, 0.8, 1],
        ease: "easeOut" 
      }}
      className={cn(
        "fixed pointer-events-none z-[1000] flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/40 backdrop-blur-md border border-white/10",
        "font-display font-black text-lg whitespace-nowrap",
        config.color,
        "shadow-lg"
      )}
      style={{
        boxShadow: `0 0 20px -5px currentColor`
      }}
    >
      <span className="flex items-center justify-center">
        {config.icon}
      </span>
      <span>
        {isPositive ? '+' : ''}{amount}
      </span>
      <span className="text-[10px] uppercase tracking-tighter opacity-70 ml-0.5">
        {config.label}
      </span>
    </motion.div>
  )
}
