'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { GAME_CORE } from '@/shared/config/game-core'
import { Database } from '@/shared/types/database.types'
import { cn } from '@/shared/lib/utils'

type InventoryRow = Database['public']['Tables']['inventory']['Row']

interface InventoryItemCardProps {
  item: InventoryRow
  onClick?: (item: InventoryRow) => void
  disabled?: boolean
  className?: string
}

export const InventoryItemCard: React.FC<InventoryItemCardProps> = ({ 
  item, 
  onClick, 
  disabled,
  className 
}) => {
  const itemData = GAME_CORE.getItemByKey(item.item_key)
  
  if (!itemData) return null

  return (
    <motion.div
      whileHover={!disabled ? { y: -4 } : {}}
      className={cn(
        "relative flex flex-col items-center justify-center p-5 rounded-[2rem] bg-black/40 border border-white/5 group transition-all duration-500 overflow-hidden",
        disabled && "opacity-50 cursor-not-allowed",
        item.item_category === 'potion' ? "hover:border-red-500/30 shadow-[0_0_20px_rgba(239,68,68,0)] hover:shadow-[0_0_20px_rgba(239,68,68,0.1)]" : "hover:border-indigo-500/30 shadow-[0_0_20px_rgba(99,102,241,0)] hover:shadow-[0_0_20px_rgba(99,102,241,0.1)]",
        className
      )}
    >
      {/* Dynamic Background Glow */}
      <div 
        className={cn(
          "absolute -inset-1 opacity-0 group-hover:opacity-20 blur-2xl transition-opacity duration-700",
          item.item_category === 'potion' ? "bg-red-500" : "bg-indigo-500"
        )} 
      />
      
      {/* Icon Area with Float Animation */}
      <motion.div 
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="text-5xl mb-4 z-10 drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]"
      >
        {itemData.icon}
      </motion.div>

      {/* Item info */}
      <div className="text-center z-10 space-y-1">
        <h4 className="text-xs font-bold text-white/90 uppercase tracking-widest leading-tight">
          {itemData.name}
        </h4>
        <div className={cn(
          "text-[9px] uppercase tracking-tighter font-black opacity-40",
          item.item_category === 'potion' ? "text-red-400" : "text-indigo-400"
        )}>
          {item.item_category}
        </div>
      </div>
      
      {/* Quantity badge */}
      <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-white/10 border border-white/10 text-[9px] font-black text-white/60 z-20 backdrop-blur-md">
        x{item.quantity}
      </div>

      {/* Action Overlay */}
      <div className="absolute inset-0 z-30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/60 backdrop-blur-[2px]">
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (!disabled) onClick?.(item);
          }}
          className={cn(
            "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transform translate-y-4 group-hover:translate-y-0 transition-all duration-300 hover:scale-110",
            item.item_category === 'potion' ? "bg-red-500 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)]" : "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
          )}
        >
          Use Item
        </button>
      </div>
    </motion.div>
  )
}
