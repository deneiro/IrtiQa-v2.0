'use client'

import React, { useEffect } from 'react'
import { motion } from 'framer-motion'
import { MarketGrid } from '@/widgets/market-grid'
import { InventoryList } from '@/widgets/inventory-list'
import { useProfileStore } from '@/entities/profile'
import { useInventoryStore } from '@/entities/inventory'
import { cn } from '@/shared/lib/utils'

export const MarketView: React.FC = () => {
  const { profile } = useProfileStore()
  const { fetchInventory } = useInventoryStore()

  useEffect(() => {
    if (profile?.user_id) {
      fetchInventory(profile.user_id)
    }
  }, [profile?.user_id, fetchInventory])

  return (
    <div className="min-h-screen bg-[#09090b] text-white p-6 lg:p-12">
      {/* Header section */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div>
          <motion.h1 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-4xl lg:text-5xl font-display font-bold tracking-tight mb-2"
          >
            Black Market
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="text-white/40 max-w-lg"
          >
            Exchange your hard-earned gold for artifacts, potions, and scrolls that defy the laws of the system.
          </motion.p>
        </div>

        {/* Gold Summary Card */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-yellow-500/10 border border-yellow-500/20 p-6 rounded-3xl flex items-center gap-6"
        >
          <div className="text-4xl">🪙</div>
          <div>
            <div className="text-[10px] uppercase tracking-widest font-bold text-yellow-500/50">Current Gold</div>
            <div className="text-3xl font-display font-bold text-yellow-500">
              {profile?.gold ?? 0}
            </div>
          </div>
        </motion.div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-12">
        {/* Left/Main Column: Market Grid */}
        <div className="lg:col-span-2">
          <div className="flex items-center gap-3 mb-8">
            <h2 className="text-xl font-bold">Offerings</h2>
            <div className="h-[1px] flex-grow bg-white/10" />
          </div>
          <MarketGrid />
        </div>

        {/* Right Column: Inventory */}
        <div className="lg:col-span-1">
          <div className="sticky top-12">
            <div className="flex items-center gap-3 mb-8">
              <h2 className="text-xl font-bold">Your Backpack</h2>
              <div className="h-[1px] flex-grow bg-white/10" />
            </div>
            
            <div className="bg-white/5 border border-white/10 rounded-3xl p-6">
              <InventoryList />
            </div>

            {/* Quick Tips */}
            <div className="mt-8 p-6 rounded-2xl bg-indigo-500/5 border border-indigo-500/10 text-xs text-indigo-300/60 leading-relaxed italic">
              "Consume potions to restore HP. Use scrolls to bend reality. Remember: artifacts once used are lost to the ether."
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
