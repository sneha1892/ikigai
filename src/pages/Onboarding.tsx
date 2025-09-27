import type { QuizResults, Task, Goal } from '../types'
import QuizContainer from '../components/onboarding/QuizContainer'

interface OnboardingProps {
  onComplete: (results: QuizResults, firstGoal?: Omit<Goal, 'id' | 'createdAt'>, firstHabit?: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onSkip: () => void
}

function Onboarding({ onComplete, onSkip }: OnboardingProps) {
  return (
    <QuizContainer
      onComplete={onComplete}
      onSkip={onSkip}
    />
  )
}

export default Onboarding
