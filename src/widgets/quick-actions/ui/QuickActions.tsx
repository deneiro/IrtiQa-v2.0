'use client'

import React, { useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { BookOpen, Clock, Target, Flame, CheckCircle2, AlertTriangle, Skull, Loader2 } from 'lucide-react'
import { useProfileStore } from '@/entities/profile'
import { WriteJournalModal } from '@/features/journal-write'
import { useJournalStore } from '@/entities/journal'
import { cn } from '@/shared/lib/utils'
import { QuickTaskInput } from '@/features/task-management'
import { Timeline } from '@/widgets/timeline'
import { useHabits } from '@/features/habits/model/useHabits'
import { GAME_CORE } from '@/shared/config/game-core'
import { XPGainVFX } from '@/features/progression/ui/XPGainVFX'
import useSound from 'use-sound'

export function QuickActions() {
  const { addXp, addGold, takeDamage } = useProfileStore()
  const { fetchJournals, getJournalByDate } = useJournalStore()
  const { habits, isLoading, checkIn, isCompletedToday } = useHabits()
  const [isJournalModalOpen, setIsJournalModalOpen] = useState(false)
  const [activeReward, setActiveReward] = useState<{ id: string; xp: number; gold: number } | null>(null)
  const [playPop] = useSound('/sounds/pop.mp3', { volume: 0.5 })
  const [playHurt] = useSound('/sounds/hurt.mp3', { volume: 0.5 })

  React.useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  const todayStr = new Date().toISOString().split('T')[0]
  const hasJournalToday = !!getJournalByDate(todayStr)

  const handleHabitCheckIn = useCallback(async (habitId: string, isBad: boolean, xpReward: number, currentStreak: number) => {
    if (isBad) {
      playHurt()
      // Optimistic HP damage: min(10 + streak * 3, 50)
      const damage = Math.min(10 + currentStreak * 3, 50)
      takeDamage(damage)
    } else {
      playPop()
      setActiveReward({ id: habitId, xp: xpReward, gold: 2 })
      // Optimistic XP + Gold
      addXp(xpReward)
      addGold(2)
    }
    await checkIn(habitId)
  }, [checkIn, playPop, playHurt, addXp, addGold, takeDamage])

  // Separate good and bad habits
  const goodHabits = habits.filter(h => h.type === 'good')
  const badHabits = habits.filter(h => h.type === 'bad')

  // Count completed
  const totalHabits = habits.length
  const completedCount = habits.filter(h => isCompletedToday(h.id)).length

  return (
    <div className="flex flex-col space-y-6">
      {/* Habits Checklist Card */}
      <Card className="bg-card/60 backdrop-blur-md border-border overflow-hidden relative">
        <div className="absolute top-0 right-0 p-4 opacity-5">
           <Target className="w-12 h-12" />
        </div>
        <CardHeader className="pb-2">
           <CardTitle className="text-sm font-mono uppercase tracking-[0.3em] text-primary flex items-center justify-between">
             <span>Daily Routines</span>
             <span className="text-xs text-muted-foreground font-normal tracking-normal">
               {completedCount}/{totalHabits}
             </span>
           </CardTitle>
        </CardHeader>
        <CardContent className="space-y-1 pt-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-8 text-muted-foreground">
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              <span className="text-xs font-mono uppercase tracking-wider">Loading...</span>
            </div>
          ) : habits.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-xs font-mono uppercase tracking-wider">
              No habits yet. Create one from the Habits page.
            </div>
          ) : (
            <>
              {/* Good Habits */}
              {goodHabits.length > 0 && (
                <div className="space-y-0.5">
                  {goodHabits.map(habit => {
                    const done = isCompletedToday(habit.id)
                    const primaryAttr = habit.attribute_ids?.[0] || 'health'
                    const attrConfig = (GAME_CORE.ATTRIBUTES as any)[primaryAttr]
                    const accentColor = attrConfig?.color || '#3b82f6'

                    return (
                      <div 
                        key={habit.id}
                        className="relative group"
                      >
                        {/* Inline VFX */}
                        {activeReward?.id === habit.id && (
                          <XPGainVFX
                            rewards={{ xp: activeReward.xp, gold: activeReward.gold }}
                            onComplete={() => setActiveReward(null)}
                          />
                        )}

                        <button
                          onClick={() => !done && handleHabitCheckIn(habit.id, false, habit.xp_reward, habit.current_streak)}
                          disabled={done}
                          className={cn(
                            "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left",
                            done 
                              ? "bg-green-500/10 opacity-60" 
                              : "hover:bg-secondary/80 active:scale-[0.98]"
                          )}
                        >
                          {/* Checkbox */}
                          <div
                            className={cn(
                              "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all duration-300",
                              done
                                ? "bg-green-500 border-green-500"
                                : "border-border/40 group-hover:border-primary/40"
                            )}
                            style={{
                              borderColor: !done ? accentColor + '55' : undefined,
                            }}
                          >
                            {done && <CheckCircle2 className="w-3.5 h-3.5 text-white" />}
                          </div>

                          {/* Title */}
                          <span className={cn(
                            "flex-1 text-sm font-medium truncate transition-all",
                            done && "line-through text-muted-foreground"
                          )}>
                            {habit.title}
                          </span>

                          {/* Streak & XP Hint */}
                          <div className="flex items-center gap-2 shrink-0">
                            {habit.current_streak > 0 && (
                              <span className="flex items-center text-orange-500 text-[10px] font-bold">
                                <Flame className="w-3 h-3 mr-0.5 fill-orange-500/20" />
                                {habit.current_streak}
                              </span>
                            )}
                            {!done && (
                              <span className="text-[10px] text-muted-foreground/60 font-mono">
                                +{habit.xp_reward}xp
                              </span>
                            )}
                          </div>

                          {/* Attribute color dot */}
                          <div className="flex gap-0.5 shrink-0">
                            {habit.attribute_ids?.slice(0, 3).map(attr => (
                              <div
                                key={attr}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: (GAME_CORE.ATTRIBUTES as any)[attr]?.color }}
                              />
                            ))}
                          </div>
                        </button>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* Bad Habits Divider */}
              {badHabits.length > 0 && goodHabits.length > 0 && (
                <div className="flex items-center gap-2 py-2 px-3">
                  <div className="h-px flex-1 bg-red-500/10" />
                  <span className="text-[9px] font-mono uppercase tracking-widest text-red-500/40">Resist</span>
                  <div className="h-px flex-1 bg-red-500/10" />
                </div>
              )}

              {/* Bad Habits */}
              {badHabits.map(habit => {
                const relapsedToday = isCompletedToday(habit.id)

                return (
                  <button
                    key={habit.id}
                    onClick={() => !relapsedToday && handleHabitCheckIn(habit.id, true, habit.xp_reward, habit.current_streak)}
                    disabled={relapsedToday}
                    className={cn(
                      "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-left group",
                      relapsedToday
                        ? "bg-red-500/10 opacity-60"
                        : "hover:bg-red-500/10 active:scale-[0.98]"
                    )}
                  >
                    {/* Warning icon */}
                    <div className={cn(
                      "w-5 h-5 rounded-md border-2 flex items-center justify-center shrink-0 transition-all",
                      relapsedToday
                        ? "bg-red-500 border-red-500"
                        : "border-red-500/10 group-hover:border-red-500/30"
                    )}>
                      {relapsedToday ? (
                        <Skull className="w-3 h-3 text-white" />
                      ) : (
                        <AlertTriangle className="w-3 h-3 text-red-500/30 group-hover:text-red-500/60" />
                      )}
                    </div>

                    {/* Title */}
                    <span className={cn(
                      "flex-1 text-sm font-medium truncate",
                      relapsedToday ? "line-through text-red-500/40" : "text-red-400/80"
                    )}>
                      {habit.title}
                    </span>

                    {/* Days Clean */}
                    {!relapsedToday && habit.current_streak > 0 && (
                      <span className="text-[10px] text-green-500/60 font-mono shrink-0">
                        {habit.current_streak}d clean
                      </span>
                    )}
                    {relapsedToday && (
                      <span className="text-[10px] text-red-500/40 font-mono shrink-0">
                        relapsed
                      </span>
                    )}
                  </button>
                )
              })}
            </>
          )}
        </CardContent>
      </Card>

      {/* Journal & Quick Task */}
      <Card className="bg-card/60 backdrop-blur-md border-border overflow-hidden relative">
        <CardHeader className="pb-3">
           <CardTitle className="text-sm font-mono uppercase tracking-[0.3em] text-primary">Strategic Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
            <Button 
              variant="outline"
              className={cn(
                "w-full flex items-center justify-center gap-2 border-border h-14 transition-all",
                hasJournalToday 
                  ? "bg-green-500/10 text-green-600 border-green-500/20 grayscale pointer-events-none" 
                  : "bg-secondary/50 hover:bg-secondary text-foreground"
              )}
              onClick={() => !hasJournalToday && setIsJournalModalOpen(true)}
            >
               <BookOpen className={cn("w-5 h-5", hasJournalToday ? "text-green-500" : "text-blue-400")} />
               <span className="text-xs uppercase font-mono">{hasJournalToday ? 'Journal Synced' : 'Write Intel Log'}</span>
            </Button>

           <div className="pt-0">
              <QuickTaskInput />
           </div>

           <WriteJournalModal 
             isOpen={isJournalModalOpen} 
             onClose={() => setIsJournalModalOpen(false)} 
           />
        </CardContent>
      </Card>

      {/* Timeline */}
      <Card className="bg-card/60 backdrop-blur-md border-border">
        <CardHeader className="pb-4">
           <CardTitle className="text-sm font-mono uppercase tracking-[0.3em] text-muted-foreground flex items-center gap-2">
             <Clock className="w-4 h-4" />
             Tactical Timeline
           </CardTitle>
        </CardHeader>
        <CardContent>
           <Timeline />
        </CardContent>
      </Card>
    </div>
  )
}
