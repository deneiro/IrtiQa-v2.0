'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useInventoryStore, InventoryItemCard } from '@/entities/inventory'
import { useItem } from '@/features/economy'
import { useProfileStore } from '@/entities/profile'
import { cn } from '@/shared/lib/utils'

interface InventoryListProps {
  className?: string
  horizontal?: boolean
}

export const InventoryList: React.FC<InventoryListProps> = ({ 
  className,
  horizontal 
}) => {
  const { items, isLoading } = useInventoryStore()
  const profile = useProfileStore(state => state.profile)

  const handleUseItem = async (item: any) => {
    if (!profile) return
    await useItem(item.id, profile.user_id)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-10">
        <div className="w-8 h-8 border-4 border-white/10 border-t-indigo-500 rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className={cn("w-full", className)}>
      <AnimatePresence mode="popLayout">
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-12 px-6 rounded-2xl bg-white/5 border border-dashed border-white/10"
          >
            <span className="text-4xl mb-4 opacity-30">🎒</span>
            <p className="text-sm text-white/30 text-center">
              Your inventory is empty.<br/>Visit the Market to buy power-ups!
            </p>
          </motion.div>
        ) : (
          <motion.div 
            layout
            className={cn(
              "grid gap-4",
              horizontal 
                ? "flex overflow-x-auto pb-4 scrollbar-hide" 
                : "grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
            )}
          >
            {items.map(item => (
              <InventoryItemCard
                key={item.id}
                item={item}
                onClick={handleUseItem}
                className={horizontal ? "min-w-[120px]" : ""}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
