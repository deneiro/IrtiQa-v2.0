'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import useSound from 'use-sound'
import { Database } from '@/shared/types/database.types'
import { useQuestStore } from '@/entities/quest'
import { Check } from 'lucide-react'
import { XpPopup } from '@/features/progression'

type Task = Database['public']['Tables']['tasks']['Row']

interface TaskCheckboxProps {
  task: Task
  questId?: string | null
}

export function TaskCheckbox({ task, questId }: TaskCheckboxProps) {
  const { completeTask } = useQuestStore()
  const [playPop] = useSound('/sounds/pop.mp3', { volume: 0.5 }) 
  const [xpPopup, setXpPopup] = useState<{ x: number, y: number } | null>(null)

  const isCompleted = task.status === 'completed'

  const handleComplete = async (e: React.MouseEvent) => {
    e.stopPropagation() // prevent quest card expansion
    if (isCompleted) return
    
    playPop()
    setXpPopup({ x: e.clientX, y: e.clientY })
    
    await completeTask(task.id, questId)
    
    // Hide popup after 1s
    setTimeout(() => {
      setXpPopup(null)
    }, 1000)
  }

  return (
    <div 
      className={`group flex items-center gap-3 p-3 rounded-lg border transition-all duration-300 cursor-pointer relative
        ${isCompleted ? 'bg-white/5 border-white/5 text-muted-foreground' : 'bg-black/60 border-white/10 hover:border-primary/50 text-foreground'}
      `}
      onClick={handleComplete}
    >
      {xpPopup && task.xp_reward && (
        <XpPopup amount={task.xp_reward} isVisible={true} x={xpPopup.x} y={xpPopup.y} />
      )}
      
      <div 
        className={`w-5 h-5 rounded flex items-center justify-center transition-colors border
          ${isCompleted ? 'bg-primary border-primary text-black' : 'border-white/30 group-hover:border-primary/50'}
        `}
      >
        <motion.div
          initial={false}
          animate={{ scale: isCompleted ? 1 : 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <Check className="w-3.5 h-3.5" />
        </motion.div>
      </div>
      
      <span className={`text-sm tracking-wide ${isCompleted ? 'line-through opacity-50' : ''}`}>
        {task.title}
      </span>
      
      {!isCompleted && task.xp_reward && (
        <span className="ml-auto text-xs font-mono text-primary/70 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
          +{task.xp_reward} XP
        </span>
      )}
    </div>
  )
}
