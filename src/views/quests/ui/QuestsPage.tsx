import React from 'react'
import { CommandBoard } from '@/widgets/quest-command-center'
import { AchievementsList } from '@/widgets/achievements-list'

export function QuestsPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="container mx-auto px-4 py-8 lg:py-12 space-y-12">
        <CommandBoard />
        
        <section className="mt-16">
          <AchievementsList 
            scope="quests" 
            title="Quest Achievements" 
            gridClassName="grid-cols-1 md:grid-cols-2 lg:grid-cols-4"
          />
        </section>
      </main>
    </div>
  )
}
