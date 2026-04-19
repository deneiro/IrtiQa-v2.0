"use client"

import React, { useState } from 'react'
import { JournalArchive } from '@/features/journal-archive'
import { WriteJournalModal } from '@/features/journal-write'
import { AchievementsList } from '@/widgets/achievements-list'
import { Button } from '@/shared/ui/button'
import { BookOpen, Sparkles, Trophy, Check } from 'lucide-react'
import { motion } from 'framer-motion'
import { useJournalStore } from '@/entities/journal'
import { useEffect } from 'react'
import { cn } from '@/shared/lib/utils'

export function JournalView() {
  const [isModalOpen, setIsModalOpen] = useState(false)
  const { journals, fetchJournals, getJournalByDate } = useJournalStore()

  useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  const todayStr = new Date().toISOString().split('T')[0]
  const hasJournalToday = !!getJournalByDate(todayStr)

  return (
    <div className="min-h-screen bg-background pb-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-attribute-spirituality/5 py-12 md:py-20 mb-8">
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-3 text-attribute-spirituality font-bold uppercase tracking-widest text-sm mb-4"
            >
              <div className="p-2 bg-attribute-spirituality/10 rounded-lg">
                <BookOpen className="w-5 h-5" />
              </div>
              Spiritual Path
            </motion.div>
            
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl md:text-6xl font-display font-black mb-6"
            >
              Daily Reflection <span className="text-attribute-spirituality">Archive</span>
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-xl text-muted-foreground mb-8 max-w-2xl leading-relaxed"
            >
              Revisit your journey, track your state of mind, and unlock patterns that guide your growth. Every entry is a step towards self-mastery.
            </motion.p>
            
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="flex flex-wrap gap-4"
            >
              <Button 
                size="lg" 
                onClick={() => !hasJournalToday && setIsModalOpen(true)}
                disabled={hasJournalToday}
                className={cn(
                  "gap-2 h-14 px-8 text-lg rounded-xl shadow-lg transition-all",
                  hasJournalToday
                    ? "bg-green-600/20 text-green-600 border border-green-600/50 hover:bg-green-600/30 shadow-none"
                    : "bg-attribute-spirituality hover:bg-attribute-spirituality/90 text-white shadow-attribute-spirituality/20"
                )}
              >
                {hasJournalToday ? (
                  <>
                    <Check className="w-5 h-5" /> Today's Journal Complete
                  </>
                ) : (
                  <>
                    <Sparkles className="w-5 h-5" /> Write Today's Entry
                  </>
                )}
              </Button>
              
              <div className="flex items-center gap-6 px-6 py-3 bg-card border rounded-xl">
                 <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-bold uppercase">Total Entries</span>
                    <span className="text-2xl font-black">{journals.length}</span>
                 </div>
                 <div className="w-px h-8 bg-border" />
                 <div className="flex flex-col">
                    <span className="text-xs text-muted-foreground font-bold uppercase">XP Earned</span>
                    <span className="text-2xl font-black text-attribute-spirituality">{journals.length * 50}</span>
                 </div>
              </div>
            </motion.div>
          </div>
        </div>
        
        {/* Background Decorative Elements */}
        <div className="absolute top-0 right-0 w-1/3 h-full bg-gradient-to-l from-attribute-spirituality/10 to-transparent pointer-events-none" />
        <motion.div 
          animate={{ 
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute -top-20 -right-20 w-80 h-80 rounded-full bg-attribute-spirituality/5 blur-3xl" 
        />
      </section>

      {/* Main Content */}
      <div className="container mx-auto px-4">
        <JournalArchive />
      </div>

      <div className="container mx-auto px-4 mt-20">
        <h2 className="text-xl font-display font-black uppercase tracking-widest text-attribute-spirituality mb-8 flex items-center gap-3">
          <Trophy className="w-6 h-6" />
          Reflection Achievements
        </h2>
        <AchievementsList 
          scope="journal" 
          gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        />
      </div>

      {/* Write Journal Modal */}
      <WriteJournalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  )
}
