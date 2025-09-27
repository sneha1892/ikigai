import type { QuizQuestion, PillarType } from '../types'

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: 'q1-current-approach',
    text: 'When you want to improve something in your life, what do you typically do?',
    options: [
      {
        id: 'hope-for-best',
        text: 'Hope for the best - I think about it but don\'t take consistent action',
        icon: '🤷',
        weight: 1
      },
      {
        id: 'focus-intensely',
        text: 'Focus intensely - I pick one thing and work on it until I burn out',
        icon: '🎯',
        weight: 2
      },
      {
        id: 'grand-plans',
        text: 'Make grand plans - I create detailed plans but struggle to stick to them',
        icon: '📝',
        weight: 2
      },
      {
        id: 'balance-everything',
        text: 'Try to balance everything - I attempt multiple changes but feel overwhelmed',
        icon: '⚖️',
        weight: 1
      }
    ]
  },
  {
    id: 'q2-motivation-style',
    text: 'What motivates you most when building new habits?',
    options: [
      {
        id: 'streaks-challenges',
        text: 'Pushing myself to keep a consistent run going.',
        icon: '🔥',
        weight: 2
      },
      {
        id: 'visible-progress',
        text: ' Seeing real-world changes in my life.',
        icon: '📊',
        weight: 2
      },
      {
        id: 'immediate-satisfaction',
        text: 'That feeling of checking an item off my list.',
        icon: '✅',
        weight: 3
      },
      {
        id: 'reminders-rewards',
        text: 'A gentle nudge to help me stay on track.',
        icon: '🔔',
        weight: 1
      }
    ]
  },
  {
    id: 'q3-natural-rhythm',
    text: 'When do you feel most motivated to work on yourself?',
    options: [
      {
        id: 'morning-person',
        text: 'Morning person - I\'m energized and focused in the early hours',
        icon: '🌅',
        weight: 2
      },
      {
        id: 'night-owl',
        text: 'Night owl - I\'m most reflective and motivated in the evening',
        icon: '🌙',
        weight: 2
      },
      {
        id: 'burst-mode',
        text: 'Burst mode - I work in intense, focused sessions when inspired',
        icon: '⚡',
        weight: 3
      },
      {
        id: 'steady-flow',
        text: 'Steady flow - I prefer consistent, gentle progress throughout the day',
        icon: '🌊',
        weight: 1
      }
    ]
  },
  {
    id: 'q4-self-assessment',
    text: 'Which area of your life feels most out of balance right now?',
    options: [
      {
        id: 'mental-scattered',
        text: 'Mental clarity - I feel scattered, unfocused, or mentally drained',
        icon: '🧠',
        pillar: 'mental',
        weight: 3
      },
      {
        id: 'physical-energy',
        text: 'Physical energy - I lack energy, fitness, or healthy routines',
        icon: '💪',
        pillar: 'physical',
        weight: 3
      },
      {
        id: 'social-disconnected',
        text: 'Relationships - I feel disconnected from family, friends, or community',
        icon: '💜',
        pillar: 'social',
        weight: 3
      },
      {
        id: 'purpose-stuck',
        text: 'Purpose & growth - I feel stuck, unmotivated, or without direction',
        icon: '🎯',
        pillar: 'intellectual',
        weight: 3
      }
    ]
  }
]

// Helper function to analyze quiz results
export function analyzeQuizResults(answers: { questionId: string; selectedOption: string }[]) {
  const pillarScores: Record<PillarType, number> = {
    mental: 0,
    physical: 0,
    social: 0,
    intellectual: 0
  }

  let motivationStyle = 'streaks-momentum'
  let timing = 'morning'
  let approach = 'balanced'

  answers.forEach(answer => {
    const question = QUIZ_QUESTIONS.find(q => q.id === answer.questionId)
    const option = question?.options.find(opt => opt.id === answer.selectedOption)
    
    if (option) {
      // Score pillars based on self-assessment question (now q4)
      if (answer.questionId === 'q4-self-assessment' && option.pillar) {
        pillarScores[option.pillar] += option.weight || 1
      }

      // Extract preferences from other questions
      if (answer.questionId === 'q2-motivation-style') {
        if (option.id === 'streaks-momentum') motivationStyle = 'streaks'
        else if (option.id === 'progress-tracking') motivationStyle = 'tracking'
        else if (option.id === 'achievement-unlocks') motivationStyle = 'achievements'
        else if (option.id === 'inner-satisfaction') motivationStyle = 'satisfaction'
      }

      if (answer.questionId === 'q3-natural-rhythm') {
        if (option.id === 'morning-person') timing = 'morning'
        else if (option.id === 'night-owl') timing = 'evening'
        else if (option.id === 'burst-mode') timing = 'flexible'
        else if (option.id === 'steady-flow') timing = 'throughout-day'
      }

      if (answer.questionId === 'q1-current-approach') {
        if (option.id === 'hope-for-best') approach = 'gentle'
        else if (option.id === 'focus-intensely') approach = 'focused'
        else if (option.id === 'grand-plans') approach = 'structured'
        else if (option.id === 'balance-everything') approach = 'balanced'
      }
    }
  })

  // Find the pillar with highest score (most problematic = least focused)
  const leastFocusedPillar = Object.entries(pillarScores)
    .reduce((a, b) => pillarScores[a[0] as PillarType] > pillarScores[b[0] as PillarType] ? a : b)[0] as PillarType

  return {
    leastFocusedPillar,
    preferredMotivation: motivationStyle,
    preferredTiming: timing,
    approach,
    recommendedTimeCommitment: '5-10 minutes'
  }
}

// Suggested habits based on pillar and preferences
export const PILLAR_HABIT_SUGGESTIONS: Record<PillarType, Array<{
  name: string
  icon: string
  timeCommitment: string[]
  timing: string[]
  description: string
}>> = {
  mental: [
    {
      name: 'Morning meditation',
      icon: '🧘‍♂️',
      timeCommitment: ['5-10 minutes', '15-30 minutes'],
      timing: ['morning'],
      description: 'Start your day with mindful breathing'
    },
    {
      name: 'Gratitude journaling',
      icon: '📝',
      timeCommitment: ['5-10 minutes', '15-30 minutes'],
      timing: ['evening', 'morning'],
      description: 'Write 3 things you\'re grateful for'
    },
    {
      name: 'Daily reading',
      icon: '📚',
      timeCommitment: ['15-30 minutes', '45-60 minutes'],
      timing: ['evening', 'flexible'],
      description: 'Read for personal growth and learning'
    }
  ],
  physical: [
    {
      name: 'Morning walk',
      icon: '🚶‍♂️',
      timeCommitment: ['15-30 minutes', '45-60 minutes'],
      timing: ['morning'],
      description: 'Get your body moving with fresh air'
    },
    {
      name: 'Drink water',
      icon: '💧',
      timeCommitment: ['5-10 minutes'],
      timing: ['throughout-day', 'morning'],
      description: 'Stay hydrated throughout the day'
    },
    {
      name: 'Evening stretches',
      icon: '🤸‍♀️',
      timeCommitment: ['5-10 minutes', '15-30 minutes'],
      timing: ['evening'],
      description: 'Relax your muscles before bed'
    }
  ],
  social: [
    {
      name: 'Talk to a friend',
      icon: '📞',
      timeCommitment: ['15-30 minutes', '45-60 minutes'],
      timing: ['evening', 'flexible'],
      description: 'Connect with someone you care about'
    },
    {
      name: 'Quality time with family',
      icon: '👥',
      timeCommitment: ['15-30 minutes'],
      timing: ['evening', 'throughout-day'],
      description: 'Spend quality time with family'
    },
    {
      name: 'Appreciate a close one',
      icon: '💌',
      timeCommitment: ['5-10 minutes'],
      timing: ['throughout-day', 'evening'],
      description: 'Let someone know you appreciate them'
    }
  ],
  intellectual: [
    {
      name: 'Learn something new',
      icon: '🎓',
      timeCommitment: ['15-30 minutes', '45-60 minutes'],
      timing: ['evening', 'flexible'],
      description: 'Dedicate time to skill development'
    },
    {
      name: 'Creative practice',
      icon: '🎨',
      timeCommitment: ['15-30 minutes', '45-60 minutes'],
      timing: ['evening', 'flexible'],
      description: 'Express yourself through creativity'
    },
    {
      name: 'Plan tomorrow',
      icon: '📋',
      timeCommitment: ['5-10 minutes', '15-30 minutes'],
      timing: ['evening'],
      description: 'Set intentions for the next day'
    }
  ]
}
