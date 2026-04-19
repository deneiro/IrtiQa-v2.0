"use client"

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Settings, X, Columns, User, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { ThemeToggle } from './ThemeToggle'
import { useDashboardSettingsStore } from '../model/dashboardSettingsStore'
import { cn } from '@/shared/lib/utils'

interface DashboardSettingsMenuProps {
  isOpen: boolean
  onClose: () => void
}

export function DashboardSettingsMenu({ isOpen, onClose }: DashboardSettingsMenuProps) {
  const { 
    showProfile, 
    showQuickActions, 
    mainGridColumns,
    toggleProfile,
    toggleQuickActions,
    setMainGridColumns
  } = useDashboardSettingsStore()

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-[100]"
          />

          {/* Settings Drawer/Modal */}
          <motion.div
            initial={{ opacity: 0, x: 100, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.95 }}
            className="fixed right-4 top-4 bottom-4 w-full max-w-xs z-[101]"
          >
            <Card className="h-full border-border bg-card/90 backdrop-blur-md shadow-2xl flex flex-col">
              <CardHeader className="flex flex-row items-center justify-between pb-4 border-b border-white/5">
                <CardTitle className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                  <Settings className="w-4 h-4 text-primary" />
                  Grid Settings
                </CardTitle>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full">
                  <X className="w-4 h-4" />
                </Button>
              </CardHeader>
              
              <CardContent className="flex-1 overflow-y-auto pt-6 space-y-8">
                {/* Theme Section */}
                <ThemeToggle />

                {/* Visibility Section */}
                <div className="space-y-4">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Dashboard Modules
                  </span>
                  <div className="space-y-2">
                    <button
                      onClick={toggleProfile}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                        showProfile 
                          ? "bg-white/5 border-primary/20 text-foreground" 
                          : "bg-transparent border-white/5 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <User className={cn("w-4 h-4", showProfile ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-bold">Profile Sidebar</span>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        showProfile ? "bg-primary animate-pulse" : "bg-muted"
                      )} />
                    </button>

                    <button
                      onClick={toggleQuickActions}
                      className={cn(
                        "w-full flex items-center justify-between p-3 rounded-lg border transition-all",
                        showQuickActions 
                          ? "bg-white/5 border-primary/20 text-foreground" 
                          : "bg-transparent border-white/5 text-muted-foreground"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Zap className={cn("w-4 h-4", showQuickActions ? "text-primary" : "text-muted-foreground")} />
                        <span className="text-xs font-bold">Quick Actions</span>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        showQuickActions ? "bg-primary animate-pulse" : "bg-muted"
                      )} />
                    </button>
                  </div>
                </div>

                {/* Grid Density Section */}
                <div className="space-y-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
                    Grid Density
                  </span>
                  <div className="grid grid-cols-3 gap-2">
                    {[2, 3, 4].map((cols) => (
                      <button
                        key={cols}
                        onClick={() => setMainGridColumns(cols as any)}
                        className={cn(
                          "flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all",
                          mainGridColumns === cols 
                            ? "bg-primary/10 border-primary text-primary" 
                            : "bg-white/5 border-white/5 text-muted-foreground hover:border-white/20"
                        )}
                      >
                        <Columns className="w-4 h-4" />
                        <span className="text-[10px] font-bold">{cols} Cols</span>
                      </button>
                    ))}
                  </div>
                </div>
              </CardContent>

              <div className="p-4 border-t border-white/5">
                 <p className="text-[9px] text-center text-muted-foreground/40 font-bold uppercase tracking-widest">
                   Irtiqa v2.0 • System Preferences
                 </p>
              </div>
            </Card>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
