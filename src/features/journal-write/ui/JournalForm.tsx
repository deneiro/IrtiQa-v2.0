"use client"

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/shared/ui/card'
import { Button } from '@/shared/ui/button'
import { Slider } from '@/shared/ui/slider'
import { Textarea } from '@/shared/ui/textarea'
import { 
  Smile, 
  Frown, 
  Flame, 
  Wind, 
  Meh, 
  Zap, 
  Moon, 
  Heart,
  ChevronRight,
  ChevronLeft,
  Check
} from 'lucide-react'
import { MoodType, JournalFormData, JournalEntry } from '@/entities/journal'
import { useJournalStore } from '@/entities/journal'
import { useAuthStore } from '@/entities/user'
import { useHabitStore } from '@/entities/habit'
import { useQuestStore } from '@/entities/quest'
import { useProfileStore } from '@/entities/profile'
import { useVFXStore } from '@/shared/model/vfx-store'
import { cn } from '@/shared/lib/utils'
import { motion, AnimatePresence } from 'framer-motion'

const MOODS: { type: MoodType; icon: React.ElementType; label: string; color: string }[] = [
  { type: 'happy', icon: Smile, label: 'Happy', color: 'text-yellow-400 bg-yellow-400/10' },
  { type: 'grateful', icon: Heart, label: 'Grateful', color: 'text-pink-400 bg-pink-400/10' },
  { type: 'excited', icon: Zap, label: 'Excited', color: 'text-orange-400 bg-orange-400/10' },
  { type: 'neutral', icon: Meh, label: 'Neutral', color: 'text-gray-400 bg-gray-400/10' },
  { type: 'tired', icon: Moon, label: 'Tired', color: 'text-indigo-400 bg-indigo-400/10' },
  { type: 'anxious', icon: Wind, label: 'Anxious', color: 'text-purple-400 bg-purple-400/10' },
  { type: 'sad', icon: Frown, label: 'Sad', color: 'text-blue-400 bg-blue-400/10' },
  { type: 'angry', icon: Flame, label: 'Angry', color: 'text-red-400 bg-red-400/10' },
]

const QUESTIONS = [
  "What were your top 3 wins today?",
  "What did you learn or realize?",
  "What could have been better?",
  "What is one thing you are grateful for?",
  "What is your primary focus for tomorrow?"
]

interface JournalFormProps {
  onSuccess?: () => void
  initialData?: JournalEntry
}

export function JournalForm({ onSuccess, initialData }: JournalFormProps) {
  const [step, setStep] = useState(0)
  const [formData, setFormData] = useState<JournalFormData>({
    mood: (initialData?.mood as MoodType) || null,
    stress_level: initialData?.stress_level || 5,
    answers: (initialData?.answers as string[]) || ["", "", "", "", ""]
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { addEffect } = useVFXStore()

  const { user } = useAuthStore()
  const { addJournal, updateJournal } = useJournalStore()
  const { habitLogs } = useHabitStore()
  const { quests } = useQuestStore()
  const { addXp } = useProfileStore()

  const handleMoodSelect = (mood: MoodType) => {
    setFormData(prev => ({ ...prev, mood }))
    setStep(1)
  }

  const handleAnswerChange = (index: number, val: string) => {
    const newAnswers = [...formData.answers]
    newAnswers[index] = val
    setFormData(prev => ({ ...prev, answers: newAnswers }))
  }

  const handleSubmit = async (e: React.MouseEvent) => {
    if (!user || isSubmitting) return

    setIsSubmitting(true)
    
    // 1. Calculate Productivity Snapshot
    const todayStr = new Date().toISOString().split('T')[0]
    const habitsDone = habitLogs.filter(log => log.logged_at === todayStr && log.completed).length
    
    let tasksDone = 0
    quests.forEach(q => {
      tasksDone += q.tasks.filter(t => t.status === 'completed' && t.completed_at?.startsWith(todayStr)).length
    })

    const productivityStats = initialData?.productivity_stats || {
      habits_done: habitsDone,
      tasks_done: tasksDone,
      xp_earned: 50 // Fixed reward for journal
    }

    let success = false

    // 2. Save to DB
    if (initialData) {
      await updateJournal(initialData.id, {
        mood: formData.mood,
        stress_level: formData.stress_level,
        answers: formData.answers
      })
      success = true
    } else {
      const result = await addJournal({
        user_id: user.id,
        mood: formData.mood,
        stress_level: formData.stress_level,
        answers: formData.answers,
        productivity_stats: productivityStats,
        xp_earned: 50,
        entry_date: todayStr
      })
      success = !!result
    }

    if (success) {
      if (!initialData) {
        // 3. Award XP and trigger Global VFX (only for new journals)
        addXp(50)
        
        const x = e.clientX
        const y = e.clientY
        addEffect('journal_complete', 50, x, y)
      }
      
      setTimeout(() => {
        onSuccess?.()
      }, initialData ? 300 : 1500)
    } else {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="relative">
      <AnimatePresence mode="wait">

        {step === 0 && (
          <motion.div
            key="mood-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold">How are you feeling today?</h2>
              <p className="text-muted-foreground">Select the mood that best describes your day.</p>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {MOODS.map((m) => {
                const Icon = m.icon
                return (
                  <button
                    key={m.type}
                    onClick={() => handleMoodSelect(m.type)}
                    className={cn(
                      "flex flex-col items-center justify-center p-4 rounded-xl border transition-all hover:scale-105 active:scale-95 group",
                      formData.mood === m.type ? "border-primary bg-primary/5 shadow-lg" : "border-border bg-card"
                    )}
                  >
                    <div className={cn("p-3 rounded-full mb-2 transition-colors", m.color)}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-sm font-semibold">{m.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {step === 1 && (
          <motion.div
            key="stress-step"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-8"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-display font-bold">Stress Level Check</h2>
              <p className="text-muted-foreground">Where would you place your stress level today?</p>
            </div>
            
            <div className="space-y-6 px-4">
              <div className="flex justify-between text-xs font-bold text-muted-foreground uppercase tracking-wider">
                <span>Minimal</span>
                <span>Maximum</span>
              </div>
              <Slider 
                value={formData.stress_level} 
                onChange={(v) => setFormData(prev => ({ ...prev, stress_level: v }))}
                min={1}
                max={10}
              />
              <div className="text-center">
                <span className={cn(
                  "text-4xl font-display font-black",
                  formData.stress_level > 7 ? "text-red-500" : formData.stress_level < 4 ? "text-green-500" : "text-primary"
                )}>
                  {formData.stress_level}
                </span>
                <span className="text-muted-foreground ml-2 font-bold">/ 10</span>
              </div>
            </div>

            <div className="flex justify-between">
              <Button variant="ghost" onClick={() => setStep(0)} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              <Button onClick={() => setStep(2)} className="gap-2 bg-attribute-spirituality hover:bg-attribute-spirituality/90 text-white">
                Reflections <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}

        {step >= 2 && step < 7 && (
          <motion.div
            key={`question-${step - 2}`}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <div className="flex justify-between items-center mb-4">
              <span className="text-xs font-bold text-attribute-spirituality uppercase tracking-widest">
                Question {step - 1} of 5
              </span>
              <div className="flex gap-1">
                {[...Array(5)].map((_, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-1 w-6 rounded-full transition-colors",
                      i <= step - 2 ? "bg-attribute-spirituality" : "bg-muted"
                    )} 
                  />
                ))}
              </div>
            </div>

            <h2 className="text-2xl font-display font-bold">{QUESTIONS[step - 2]}</h2>
            
            <Textarea
              placeholder="Your reflection..."
              className="text-lg py-4 min-h-[150px] focus:ring-attribute-spirituality focus:border-attribute-spirituality"
              value={formData.answers[step - 2]}
              onChange={(e) => handleAnswerChange(step - 2, e.target.value)}
              autoFocus
            />

            <div className="flex justify-between pt-4">
              <Button variant="ghost" onClick={() => setStep(step - 1)} className="gap-2">
                <ChevronLeft className="w-4 h-4" /> Back
              </Button>
              {step < 6 ? (
                <Button 
                  onClick={() => setStep(step + 1)} 
                  disabled={!formData.answers[step - 2].trim()}
                  className="gap-2 bg-attribute-spirituality hover:bg-attribute-spirituality/90 text-white"
                >
                  Next <ChevronRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit}
                  disabled={isSubmitting || !formData.answers[step - 2].trim()}
                  className="gap-2 bg-green-600 hover:bg-green-700 text-white"
                >
                  {isSubmitting ? "Saving..." : "Seal Journal"} <Check className="w-4 h-4" />
                </Button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
