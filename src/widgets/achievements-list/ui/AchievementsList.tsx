"use client"

import React, { useEffect, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAchievementStore, AchievementCard, AchievementScope } from '@/entities/achievement'
import { useProfileStore } from '@/entities/profile'
import { Skeleton } from '@/shared/ui/skeleton'
import { Trophy, Info } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

interface AchievementsListProps {
  scope: AchievementScope | 'all'
  title?: string
  showDescription?: boolean
  className?: string
  gridClassName?: string
}

export function AchievementsList({ 
  scope, 
  title, 
  showDescription = true, 
  className,
  gridClassName
}: AchievementsListProps) {
  const { profile } = useProfileStore()
  const { 
    isLoading, 
    fetchAchievements, 
    fetchUserAchievements, 
    getAchievementsByScope 
  } = useAchievementStore()

  useEffect(() => {
    fetchAchievements()
  }, [fetchAchievements])

  useEffect(() => {
    if (profile?.user_id) {
      fetchUserAchievements(profile.user_id)
    }
  }, [profile?.user_id, fetchUserAchievements])

  const filteredAchievements = useMemo(() => {
    return getAchievementsByScope(scope)
  }, [scope, getAchievementsByScope])

  const unlockedCount = filteredAchievements.filter(a => a.isUnlocked).length
  const totalCount = filteredAchievements.length

  if (isLoading && totalCount === 0) {
    return <AchievementsSkeleton />
  }

  if (totalCount === 0) return null

  return (
    <div className={cn("space-y-4", className)}>
      {(title || showDescription) && (
        <div className="flex items-center justify-between">
          <div>
            {title && (
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                <Trophy className="w-4 h-4 text-amber-400" />
                {title}
              </h3>
            )}
            {showDescription && (
              <p className="text-[10px] text-muted-foreground mt-1">
                Unlocked: {unlockedCount} / {totalCount}
              </p>
            )}
          </div>
          
          <div className="h-1.5 w-24 bg-secondary/30 rounded-full overflow-hidden border border-white/5">
            <motion.div 
              className="h-full bg-attribute-brightness"
              initial={{ width: 0 }}
              animate={{ width: `${(unlockedCount / totalCount) * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </div>
      )}

      <div className={cn(
        "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3",
        gridClassName
      )}>
        <AnimatePresence mode="popLayout">
          {filteredAchievements.map((achievement, index) => (
            <motion.div
              key={achievement.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
            >
              <AchievementCard achievement={achievement} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  )
}

function AchievementsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="h-6 w-32 bg-secondary/30 rounded animate-pulse" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {[1, 2, 3].map(i => (
          <div key={i} className="h-20 bg-secondary/20 rounded-xl animate-pulse" />
        ))}
      </div>
    </div>
  )
}
