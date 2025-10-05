export type PillarType = 'mental' | 'physical' | 'social' | 'intellectual'

export type RepeatFrequency = 'once' | 'daily' | 'custom'

export interface Task {
  id: string
  name: string
  pillar: PillarType
  icon: string
  completed: boolean
  reminderTime?: string
  reminderDate?: string // ISO date string for "once" reminders (YYYY-MM-DD)
  repeatFrequency: RepeatFrequency
  customDays?: string[] // ['monday', 'tuesday', etc.] for custom frequency
  hasReminder: boolean
  createdAt: Date
  completedAt?: Date
  challengeDuration?: number // 3, 7, 21, or 66 days for habit challenges
  completionDates?: string[] // ISO dates when habit was completed
  goalId?: string // Link habit to a goal
  duration?: number // Duration in minutes (default: 30)
  startTime?: string // Start time (HH:MM format)
  endTime?: string // Calculated end time (HH:MM format)
}

export interface Routine {
  id: string
  name: string
  habitIds: string[]
  taskIds?: string[] // Add support for tasks in routines
  startTime: string // reference Task.id of habits
  endTime?: string | null // optional end time, if not provided duration is calculated from habits and tasks
  durationMinutes?: number;
  color: string
  isActive?: boolean
  createdAt?: Date
  updatedAt?: Date
  repeatFrequency?: RepeatFrequency
  customDays?: string[]
}

export interface DailyModification {
  id: string; // Unique ID for the modification
  date: string; // 'YYYY-MM-DD' format
  itemId: string; // The ID of the Task or Routine template it refers to
  itemType: 'task' | 'routine';
  instanceId?: string; // The ID of the instance of the Task or Routine  
  
  // The change being made for this day
  modification: {
    status: 'skipped' | 'added' | 'rescheduled';
    startTime?: string; // Overridden start time
    endTime?: string;   // Overridden end time
    completed?: boolean;
  }
}

export interface Goal {
  id: string
  title: string
  pillar: PillarType
  initialStatus: string
  targetStatus: string
  currentStatus: string
  currentStatusUpdatedAt: Date
  createdAt: Date
  isActive: boolean
}

export interface UserStats {
  streak: number
  totalPoints: number
  level: number
}

export interface PillarConfig {
  id: PillarType
  name: string
  color: string
  description: string
}

export const PILLAR_CONFIGS: Record<PillarType, PillarConfig> = {
  mental: {
    id: 'mental',
    name: 'Mental Health',
    color: '#7DD3FC',
    description: 'Meditation, reading, journaling, learning'
  },
  physical: {
    id: 'physical', 
    name: 'Physical Health',
    color: '#86EFAC',
    description: 'Exercise, nutrition, sleep, hydration'
  },
  social: {
    id: 'social',
    name: 'Social Health', 
    color: '#FDBA74',
    description: 'Calling friends, family time, gratitude'
  },
  intellectual: {
    id: 'intellectual',
    name: 'Intellectual & Purpose',
    color: '#C4B5FD', 
    description: 'Volunteering, creative hobbies, nature'
  }
}

// Quiz Types
export interface QuizOption {
  id: string
  text: string
  icon: string
  pillar?: PillarType
  weight?: number
}

export interface QuizQuestion {
  id: string
  text: string
  options: QuizOption[]
}

export interface QuizAnswer {
  questionId: string
  selectedOption: string
}

export interface QuizResults {
  answers: QuizAnswer[]
  leastFocusedPillar: PillarType
  preferredMotivation: string
  preferredTiming: string
  approach: string
  recommendedTimeCommitment: string
}

export interface OnboardingState {
  completed: boolean
  currentStep: 'welcome' | 'quiz' | 'results' | 'habit-creation' | 'complete'
  quizResults?: QuizResults
}