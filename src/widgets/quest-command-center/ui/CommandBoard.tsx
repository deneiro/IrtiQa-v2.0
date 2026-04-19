'use client'

import React, { useEffect, useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { motion, AnimatePresence } from 'framer-motion'
import { useQuestStore, QuestCard } from '@/entities/quest'
import { SmartWizardForm } from '@/features/create-smart-quest'
import { TaskCheckbox } from '@/features/task-management'

export function CommandBoard() {
  const { quests, fetchQuests, isLoading } = useQuestStore()
  const [isWizardOpen, setIsWizardOpen] = useState(false)

  useEffect(() => {
    fetchQuests()
  }, [fetchQuests])

  const activeQuests = quests.filter(q => q.status === 'active')
  const completedQuests = quests.filter(q => q.status === 'completed')

  return (
    <div className="space-y-8">
      {/* Header Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-display font-bold">Tactical Command</h2>
          <p className="text-muted-foreground text-sm">Active Expeditions Hub</p>
        </div>
        <Button 
          onClick={() => setIsWizardOpen(true)}
          className="bg-primary text-black hover:bg-primary/90 font-semibold"
        >
          <Plus className="w-5 h-5 mr-2" />
          New Directive
        </Button>
      </div>

      {/* Grid of Active Quests */}
      {isLoading ? (
        <div className="text-center text-muted-foreground py-12 animate-pulse">Syncing uplinks...</div>
      ) : activeQuests.length === 0 ? (
        <div className="text-center py-12 border border-dashed border-border rounded-xl bg-secondary/20 text-muted-foreground">
          No active directives. Awaiting your command.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <AnimatePresence>
            {activeQuests.map((quest) => (
              <motion.div 
                key={quest.id}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <QuestCard quest={quest}>
                  {quest.tasks.map(task => (
                    <TaskCheckbox key={task.id} task={task} questId={quest.id} />
                  ))}
                </QuestCard>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Completed/Archived Section (Optional) */}
      {completedQuests.length > 0 && (
        <div className="pt-8 border-t border-border">
          <h3 className="text-lg font-display font-medium text-muted-foreground mb-4">Ascended Quests</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 opacity-50">
            {completedQuests.map((quest) => (
              <QuestCard key={quest.id} quest={quest}>
                {quest.tasks.map(task => (
                  <TaskCheckbox key={task.id} task={task} questId={quest.id} />
                ))}
              </QuestCard>
            ))}
          </div>
        </div>
      )}

      {/* Wizard Modal Overlay */}
      <AnimatePresence>
        {isWizardOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsWizardOpen(false)}
            />
            <motion.div
              className="relative z-10 w-full max-w-lg"
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
            >
              <SmartWizardForm 
                onComplete={() => setIsWizardOpen(false)} 
                onCancel={() => setIsWizardOpen(false)} 
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  )
}
