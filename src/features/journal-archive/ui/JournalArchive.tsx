"use client"

import React, { useEffect, useState } from 'react'
import { useJournalStore, JournalCard, MoodType, JournalEntry } from '@/entities/journal'
import { Input } from '@/shared/ui/input' // I'll create this if it doesn't exist
import { 
  Search, 
  Filter, 
  ChevronDown,
  LayoutGrid,
  List as ListIcon,
  Calendar
} from 'lucide-react'
import { Button } from '@/shared/ui/button'
import { cn } from '@/shared/lib/utils'
import { format } from 'date-fns'
import { WriteJournalModal } from '@/features/journal-write'

export function JournalArchive() {
  const { journals, fetchJournals, isLoading } = useJournalStore()
  const [search, setSearch] = useState('')
  const [selectedMood, setSelectedMood] = useState<MoodType | 'all'>('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedJournal, setSelectedJournal] = useState<JournalEntry | null>(null)

  useEffect(() => {
    fetchJournals()
  }, [fetchJournals])

  const filteredJournals = journals.filter(j => {
    const matchesSearch = j.answers ? (j.answers as string[]).some(a => a.toLowerCase().includes(search.toLowerCase())) : true
    const matchesMood = selectedMood === 'all' || j.mood === selectedMood
    return matchesSearch && matchesMood
  })

  return (
    <div className="space-y-8">
      {/* Header & Filters */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div className="relative w-full md:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search reflections..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-card border rounded-xl focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 transition-all"
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
           {/* Mood Filter */}
           <div className="relative group">
              <select 
                value={selectedMood}
                onChange={(e) => setSelectedMood(e.target.value as any)}
                className="appearance-none bg-card border rounded-xl px-4 py-2 pr-10 focus:outline-none focus:ring-2 focus:ring-primary transition-all text-sm font-medium cursor-pointer"
              >
                <option value="all">All Moods</option>
                <option value="happy">Happy</option>
                <option value="grateful">Grateful</option>
                <option value="excited">Excited</option>
                <option value="neutral">Neutral</option>
                <option value="tired">Tired</option>
                <option value="anxious">Anxious</option>
                <option value="sad">Sad</option>
                <option value="angry">Angry</option>
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
           </div>

           <div className="border rounded-xl flex overflow-hidden">
              <Button 
                variant={viewMode === 'grid' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('grid')}
                className="rounded-none border-0"
              >
                <LayoutGrid className="w-4 h-4" />
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'ghost'} 
                size="sm" 
                onClick={() => setViewMode('list')}
                className="rounded-none border-0"
              >
                <ListIcon className="w-4 h-4" />
              </Button>
           </div>
        </div>
      </div>

      {/* Grid View */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-48 rounded-xl bg-card animate-pulse border-border/50" />
          ))}
        </div>
      ) : filteredJournals.length > 0 ? (
        <div className={cn(
          "grid gap-6",
          viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
        )}>
          {filteredJournals.map((journal) => (
            <JournalCard 
              key={journal.id} 
              entry={journal} 
              onClick={() => setSelectedJournal(journal)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-card rounded-2xl border border-dashed border-border/50">
           <Calendar className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
           <h3 className="text-xl font-display font-bold mb-1">No journals found</h3>
           <p className="text-muted-foreground">Start writing today's reflection to build your archive.</p>
        </div>
      )}

      {/* Edit Journal Modal */}
      {selectedJournal && (
         <WriteJournalModal 
            isOpen={!!selectedJournal} 
            onClose={() => setSelectedJournal(null)} 
            initialData={selectedJournal}
         />
      )}
    </div>
  )
}
