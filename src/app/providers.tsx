"use client"
import React, { useEffect } from 'react'
import { createClient } from '@/shared/api/supabase'
import { useAuthStore } from '@/entities/user'
import { useStatsStore } from '@/entities/profile/model/statsStore'
import { useProfileStore } from '@/entities/profile'
import { useAttributeStore } from '@/entities/attribute'
import { useAchievementStore } from '@/entities/achievement'
import { AchievementCeremony } from '@/features/achievements/ui/AchievementCeremony'
import { VFXManager } from '@/widgets/vfx-manager'
import { LevelUpEffect } from '@/features/progression'
import { ThemeProvider } from 'next-themes'

export function Providers({ children }: { children: React.ReactNode }) {
  const { setAuth, user } = useAuthStore()
  const { setProfile } = useProfileStore()
  const { setAttributes } = useAttributeStore()
  const { fetchStats } = useStatsStore()
  const { fetchAchievements, fetchUserAchievements } = useAchievementStore()
  const supabase = createClient()

  useEffect(() => {
    // Initial fetch
    supabase.auth.getSession().then(({ data: { session } }) => {
      setAuth(session)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setAuth(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (user) {
      // Hydrate all game stores
      fetchStats(user.id)
      fetchAchievements()
      fetchUserAchievements(user.id)

      // Fetch Profile
      supabase
        .from('profiles')
        .select('*')
        .eq('user_id', user.id)
        .single()
        .then(({ data, error }) => {
          if (data && !error) {
            setProfile(data)
          }
        })

      // Fetch Attributes
      supabase
        .from('attributes')
        .select('*')
        .eq('user_id', user.id)
        .then(({ data, error }) => {
          if (data && !error && data.length > 0) {
            setAttributes(data)
          }
        })
    }
  }, [user])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <VFXManager />
      <LevelUpEffect />
      <AchievementCeremony />
      {children}
    </ThemeProvider>
  )
}
