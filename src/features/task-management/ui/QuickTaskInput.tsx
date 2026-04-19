'use client'

import React, { useState } from 'react'
import { Plus } from 'lucide-react'
import { useQuestStore } from '@/entities/quest'
import { motion } from 'framer-motion'
import useSound from 'use-sound'

export function QuickTaskInput() {
  const [title, setTitle] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const { createIndependentTask } = useQuestStore()
  const [playPop] = useSound('/sounds/pop.mp3', { volume: 0.5 })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim()) return

    try {
      await createIndependentTask({
        title: title.trim(),
        status: 'pending',
        xp_reward: 10,
        gold_reward: 2,
      })
      setTitle('')
      playPop()
    } catch (err) {
      console.error('Failed to create independent task:', err)
    }
  }

  return (
    <motion.form 
      onSubmit={handleSubmit}
      animate={{ 
        scale: isFocused ? 1.02 : 1,
        borderColor: isFocused ? 'hsl(var(--primary) / 0.5)' : 'hsl(var(--border) / 0.2)'
      }}
      className="relative flex items-center bg-secondary/40 backdrop-blur-sm border rounded-xl overflow-hidden transition-all duration-300"
    >
      <div className="pl-4 pr-2 text-muted-foreground/50">
        <Plus className="w-4 h-4" />
      </div>
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        placeholder="Add tactical objective..."
        className="flex-1 bg-transparent py-3 text-sm text-foreground placeholder:text-muted-foreground/30 focus:outline-none font-sans"
      />
      {title.trim().length > 0 && (
        <motion.button
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          type="submit"
          className="mr-2 px-3 py-1 bg-primary/10 text-primary text-[10px] font-mono uppercase tracking-widest rounded-md border border-primary/20 hover:bg-primary/20 transition-all"
        >
          Deploy
        </motion.button>
      )}
    </motion.form>
  )
}
