import { create } from 'zustand'
import { Session, User } from '@supabase/supabase-js'

interface AuthState {
  user: User | null
  session: Session | null
  isInitialized: boolean
  
  setAuth: (session: Session | null) => void
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  session: null,
  isInitialized: false,
  
  setAuth: (session) => set({ 
    session, 
    user: session?.user || null,
    isInitialized: true,
  }),
}))
