"use client"

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ProfileSidebar } from '@/widgets/profile-sidebar'
import { MainGrid } from '@/widgets/main-grid'
import { QuickActions } from '@/widgets/quick-actions'
import { MobileNav, MobileTab } from '@/widgets/mobile-nav'
import { cn } from '@/shared/lib/utils'
import { useDashboardSettingsStore } from '@/features/dashboard-settings'
import { DashboardSettingsMenu } from '@/features/dashboard-settings'
import { Settings } from 'lucide-react'

export function Dashboard() {
  const [activeTab, setActiveTab] = useState<MobileTab>('grid')
  const [isSettingsOpen, setIsSettingsOpen] = useState(false)
  const { showProfile, showQuickActions } = useDashboardSettingsStore()

  return (
    <div className="min-h-screen bg-background relative">
      {/* Floating Settings Trigger (Mobile/Clean Desktop) */}
      <button
        onClick={() => setIsSettingsOpen(true)}
        className="fixed top-6 right-6 z-[60] p-2 bg-card/50 backdrop-blur-md border border-white/5 rounded-full text-muted-foreground hover:text-primary transition-colors shadow-xl"
      >
        <Settings className="w-5 h-5" />
      </button>

      <DashboardSettingsMenu isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      {/* 
        3-Column Layout
        Left (25%): Profile 
        Center (50%): Main Grid 
        Right (25%): Quick Actions 
        On Mobile: Switchable via MobileNav
      */}
      <main className="container mx-auto px-4 py-8 lg:py-12 pb-32 lg:pb-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          
          {/* Dashboard Columns - Desktop always visible, Mobile tab-based */}
          
          {/* Profile Column */}
          <div className={cn(
            "lg:col-span-1",
            activeTab !== 'profile' && "hidden lg:block",
            !showProfile && "lg:hidden"
          )}>
            <AnimatePresence mode="wait">
              {(activeTab === 'profile' || typeof window === 'undefined' || window.innerWidth >= 1024) && showProfile && (
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                >
                  <ProfileSidebar />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Main Content Column */}
          <div className={cn(
            "lg:col-span-2",
            !showProfile && !showQuickActions ? "lg:col-span-4" : 
            !showProfile || !showQuickActions ? "lg:col-span-3" : "lg:col-span-2",
            activeTab === 'profile' || activeTab === 'actions' ? "hidden lg:block" : "block"
          )}>
            <AnimatePresence mode="wait">
              {activeTab === 'grid' && (
                <motion.div
                  key="grid"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                >
                  <MainGrid />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Quick Actions Column */}
          <div className={cn(
            "lg:col-span-1",
            activeTab !== 'actions' && "hidden lg:block",
            !showQuickActions && "lg:hidden"
          )}>
            <AnimatePresence mode="wait">
              {(activeTab === 'actions' || typeof window === 'undefined' || window.innerWidth >= 1024) && showQuickActions && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                >
                  <QuickActions />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

        </div>
      </main>

      {/* Global Mobile Navigation */}
      <MobileNav activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  )
}
