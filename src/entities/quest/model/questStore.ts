import { create } from 'zustand'
import { createClient } from '@/shared/api/supabase'
import { Database } from '@/shared/types/database.types'

type Quest = Database['public']['Tables']['quests']['Row']
type Task = Database['public']['Tables']['tasks']['Row']

export interface QuestWithTasks extends Quest {
  tasks: Task[]
}

interface QuestState {
  quests: QuestWithTasks[]
  independentTasks: Task[]
  isLoading: boolean
  error: string | null
  
  fetchQuests: () => Promise<void>
  fetchIndependentTasks: () => Promise<void>
  createQuest: (questData: Omit<Database['public']['Tables']['quests']['Insert'], 'user_id'>, tasksData: Omit<Database['public']['Tables']['tasks']['Insert'], 'user_id'>[]) => Promise<void>
  createIndependentTask: (taskData: Omit<Database['public']['Tables']['tasks']['Insert'], 'user_id'>) => Promise<void>
  completeTask: (taskId: string, questId?: string | null) => Promise<void>
  completeQuest: (questId: string) => Promise<void>
  deleteQuest: (questId: string) => Promise<void>
}

export const useQuestStore = create<QuestState>((set, get) => ({
  quests: [],
  independentTasks: [],
  isLoading: false,
  error: null,

  fetchQuests: async () => {
    set({ isLoading: true, error: null })
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data: quests, error: qError } = await supabase
        .from('quests')
        .select('*')
        .eq('user_id', userData.user.id)
        .order('created_at', { ascending: false })

      if (qError) throw qError

      const { data: tasks, error: tError } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userData.user.id)
        .not('quest_id', 'is', null)

      if (tError) throw tError

      const questsWithTasks: QuestWithTasks[] = (quests as Quest[] || []).map(q => ({
        ...q,
        tasks: (tasks as Task[] || []).filter(t => t.quest_id === q.id)
      }))

      set({ quests: questsWithTasks, isLoading: false })
    } catch (err: any) {
      set({ error: err.message, isLoading: false })
    }
  },

  fetchIndependentTasks: async () => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')

      const { data: tasks, error } = await supabase
        .from('tasks')
        .select('*')
        .eq('user_id', userData.user.id)
        .is('quest_id', null)
        .order('deadline', { ascending: true })

      if (error) throw error
      set({ independentTasks: tasks || [] })
    } catch (err: any) {
      set({ error: err.message })
    }
  },

  createQuest: async (questData, tasksData) => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')
      
      const questWithUser = { ...questData, user_id: userData.user.id }

      // 1. Create Quest
      const { data: newQuest, error: qError } = await supabase
        .from('quests')
        .insert(questWithUser as any)
        .select()
        .single()
        
      if (qError) throw qError
      if (!newQuest) throw new Error('Failed to create quest')
      
      const createdQuest = newQuest as Quest

      // 2. Attach quest_id and user_id to tasks and create them
      const tasksToInsert = tasksData.map(t => ({ 
        ...t, 
        quest_id: createdQuest.id, 
        user_id: userData.user.id 
      }))
      
      const { data: newTasks, error: tError } = await supabase
        .from('tasks')
        .insert(tasksToInsert as any)
        .select()
      
      if (tError) throw tError
      if (!newTasks) throw new Error('Failed to create tasks')

      // 3. Update State
      set((state) => ({
        quests: [{ ...createdQuest, tasks: newTasks || [] }, ...state.quests]
      }))
    } catch (err: any) {
      set({ error: err.message })
      throw err
    }
  },

  createIndependentTask: async (taskData) => {
    const supabase = createClient()
    try {
      const { data: userData } = await supabase.auth.getUser()
      if (!userData.user) throw new Error('Not authenticated')
      
      const { data, error } = await supabase
        .from('tasks')
        .insert({ ...taskData, user_id: userData.user.id } as any)
        .select()
        .single()
        
      if (error) throw error
      if (!data) throw new Error('Failed to create independent task')
      
      set(state => ({
        independentTasks: [...state.independentTasks, data]
      }))
    } catch (err: any) {
      set({ error: err.message })
      throw err
    }
  },

  completeTask: async (taskId, questId) => {
    const supabase = createClient()
    
    // Optimistic Update
    set((state) => ({
      quests: questId 
        ? state.quests.map((q) =>
            q.id === questId
              ? {
                  ...q,
                  tasks: q.tasks.map((t) =>
                    t.id === taskId
                      ? { ...t, status: 'completed', completed_at: new Date().toISOString() }
                      : t
                  ),
                }
              : q
          )
        : state.quests,
      independentTasks: !questId 
        ? state.independentTasks.map(t => 
            t.id === taskId 
              ? { ...t, status: 'completed', completed_at: new Date().toISOString() } 
              : t
          )
        : state.independentTasks
    }))

    try {
      const { data, error } = await (supabase as any).rpc('complete_task', { p_task_id: taskId })
      if (error) throw error
      
      // If backend returns success, we might want to refresh profile/attributes as well
      // but usually the profile store or globally shared state will handle that.
    } catch (err: any) {
      get().fetchQuests()
      get().fetchIndependentTasks()
      set({ error: err.message })
    }
  },

  completeQuest: async (questId) => {
    const supabase = createClient()

    // Optimistic Update
    set(state => ({
      quests: state.quests.map(q => 
        q.id === questId 
          ? { ...q, status: 'completed', completed_at: new Date().toISOString() } 
          : q
      )
    }))

    try {
      const { data, error } = await (supabase as any).rpc('complete_quest', { p_quest_id: questId })
      if (error) throw error
    } catch (err: any) {
      get().fetchQuests()
      set({ error: err.message })
    }
  },

  deleteQuest: async (questId) => {
    const supabase = createClient()

    // Optimistic Update
    set(state => ({
      quests: state.quests.filter(q => q.id !== questId)
    }))

    try {
      const { error } = await supabase
        .from('quests')
        .delete()
        .eq('id', questId)

      if (error) throw error
    } catch (err: any) {
      get().fetchQuests()
      set({ error: err.message })
    }
  }
}))
