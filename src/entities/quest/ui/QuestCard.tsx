'use client'

import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/shared/ui/card'
import { Badge } from '@/shared/ui/badge'
import { Progress } from '@/shared/ui/progress'
import { GAME_CORE } from '@/shared/config/game-core'
import { QuestWithTasks, useQuestStore } from '../model/questStore'
import { 
  ChevronDown, 
  ChevronUp, 
  CheckCircle, 
  Target, 
  Info, 
  Trash2, 
  X,
  FileText,
  ShieldCheck,
  TrendingUp,
  Clock,
  Terminal
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/shared/ui/button'
import { useVFXStore } from '@/shared/model/vfx-store'
import useSound from 'use-sound'

import { QuestCelebration } from './QuestCelebration'

interface QuestCardProps {
  quest: QuestWithTasks
  children?: React.ReactNode 
}

// Simple parser for SMART resources
function parseSmartResources(resources: string) {
  if (!resources) return null;
  
  const sections = {
    specific: resources.split('**Specific:**')[1]?.split('**Measurable:**')[0]?.trim(),
    measurable: resources.split('**Measurable:**')[1]?.split('**Achievable:**')[0]?.trim(),
    achievable: resources.split('**Achievable:**')[1]?.split('**Relevant:**')[0]?.trim(),
    relevant: resources.split('**Relevant:**')[1]?.split('**Time-bound:**')[0]?.trim(),
    timebound: resources.split('**Time-bound:**')[1]?.trim(),
  }

  // If we couldn't parse it as SMART, just return the raw text
  if (!sections.specific && !sections.measurable) return null;
  
  return sections;
}

export function QuestCard({ quest, children }: QuestCardProps) {
  const { completeQuest, deleteQuest } = useQuestStore()
  const [expanded, setExpanded] = useState(false)
  const [intelExpanded, setIntelExpanded] = useState(false)
  const [isCelebrating, setIsCelebrating] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [playSuccess] = useSound('/sounds/level-up.mp3', { volume: 0.5 })
  const [playTrash] = useSound('/sounds/hurt.mp3', { volume: 0.3 })
  
  const completedTasks = quest.tasks.filter(t => t.status === 'completed').length
  const totalTasks = quest.tasks.length
  const progressPercent = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
  const isCompleted = quest.status === 'completed'
  const allTasksDone = totalTasks > 0 && completedTasks === totalTasks

  const primaryAttrKey = quest.attribute_ids?.[0] || 'development'
  const primaryAttr = GAME_CORE.ATTRIBUTES[primaryAttrKey as keyof typeof GAME_CORE.ATTRIBUTES]
  const accentColor = primaryAttr?.color || '#3b82f6'

  const { addEffect } = useVFXStore()
  const smartBriefing = parseSmartResources(quest.resources || '')

  const handleStartCelebration = (e: React.MouseEvent) => {
    e.stopPropagation()
    playSuccess()
    
    const x = e.clientX
    const y = e.clientY
    addEffect('xp', quest.xp_reward, x, y)
    if (quest.gold_reward > 0) {
      setTimeout(() => addEffect('gold', quest.gold_reward, x + 20, y - 20), 200)
    }
    
    setIsCelebrating(true)
  }

  const handleFinalizeCompletion = async () => {
    setIsCelebrating(false)
    await completeQuest(quest.id)
  }

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!showDeleteConfirm) {
      setShowDeleteConfirm(true)
      return
    }
    playTrash()
    await deleteQuest(quest.id)
  }

  return (
    <>
      <QuestCelebration 
        quest={quest as any}
        isOpen={isCelebrating}
        onClose={handleFinalizeCompletion}
      />
      
      <Card 
        className={`relative overflow-hidden transition-all duration-500 border bg-card/80 backdrop-blur-md group
          ${isCompleted ? 'opacity-60 border-border' : 'border-border/50 hover:border-border'}`}
        style={{
          boxShadow: expanded && !isCompleted ? `0 0 30px -15px ${accentColor}` : 'none',
          borderColor: expanded && !isCompleted ? accentColor : undefined
        }}
      >
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px]" />
        
        {!isCompleted && (
          <>
            <div className="absolute top-0 left-0 w-2 h-2 border-t border-l opacity-20" style={{ borderColor: accentColor }} />
            <div className="absolute top-0 right-0 w-2 h-2 border-t border-r opacity-20" style={{ borderColor: accentColor }} />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l opacity-20" style={{ borderColor: accentColor }} />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r opacity-20" style={{ borderColor: accentColor }} />
          </>
        )}

        <div className="relative z-10">
          <CardHeader 
            className="cursor-pointer select-none pb-4" 
            onClick={() => setExpanded(!expanded)}
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1 space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4" style={{ color: accentColor }} />
                  <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">{isCompleted ? 'Mission Log' : 'Directive'}</span>
                </div>
                <CardTitle className="text-xl font-display font-bold tracking-tight text-foreground group-hover:text-primary transition-colors">
                  {quest.title}
                </CardTitle>
                
                <div className="flex flex-wrap gap-2 pt-2">
                  {quest.attribute_ids?.slice(0, 3).map((attr) => {
                    const a = GAME_CORE.ATTRIBUTES[attr as keyof typeof GAME_CORE.ATTRIBUTES]
                    return (
                      <Badge 
                        key={attr} 
                        variant="outline" 
                        className="text-[10px] px-1.5 py-0 rounded-sm bg-secondary/80 border-border"
                        style={{ color: a?.color, borderColor: `${a?.color}40` }}
                      >
                        {a?.name.toUpperCase()}
                      </Badge>
                    )
                  })}
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2">
                <div className="flex gap-1.5 grayscale-[0.5] group-hover:grayscale-0 transition-all">
                  <Badge variant="secondary" className="text-[10px] font-mono bg-secondary border-none text-blue-500 dark:text-blue-400">
                    +{quest.xp_reward} XP
                  </Badge>
                  {quest.gold_reward > 0 && (
                    <Badge variant="secondary" className="text-[10px] font-mono bg-secondary border-none text-yellow-600 dark:text-yellow-500">
                      {quest.gold_reward} G
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1">
                  <button 
                    onClick={handleDelete}
                    className={`p-1.5 rounded-md transition-all flex items-center gap-1 group/del
                      ${showDeleteConfirm ? 'bg-red-500/20 text-red-500' : 'hover:bg-secondary text-muted-foreground hover:text-red-500'}
                    `}
                  >
                    {showDeleteConfirm ? (
                      <>
                        <span className="text-[10px] font-mono uppercase tracking-tighter">Sure?</span>
                        <Trash2 className="w-3.5 h-3.5" />
                      </>
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                  
                  {showDeleteConfirm && (
                    <button 
                      onClick={(e) => { e.stopPropagation(); setShowDeleteConfirm(false); }}
                      className="p-1.5 rounded-md hover:bg-secondary text-muted-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <div className="w-[1px] h-4 bg-white/10 mx-1" />

                  <button className="p-1.5 rounded-md hover:bg-secondary transition-colors">
                    {expanded ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-1.5">
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground tracking-widest uppercase">
                <span>Mastery Gauge</span>
                <span className={allTasksDone ? 'text-primary animate-pulse' : ''}>
                  {completedTasks}/{totalTasks}
                </span>
              </div>
              <Progress 
                value={progressPercent} 
                className="h-1.5 bg-secondary" 
                indicatorStyle={{ 
                  backgroundColor: accentColor,
                  boxShadow: `0 0 10px ${accentColor}80`
                }} 
              />
            </div>
          </CardHeader>

          <AnimatePresence>
            {expanded && (
              <motion.div 
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.23, 1, 0.32, 1] }}
              >
                <CardContent className="pt-0 space-y-8">
                  {/* 1. Tactical Objectives */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                       <Terminal className="w-4 h-4 text-muted-foreground/40" />
                       <div className="text-[10px] text-muted-foreground uppercase tracking-[0.25em] font-mono">Phase Alignment</div>
                       <div className="flex-1 h-[1px] bg-border" />
                    </div>
                    <div className="space-y-1 pl-7">
                        {children}
                    </div>
                  </div>

                  {/* 2. Intelligence Hub (Structured Briefing) */}
                  {quest.resources && (
                    <div className="space-y-3 pt-2">
                      <button 
                        onClick={() => setIntelExpanded(!intelExpanded)}
                        className="flex items-center gap-3 text-[10px] uppercase font-mono tracking-widest text-muted-foreground hover:text-foreground transition-colors group/intel w-full"
                      >
                        <Info className="w-4 h-4" />
                        <span className="group-hover/intel:tracking-[0.2em] transition-all">Strategic Briefing</span>
                        <div className="flex-1 h-[1px] bg-border" />
                        <motion.div animate={{ rotate: intelExpanded ? 180 : 0 }}>
                          <ChevronDown className="w-3 h-3" />
                        </motion.div>
                      </button>
                      
                      <AnimatePresence>
                        {intelExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden"
                          >
                            <div className="mt-2 space-y-4 pl-7">
                               {smartBriefing ? (
                                 <div className="grid grid-cols-1 gap-4">
                                   {[
                                     { label: 'SPECIFIC', value: smartBriefing.specific, icon: Target, color: 'text-primary' },
                                     { label: 'MEASURABLE', value: smartBriefing.measurable, icon: FileText, color: 'text-emerald-400' },
                                     { label: 'ACHIEVABLE', value: smartBriefing.achievable, icon: ShieldCheck, color: 'text-amber-400' },
                                     { label: 'RELEVANT', value: smartBriefing.relevant, icon: TrendingUp, color: 'text-violet-400' },
                                     { label: 'TIME-BOUND', value: smartBriefing.timebound, icon: Clock, color: 'text-red-400' }
                                   ].map((section) => (
                                     <div key={section.label} className="space-y-1.5">
                                        <div className="flex items-center gap-2 opacity-50">
                                           <section.icon className={`w-3 h-3 ${section.color}`} />
                                           <span className="text-[9px] font-mono uppercase tracking-widest">{section.label}</span>
                                        </div>
                                        <p className="text-sm text-foreground/80 leading-relaxed font-sans pl-5 border-l border-border">
                                          {section.value || 'DECRYPTING...'}
                                        </p>
                                     </div>
                                   ))}
                                 </div>
                               ) : (
                                 <div className="p-4 rounded-lg bg-secondary/40 border border-border text-sm text-foreground/70 font-sans leading-relaxed whitespace-pre-wrap italic">
                                   {quest.resources}
                                 </div>
                               )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  )}

                  {allTasksDone && !isCompleted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="pt-4"
                    >
                      <Button 
                        onClick={handleStartCelebration}
                        className="w-full bg-primary hover:bg-primary/90 text-black font-black h-12 rounded-xl group/btn overflow-hidden relative shadow-[0_0_20px_rgba(var(--primary),0.3)] transition-all hover:scale-[1.02]"
                      >
                        <div className="absolute inset-0 bg-primary/20 translate-y-full group-hover/btn:translate-y-0 transition-transform duration-300" />
                        <CheckCircle className="w-5 h-5 mr-3 relative z-10" />
                        <span className="relative z-10 uppercase tracking-[0.15em] font-display text-[11px]">Finalize Directive Alignment</span>
                      </Button>
                    </motion.div>
                  )}

                  {isCompleted && (
                    <div className="pt-4 text-center">
                      <div className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-primary/10 border border-primary/20">
                         <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
                         <span className="text-[10px] font-mono text-primary uppercase tracking-[0.4em] font-black">Expedition Concluded</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </Card>
    </>
  )
}
