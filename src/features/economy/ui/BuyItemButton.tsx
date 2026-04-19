'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MarketItem } from '@/shared/config/game-core'
import { usePurchaseItem } from '../api/purchase-item'
import { useProfileStore } from '@/entities/profile'
import { cn } from '@/shared/lib/utils'

interface BuyItemButtonProps {
  item: MarketItem
  className?: string
}

export const BuyItemButton: React.FC<BuyItemButtonProps> = ({ item, className }) => {
  const { purchaseItem } = usePurchaseItem()
  const profile = useProfileStore(state => state.profile)
  const [isPurchasing, setIsPurchasing] = useState(false)

  const canAfford = (profile?.gold ?? 0) >= item.price

  const handleBuy = async () => {
    if (isPurchasing || !canAfford) return
    
    setIsPurchasing(true)
    await purchaseItem(item)
    setIsPurchasing(false)
  }

  return (
    <button
      onClick={handleBuy}
      disabled={isPurchasing || !canAfford}
      className={cn(
        "relative w-full py-2 px-4 rounded-xl font-bold text-sm transition-all duration-300 overflow-hidden",
        canAfford 
          ? "bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500 hover:text-black border border-yellow-500/50" 
          : "bg-white/5 text-white/30 border border-white/5 cursor-not-allowed",
        className
      )}
    >
      <AnimatePresence mode="wait">
        {isPurchasing ? (
          <motion.div
            key="purchasing"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="flex items-center justify-center gap-2"
          >
            <div className="w-3 h-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
            <span>Processing...</span>
          </motion.div>
        ) : (
          <motion.div
            key="buy"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="flex items-center justify-center gap-2"
          >
            <span>Buy for</span>
            <div className="flex items-center gap-1">
              <span className="text-lg">🪙</span>
              <span>{item.price}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </button>
  )
}
