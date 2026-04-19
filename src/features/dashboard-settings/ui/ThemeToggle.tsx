"use client"

import React, { useEffect, useState } from 'react'
import { useTheme } from 'next-themes'
import { motion } from 'framer-motion'
import { Sun, Moon, Laptop } from 'lucide-react'
import { cn } from '@/shared/lib/utils'

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="h-9 w-24 bg-muted rounded-full animate-pulse" />
    )
  }

  const options = [
    { value: 'light', icon: Sun, label: 'Light' },
    { value: 'dark', icon: Moon, label: 'Dark' },
    { value: 'system', icon: Laptop, label: 'System' },
  ]

  return (
    <div className="flex flex-col space-y-3">
      <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/60">
        Theme Appearance
      </span>
      <div className="grid grid-cols-3 gap-2 p-1 bg-secondary/30 rounded-lg border border-white/5">
        {options.map((option) => {
          const Icon = option.icon
          const isActive = theme === option.value

          return (
            <button
              key={option.value}
              onClick={() => setTheme(option.value)}
              className={cn(
                "relative flex flex-col items-center justify-center py-2 px-1 rounded-md transition-all duration-300",
                isActive 
                  ? "bg-background shadow-lg border border-white/10 text-primary" 
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="theme-active-bg"
                  className="absolute inset-0 bg-background rounded-md -z-10"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon className={cn(
                "w-4 h-4 mb-1",
                isActive && "text-primary"
              )} />
              <span className="text-[8px] font-bold uppercase tracking-tighter">
                {option.label}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
