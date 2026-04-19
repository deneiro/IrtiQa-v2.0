import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/ui/card'
import { 
  Smile, 
  Frown, 
  Flame, 
  Wind, 
  Meh, 
  Zap, 
  Moon, 
  Heart,
  Lock,
  Calendar
} from 'lucide-react'
import { MoodType, JournalEntry } from '../model/types'
import { format, isBefore, subDays } from 'date-fns'
import { motion, AnimatePresence } from 'framer-motion'
import { cn } from '@/shared/lib/utils'
import { useInventoryStore } from '@/entities/inventory'
import { useItem } from '@/features/economy/api/use-item'
import { useAuthStore } from '@/entities/user'
import { Button } from '@/shared/ui/button'
import { toast } from '@/shared/lib/toast'

interface JournalCardProps {
  entry: JournalEntry
  onClick?: () => void
}

const MOD_ICONS: Record<MoodType, React.ElementType> = {
  happy: Smile,
  sad: Frown,
  angry: Flame,
  anxious: Wind,
  neutral: Meh,
  excited: Zap,
  tired: Moon,
  grateful: Heart,
}

const MOOD_COLORS: Record<MoodType, string> = {
  happy: 'text-yellow-400 bg-yellow-400/10',
  sad: 'text-blue-400 bg-blue-400/10',
  angry: 'text-red-400 bg-red-400/10',
  anxious: 'text-purple-400 bg-purple-400/10',
  neutral: 'text-gray-400 bg-gray-400/10',
  excited: 'text-orange-400 bg-orange-400/10',
  tired: 'text-indigo-400 bg-indigo-400/10',
  grateful: 'text-pink-400 bg-pink-400/10',
}

export function JournalCard({ entry, onClick }: JournalCardProps) {
  const MoodIcon = entry.mood ? MOD_ICONS[entry.mood as MoodType] : Meh
  const moodColor = entry.mood ? MOOD_COLORS[entry.mood as MoodType] : 'text-gray-400 bg-gray-400/10'
  
  // Check if locked (72 hours rule)
  const entryDate = new Date(entry.entry_date)
  const isLocked = isBefore(entryDate, subDays(new Date(), 3)) && !entry.unlocked_by_powerup
  const isUnlockedViaPowerup = entry.unlocked_by_powerup

  const { items } = useInventoryStore()
  const { user } = useAuthStore()
  const feather = items.find(i => i.item_key === 'feather_of_time')

  const handleUnlock = async (e: React.MouseEvent) => {
    e.stopPropagation()
    if (!user) return
    if (!feather) {
      toast.error('You need a Feather of Time to unlock old entries.')
      return
    }

    await useItem(feather.id, user.id, entry.id)
  }

  return (
    <motion.div
      whileHover={{ y: -4 }}
      transition={{ duration: 0.2 }}
      className="h-full"
    >
      <Card 
        className={cn(
          "cursor-pointer hover:border-primary/50 transition-colors h-full flex flex-col relative",
          isLocked && "opacity-80 cursor-default hover:border-border"
        )}
        onClick={!isLocked ? onClick : undefined}
      >
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <Calendar className="w-4 h-4" />
              <span className="text-xs font-medium">
                {format(entryDate, 'PPP')}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {isUnlockedViaPowerup && (
                <div className="flex items-center gap-1 text-[10px] font-bold text-amber-500 uppercase tracking-tighter bg-amber-500/10 px-1.5 py-0.5 rounded">
                  <Flame className="w-3 h-3" /> Legacy Unlocked
                </div>
              )}
              {isLocked && <Lock className="w-4 h-4 text-muted-foreground/50" />}
            </div>
          </div>
          <CardTitle className="text-lg flex items-center gap-3">
             <div className={cn("p-2 rounded-lg", moodColor)}>
                <MoodIcon className="w-5 h-5" />
             </div>
             <span className="capitalize">{entry.mood || 'Neutral'}</span>
          </CardTitle>
        </CardHeader>
        
        <CardContent className="flex-grow">
          <div className="space-y-3">
            {isLocked ? (
              <div className="bg-muted/50 rounded-lg p-3 border border-dashed border-border flex flex-col items-center justify-center text-center py-6">
                <Lock className="w-8 h-8 text-muted-foreground/40 mb-2" />
                <p className="text-xs font-medium text-muted-foreground mb-3">Temporal seal active. This entry is over 72 hours old.</p>
                {feather ? (
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={handleUnlock}
                    className="gap-2 border-amber-500/50 hover:bg-amber-500/10 text-amber-600 font-bold"
                  >
                    Use Feather of Time
                  </Button>
                ) : (
                  <span className="text-[10px] uppercase font-bold text-muted-foreground/50 mt-1">Requires Feather of Time</span>
                )}
              </div>
            ) : (
              <>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Stress Level:</span>
                  <div className="flex-grow h-1.5 bg-secondary rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-primary" 
                      style={{ width: `${(entry.stress_level || 0) * 10}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold">{entry.stress_level}/10</span>
                </div>
                
                {entry.answers && (entry.answers as string[]).length > 0 && (
                  <p className="text-sm text-muted-foreground line-clamp-2 italic">
                    "{ (entry.answers as string[])[0] }"
                  </p>
                )}
              </>
            )}
            
            <div className="pt-2 border-t border-border/50 flex justify-between items-center">
               <span className="text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                 Daily Snapshot
               </span>
               <div className="flex gap-2">
                  <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">
                    +{entry.xp_earned} XP
                  </span>
               </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
