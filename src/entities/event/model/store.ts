import { create } from 'zustand'
import { SocialEvent } from './types'

interface EventState {
  events: SocialEvent[]
  isLoading: boolean
  
  // Actions
  setEvents: (events: SocialEvent[]) => void
  addEvent: (event: SocialEvent) => void
  updateEvent: (event: SocialEvent) => void
  deleteEvent: (eventId: string) => void
}

export const useEventStore = create<EventState>((set) => ({
  events: [],
  isLoading: true,
  
  setEvents: (events) => set({ events, isLoading: false }),
  
  addEvent: (event) => set((state) => ({
    events: [event, ...state.events].sort((a, b) => 
      new Date(b.event_date).getTime() - new Date(a.event_date).getTime()
    )
  })),
  
  updateEvent: (updatedEvent) => set((state) => ({
    events: state.events.map(e => e.id === updatedEvent.id ? updatedEvent : e)
  })),
  
  deleteEvent: (eventId) => set((state) => ({
    events: state.events.filter(e => e.id !== eventId)
  }))
}))
