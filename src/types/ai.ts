/**
 * AI Voice Assistant Types
 */

export type VoiceIntent = 
  | 'add_habit'
  | 'add_task' 
  | 'add_goal'
  | 'schedule_routine'
  | 'skip_habit'
  | 'mark_complete'
  | 'get_progress'
  | 'unknown'

export interface VoiceEntity {
  name?: string
  pillar?: 'mental' | 'physical' | 'social' | 'intellectual'
  time?: string
  date?: string
  frequency?: 'daily' | 'custom' | 'once'
  duration?: number
  goal?: string
  currentStatus?: string
  targetStatus?: string
}

export interface VoiceCommand {
  intent: VoiceIntent
  entities: VoiceEntity
  confidence: number
  originalText: string
}

export interface VoiceResponse {
  type: 'confirmation' | 'clarification' | 'error' | 'success'
  message: string
  action?: VoiceCommand
  requiresInput?: boolean
}

export interface SpeechRecognitionConfig {
  language: string
  continuous: boolean
  interimResults: boolean
  maxAlternatives: number
}

export interface SpeechSynthesisConfig {
  voice?: SpeechSynthesisVoice
  rate: number
  pitch: number
  volume: number
}

export interface VoiceSettings {
  enabled: boolean
  language: 'en' | 'ml' // English, Malayalam
  recognition: SpeechRecognitionConfig
  synthesis: SpeechSynthesisConfig
  wakeWord?: string
}

export interface ConversationContext {
  messages: Array<{
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }>
  currentIntent?: VoiceIntent
  pendingEntities: Partial<VoiceEntity>
  isActive: boolean
}

export interface AIProvider {
  name: 'openai' | 'anthropic' | 'gemini'
  apiKey: string
  model: string
  maxTokens?: number
  temperature?: number
}

export interface VoiceMacro {
  id: string
  name: string
  trigger: string
  actions: VoiceCommand[]
  description: string
}
