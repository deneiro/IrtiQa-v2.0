"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus } from 'lucide-react'

// Note: use-sound would be injected here if we had actual audio files
// import useSound from 'use-sound'

export interface XpPopupProps {
  amount: number
  isVisible: boolean
  x?: number
  y?: number
}

export function XpPopup({ amount, isVisible, x = 0, y = 0 }: XpPopupProps) {
  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, top: y, left: x, scale: 0.5 }}
          animate={{ opacity: 1, top: y - 60, scale: 1.2 }}
          exit={{ opacity: 0, top: y - 100, scale: 1 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="fixed pointer-events-none z-[100] flex items-center gap-1 font-display font-bold text-attribute-brightness drop-shadow-[0_0_10px_rgba(255,165,0,0.5)] text-2xl"
        >
          <Plus className="w-5 h-5" />
          {amount} XP
        </motion.div>
      )}
    </AnimatePresence>
  )
}
