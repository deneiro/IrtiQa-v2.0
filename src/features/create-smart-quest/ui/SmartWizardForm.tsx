'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import useSound from 'use-sound'
import { 
  ChevronRight, 
  ChevronLeft, 
  Plus, 
  Trash2, 
  Crosshair, 
  Sparkles, 
  Coins, 
  CalendarDays, 
  ClipboardList,
  Target,
  FileText,
  ShieldCheck,
  TrendingUp,
  Clock
} from 'lucide-react'

import { useQuestStore } from '@/entities/quest'
import { useVFXStore } from '@/shared/model/vfx-store'
import { Database } from '@/shared/types/database.types'
import { GAME_CORE } from '@/shared/config/game-core'
import { Button } from '@/shared/ui/button'
import { 
  calculateDeadline, 
  generateSmartMarkdown, 
  SmartAnswers, 
  TimeframeOption 
} from '../lib/smartTransformers'

type AttributeType = Database['public']['Enums']['attribute_type']

interface SmartWizardFormProps {
  onComplete: () => void
  onCancel: () => void
}

export function SmartWizardForm({ onComplete, onCancel }: SmartWizardFormProps) {
  const { createQuest } = useQuestStore()
  const [step, setStep] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const { addEffect } = useVFXStore()
  const [playPuff] = useSound('/sounds/puff.mp3', { volume: 0.5 }) 
  const [playLevelUp] = useSound('/sounds/level-up.mp3', { volume: 0.4 })
  
  // Basic Info
  const [title, setTitle] = useState('')
  const [selectedAttributes, setSelectedAttributes] = useState<AttributeType[]>(['development'])
  const [xpReward, setXpReward] = useState(500)
  const [goldReward, setGoldReward] = useState(100)
  
  // S.M.A.R.T. Answers
  const [smart, setSmart] = useState<SmartAnswers>({
    specific: '',
    measurable: '',
    achievable: '',
    relevant: '',
    timebound: '1_month',
  })
  
  // Subtasks
  const [tasks, setTasks] = useState<{title: string}[]>([{title: ''}])

  const handleNext = () => setStep(s => Math.min(s + 1, 7))
  const handlePrev = () => setStep(s => Math.max(s - 1, 0))

  const toggleAttribute = (attr: AttributeType) => {
    if (selectedAttributes.includes(attr)) {
      setSelectedAttributes(selectedAttributes.filter(a => a !== attr))
    } else if (selectedAttributes.length < 3) {
      setSelectedAttributes([...selectedAttributes, attr])
    }
  }

  const handleSave = async (e: React.MouseEvent) => {
    setIsLoading(true)
    setErrorMsg(null)
    
    // Trigger global VFX first for tactical feel
    const x = e.clientX
    const y = e.clientY
    addEffect('quest_deploy', 0, x, y)
    
    playLevelUp() 
    
    const deadline = calculateDeadline(smart.timebound as TimeframeOption)
    const resources = generateSmartMarkdown(smart)
    
    const validTasks = tasks.filter(t => t.title.trim().length > 0).map(t => ({
      title: t.title,
      status: 'pending' as const,
      xp_reward: 25, 
      gold_reward: 5,
    }))

    const questData = {
      title,
      attribute_ids: selectedAttributes,
      gold_reward: goldReward,
      xp_reward: xpReward,
      deadline,
      resources,
      status: 'active' as const,
    }

    try {
      await createQuest(questData as any, validTasks as any)
      setIsLoading(false)
      onComplete()
    } catch (err: any) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to assimilate quest')
      setIsLoading(false)
    }
  }

  const steps = [
    {
      title: 'Initiate Directive',
      icon: <Crosshair className="w-5 h-5 text-primary" />,
      guidance: "Define the core identity of this mission. Multi-attribute alignment yields balanced growth.",
      content: (
        <div className="space-y-6">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground">Mission Title</label>
            <input 
              className="w-full bg-secondary/40 border border-border rounded-xl p-4 text-foreground text-lg font-display placeholder:text-muted-foreground/30 focus:outline-none focus:border-primary/50 transition-all font-bold"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="e.g. MASTER QUANTUM FINANCE" 
              autoFocus
            />
          </div>
          <div className="space-y-3">
             <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex justify-between">
                <span>Synchronized Attributes</span>
                <span className={selectedAttributes.length === 3 ? 'text-primary' : ''}>{selectedAttributes.length}/3</span>
             </label>
             <div className="grid grid-cols-4 gap-2">
                {Object.entries(GAME_CORE.ATTRIBUTES).map(([key, attr]) => {
                   const isSelected = selectedAttributes.includes(key as AttributeType)
                   return (
                     <button
                       key={key}
                       type="button"
                       onClick={() => toggleAttribute(key as AttributeType)}
                       className={`flex flex-col items-center gap-1.5 p-2 rounded-lg border transition-all duration-300
                         ${isSelected ? 'bg-primary/20 border-primary text-primary' : 'bg-secondary/40 border-border grayscale opacity-50 hover:grayscale-0 hover:opacity-100'}`}
                     >
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: attr.color }} />
                       <span className="text-[9px] font-mono uppercase truncate w-full text-center">{attr.name}</span>
                     </button>
                   )
                })}
             </div>
          </div>
        </div>
      )
    },
    {
      title: 'XP Calibration',
      icon: <Sparkles className="w-5 h-5 text-blue-400" />,
      guidance: "Balance the rewards. Rare missions yield high XP but demand extreme discipline.",
      content: (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
               <Sparkles className="w-3 h-3 text-blue-400" /> XP REWARD
            </label>
            <input 
              type="number"
              className="w-full bg-secondary/40 border border-border rounded-xl p-4 text-foreground text-2xl font-mono focus:outline-none focus:border-blue-500/50"
              value={xpReward} onChange={e => setXpReward(Number(e.target.value))} min={0} 
            />
          </div>
          <div className="space-y-2">
            <label className="text-[10px] font-mono uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
               <Coins className="w-3 h-3 text-yellow-500" /> GOLD BOUNTY
            </label>
            <input 
              type="number"
              className="w-full bg-secondary/40 border border-border rounded-xl p-4 text-foreground text-2xl font-mono focus:outline-none focus:border-yellow-500/50"
              value={goldReward} onChange={e => setGoldReward(Number(e.target.value))} min={0} 
            />
          </div>
        </div>
      )
    },
    {
      title: 'S - Specific',
      icon: <Target className="w-5 h-5 text-primary" />,
      guidance: "Tactical Clarity: What is the exact visual end-state of this mission? Avoid vague directives.",
      content: (
        <div className="space-y-2">
          <textarea 
            rows={5}
            className="w-full bg-secondary/40 border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-primary/40 transition-colors leading-relaxed font-medium"
            value={smart.specific} onChange={e => setSmart({...smart, specific: e.target.value})} 
            placeholder="e.g. 'I will have built a full-stack dashboard using FSD architecture...'"
          />
        </div>
      )
    },
    {
      title: 'M - Measurable',
      icon: <FileText className="w-5 h-5 text-emerald-400" />,
      guidance: "Victory Metrics: How will you prove the mission is successful? Define the proof.",
      content: (
        <div className="space-y-2">
           <textarea 
            rows={5}
            className="w-full bg-secondary/40 border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-emerald-500/40 transition-colors leading-relaxed font-medium"
            value={smart.measurable} onChange={e => setSmart({...smart, measurable: e.target.value})} 
            placeholder="e.g. '3 specific PRs merged, or 100% test coverage achieved...'"
          />
        </div>
      )
    },
    {
      title: 'A - Achievable',
      icon: <ShieldCheck className="w-5 h-5 text-amber-400" />,
      guidance: "Resource Check: Do you have the temporal and mental bandwidth to execute this now?",
      content: (
        <div className="space-y-2">
           <textarea 
            rows={5}
            className="w-full bg-secondary/40 border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-amber-500/40 transition-colors leading-relaxed font-medium"
            value={smart.achievable} onChange={e => setSmart({...smart, achievable: e.target.value})} 
            placeholder="e.g. 'I have designated 2 hours of Deep Work every morning for this...'"
          />
        </div>
      )
    },
    {
      title: 'R - Relevant',
      icon: <TrendingUp className="w-5 h-5 text-violet-400" />,
      guidance: "Grand Strategy: How does this align with your current long-term evolution path?",
      content: (
        <div className="space-y-2">
           <textarea 
            rows={5}
            className="w-full bg-secondary/40 border border-border rounded-xl p-4 text-foreground focus:outline-none focus:border-violet-500/40 transition-colors leading-relaxed font-medium"
            value={smart.relevant} onChange={e => setSmart({...smart, relevant: e.target.value})} 
            placeholder="e.g. 'This is the missing link for my promotion to Senior Lead...'"
          />
        </div>
      )
    },
    {
      title: 'T - Chronos Sync',
      icon: <Clock className="w-5 h-5 text-red-400" />,
      guidance: "Temporal Deadline: Determine the extraction point. When must this be completed?",
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-3">
             {[
               { val: '1_week', label: '1 WEEK' },
               { val: '2_weeks', label: '2 WEEKS' },
               { val: '1_month', label: '1 MONTH' },
               { val: '3_months', label: '3 MONTHS' },
               { val: '6_months', label: '6 MONTHS' },
               { val: '1_year', label: '1 YEAR' },
             ].map(opt => (
               <button
                 key={opt.val}
                 type="button"
                 onClick={() => setSmart({...smart, timebound: opt.val})}
                 className={`p-3 rounded-lg border font-mono text-xs transition-all
                   ${smart.timebound === opt.val ? 'bg-primary/20 border-primary text-primary shadow-[0_0_15px_rgba(var(--primary),0.2)]' : 'bg-secondary/40 border-border text-muted-foreground hover:border-border'}`}
               >
                 {opt.label}
               </button>
             ))}
          </div>
        </div>
      )
    },
    {
      title: 'Tactical Objectives',
      icon: <ClipboardList className="w-5 h-5 text-sky-400" />,
      guidance: "Phase Breakdown: Deconstruct the mission into executable atomic steps.",
      content: (
        <div className="space-y-4">
          <div className="max-h-[250px] overflow-y-auto pr-2 space-y-3 custom-scrollbar">
            {tasks.map((task, idx) => (
              <div key={idx} className="flex gap-2 group">
                <div className="w-8 flex items-center justify-center text-[10px] font-mono text-muted-foreground bg-secondary/50 rounded-l-md">
                   {String(idx + 1).padStart(2, '0')}
                </div>
                <input 
                  className="flex-1 bg-secondary/40 border border-border p-3 text-sm focus:outline-none focus:border-primary/30 transition-colors font-medium"
                  value={task.title} 
                  onChange={e => {
                    const newTasks = [...tasks];
                    newTasks[idx].title = e.target.value;
                    setTasks(newTasks)
                  }} 
                  placeholder={`Sub-objective ${idx + 1}...`} 
                />
                <button 
                  type="button"
                  onClick={() => setTasks(tasks.filter((_, i) => i !== idx))} 
                  className="p-3 text-red-500/50 hover:text-red-500 hover:bg-red-500/10 rounded-r-md transition-all"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
          <Button variant="ghost" type="button" className="w-full border border-dashed border-border hover:border-primary/40 hover:bg-primary/5 text-xs text-muted-foreground h-10" onClick={() => setTasks([...tasks, {title: ''}])}>
            <Plus className="w-4 h-4 mr-2" /> Add Objective
          </Button>
        </div>
      )
    }
  ]

  const isLastStep = step === steps.length - 1

  return (
    <div className="bg-card backdrop-blur-3xl border border-border rounded-3xl max-w-lg w-full mx-auto overflow-hidden shadow-[0_0_80px_-20px_rgba(0,0,0,0.8)] flex flex-col h-[620px]">
      {/* Header */}
      <div className="bg-secondary/20 p-6 border-b border-border flex justify-between items-center">
        <div className="flex items-center gap-4">
           <div className="p-2.5 bg-secondary/50 rounded-xl border border-border shadow-inner">
              {steps[step].icon || <Crosshair className="w-5 h-5 text-primary" />}
           </div>
           <div className="flex flex-col">
              <h2 className="font-display font-black text-xl uppercase tracking-tighter italic text-foreground">{steps[step].title}</h2>
              <span className="text-[9px] font-mono text-muted-foreground uppercase tracking-widest">Protocol Step {step + 1} / {steps.length}</span>
           </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-[10px] font-mono text-primary/70 uppercase tracking-widest mb-1.5 font-black">Sync Status</span>
          <div className="flex gap-1">
             {steps.map((_, i) => (
                <div key={i} className={`h-1.5 w-4 rounded-full transition-all duration-700 ${i <= step ? 'bg-primary shadow-[0_0_10px_rgba(var(--primary),0.6)]' : 'bg-secondary'}`} />
             ))}
          </div>
        </div>
      </div>
      
      {/* Guidance Bar */}
      <div className="px-8 py-3 bg-primary/5 border-b border-border">
         <p className="text-[10px] font-bold text-primary/80 uppercase tracking-widest leading-relaxed">
           <span className="opacity-50 mr-2">Guidance:</span> {steps[step].guidance}
         </p>
      </div>

      {/* Content */}
      <div className="p-8 flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
            animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
            transition={{ duration: 0.5, ease: [0.23, 1, 0.32, 1] }}
          >
            {errorMsg && (
              <div className="mb-6 p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-500 text-xs font-mono flex items-center gap-3">
                <span className="animate-pulse flex-shrink-0">⚠️</span> 
                <span className="font-bold">SYSTEM_ERROR: {errorMsg.toUpperCase()}</span>
              </div>
            )}
            {steps[step].content}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="p-6 border-t border-border flex justify-between bg-secondary/40 backdrop-blur-md items-center">
        <Button 
          variant="ghost" 
          type="button"
          className="text-muted-foreground hover:text-foreground font-black text-[10px] uppercase tracking-[0.2em]" 
          onClick={step === 0 ? onCancel : handlePrev}
        >
          {step === 0 ? 'Abort Protocol' : 'Revert Protocol'}
        </Button>
        
        {isLastStep ? (
          <Button 
            onClick={(e) => handleSave(e as any)} 
            disabled={isLoading || !title || selectedAttributes.length === 0}
            className="bg-primary hover:bg-primary/90 text-black font-black px-10 h-12 rounded-xl shadow-[0_0_30px_rgba(var(--primary),0.4)] transition-all hover:scale-105 active:scale-95 text-xs uppercase tracking-widest"
          >
            {isLoading ? 'ENCRYPTING...' : 'DEPLOY MISSION'}
          </Button>
        ) : (
          <Button 
            onClick={handleNext} 
            type="button"
            className="bg-secondary/40 hover:bg-secondary/60 text-foreground font-black px-10 h-12 rounded-xl uppercase tracking-widest text-[10px]"
          >
            Proceed <ChevronRight className="w-4 h-4 ml-1.5" />
          </Button>
        )}
      </div>
    </div>
  )
}
