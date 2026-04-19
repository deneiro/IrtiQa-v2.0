"use client"

import React from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Grid, 
  Zap
} from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export type MobileTab = 'profile' | 'grid' | 'actions'

interface MobileNavProps {
  activeTab: MobileTab
  onTabChange: (tab: MobileTab) => void
  className?: string
}

export function MobileNav({ activeTab, onTabChange, className }: MobileNavProps) {
  const tabs = [
    { id: 'profile', icon: User, label: 'Profile' },
    { id: 'grid', icon: Grid, label: 'Grid' },
    { id: 'actions', icon: Zap, label: 'Actions' },
  ] as const

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-[100] px-6 pb-6 pt-2 bg-gradient-to-t from-background via-background/95 to-transparent backdrop-blur-md lg:hidden",
      className
    )}>
      <div className="max-w-md mx-auto h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-around px-2 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id
          
          return (
            <button
              key={tab.id}
              onClick={() => onTabChange(tab.id as MobileTab)}
              className="relative flex flex-col items-center justify-center w-16 h-full transition-all group"
            >
              <div className={cn(
                "p-2 rounded-xl transition-all duration-300",
                isActive ? "bg-primary text-black transform -translate-y-1 shadow-[0_0_20px_rgba(var(--primary),0.4)]" : "text-muted-foreground/60 hover:text-white"
              )}>
                <Icon className="w-6 h-6" />
              </div>
              
              {isActive && (
                <motion.div
                  layoutId="active-tab-glow"
                  className="absolute -bottom-1 w-8 h-1 bg-primary rounded-full shadow-[0_0_10px_#fff]"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              
              <span className={cn(
                "text-[8px] font-black uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity",
                isActive && "opacity-100 text-primary"
              )}>
                {tab.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
