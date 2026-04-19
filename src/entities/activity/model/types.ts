export type ActivityType = 'habit' | 'task' | 'journal' | 'level_up';

export interface ActivityEvent {
  id: string;
  type: ActivityType;
  title: string;
  description?: string;
  timestamp: string;
  metadata?: {
    xp_gained?: number;
    gold_gained?: number;
    attr_key?: string;
    completed?: boolean;
    mood?: string;
    stress_level?: number;
  };
}

export interface ActivityState {
  events: ActivityEvent[];
  isLoading: boolean;
  fetchHistory: () => Promise<void>;
}
