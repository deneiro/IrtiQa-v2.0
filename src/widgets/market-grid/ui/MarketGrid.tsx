'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { GAME_CORE, MarketItem } from '@/shared/config/game-core'
import { BuyItemButton } from '@/features/economy'
import { cn } from '@/shared/lib/utils'

// Note: I will use framer-motion, fixed the import typo if any
import { motion as m } from 'framer-motion'

export const MarketGrid: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'potion' | 'consumable'>('potion')
  
  const items = Object.values(GAME_CORE.MARKET_ITEMS).filter(
    item => item.category === activeTab
  )

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Tabs */}
      <div className="flex bg-white/5 p-1 rounded-xl border border-white/10 w-fit">
        {(['potion', 'consumable'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "px-6 py-2 rounded-lg text-sm font-bold transition-all capitalize",
              activeTab === tab 
                ? "bg-white/10 text-white shadow-lg" 
                : "text-white/40 hover:text-white/80"
            )}
          >
            {tab}s
          </button>
        ))}
      </div>

      {/* Grid */}
      <m.div 
        layout
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        <AnimatePresence mode="popLayout">
          {items.map(item => (
            <m.div
              key={item.key}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="relative flex flex-col p-5 rounded-2xl bg-white/5 border border-white/10 hover:border-white/20 transition-all group overflow-hidden"
            >
              {/* Background Glow */}
              <div className={cn(
                "absolute -top-10 -right-10 w-24 h-24 blur-3xl opacity-10 group-hover:opacity-20 transition-opacity",
                item.category === 'potion' ? "bg-red-500" : "bg-blue-500"
              )} />

              {/* Header */}
              <div className="flex items-start gap-4 mb-4">
                <span className="text-4xl">{item.icon}</span>
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-white group-hover:text-yellow-400 transition-colors">
                    {item.name}
                  </h3>
                  <span className="text-[10px] uppercase tracking-widest text-white/30 font-bold">
                    {item.category}
                  </span>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-white/60 mb-6 flex-grow leading-relaxed">
                {item.description}
              </p>

              {/* Buy Button Container */}
              <div className="mt-auto">
                <BuyItemButton item={item} />
              </div>
            </m.div>
          ))}
        </AnimatePresence>
      </m.div>
    </div>
  )
}
