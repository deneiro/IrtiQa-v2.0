'use client'

import React, { useState } from 'react'
import { HabitsList } from '@/widgets/habits-list'
import { Button } from '@/shared/ui/button'
import { Plus, Sparkles } from 'lucide-react'
import { CreateHabitModal } from '@/features/habits/ui/CreateHabitModal'
import { AchievementsList } from '@/widgets/achievements-list'
import { AnimatePresence } from 'framer-motion'

export function HabitsView() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-attribute-health mb-2 uppercase tracking-[0.2em] font-display font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              Daily Discipline
            </div>
            <h1 className="text-4xl md:text-5xl font-display font-black tracking-tight text-foreground uppercase italic underline decoration-attribute-health decoration-4 underline-offset-8">
              Habits <span className="text-muted-foreground/20">/</span> Mastery
            </h1>
          </div>

          <Button 
            size="lg" 
            onClick={() => setIsModalOpen(true)}
            className="bg-attribute-health hover:bg-attribute-health/90 text-white font-display font-bold uppercase tracking-widest gap-2"
          >
            <Plus className="w-5 h-5" />
            New Habit
          </Button>
        </div>

        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h2 className="text-xl font-display font-bold uppercase tracking-wider mb-4 border-l-4 border-attribute-health pl-4">
              Active Routine
            </h2>
            <HabitsList />
          </div>
          
          <div className="mt-16">
            <h2 className="text-xl font-display font-bold uppercase tracking-wider mb-6 border-l-4 border-attribute-money pl-4 text-attribute-money">
              Habit Achievements
            </h2>
            <AchievementsList 
              scope="habits" 
              gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            />
          </div>
          
          <div className="mt-16 p-8 rounded-3xl border-2 border-dashed border-border bg-secondary/20 text-center">
            <h3 className="text-lg font-display font-bold uppercase text-muted-foreground/40">
              Discipline is the bridge between goals and accomplishment.
            </h3>
          </div>
        </div>
      </header>

      <AnimatePresence>
        {isModalOpen && (
          <CreateHabitModal onClose={() => setIsModalOpen(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
