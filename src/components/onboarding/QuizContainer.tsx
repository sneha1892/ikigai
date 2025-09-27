import { useState } from 'react'
import type { QuizAnswer, QuizResults, Task, Goal } from '../../types'
import { QUIZ_QUESTIONS, analyzeQuizResults } from '../../data/quizQuestions'
import WelcomeScreen from './WelcomeScreen'
import QuizQuestion from './QuizQuestion'
import AddGoalModal from '../AddGoalModal'
import QuickAddModal from '../QuickAddModal'
import { useTheme } from '../../contexts/ThemeContext'

interface QuizContainerProps {
  onComplete: (results: QuizResults, firstGoal?: Omit<Goal, 'id' | 'createdAt'>, firstHabit?: Omit<Task, 'id' | 'completed' | 'createdAt'>) => void
  onSkip: () => void
}

type QuizStep = 'welcome' | 'quiz' | 'completed'

function QuizContainer({ onComplete, onSkip }: QuizContainerProps) {
  const { colors } = useTheme()
  const [currentStep, setCurrentStep] = useState<QuizStep>('welcome')
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<QuizAnswer[]>([])
  const [quizResults, setQuizResults] = useState<QuizResults | null>(null)
  const [showGoalModal, setShowGoalModal] = useState(false)
  const [showHabitModal, setShowHabitModal] = useState(false)
  const [createdGoal, setCreatedGoal] = useState<Omit<Goal, 'id' | 'createdAt'> | null>(null)
  const [toastMessage, setToastMessage] = useState<string | null>(null)

  const handleStartQuiz = () => {
    setCurrentStep('quiz')
  }

  const handleSelectOption = (optionId: string) => {
    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex]
    const newAnswers = answers.filter(a => a.questionId !== currentQuestion.id)
    newAnswers.push({
      questionId: currentQuestion.id,
      selectedOption: optionId
    })
    setAnswers(newAnswers)
  }

  const handleNext = () => {
    if (currentQuestionIndex < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuestionIndex(prev => prev + 1)
    } else {
      // Quiz completed, analyze results and show goal modal
      const analysis = analyzeQuizResults(answers)
      const results: QuizResults = {
        answers,
        ...analysis
      }
      setQuizResults(results)
      setCurrentStep('completed')
      
      // Show goal modal after a brief moment
      setTimeout(() => {
        setShowGoalModal(true)
      }, 500)
    }
  }

  const handleBack = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(prev => prev - 1)
    }
  }


  const showToast = (message: string) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(null), 3000)
  }

  const handleGoalCreated = (goal: Omit<Goal, 'id' | 'createdAt'>) => {
    setCreatedGoal(goal)
    setShowGoalModal(false)
    
    // Show success toast and then habit modal immediately
    showToast("That's a great start! One small habit at a time, you'll reach your goal.")
    
    // Show habit modal immediately instead of waiting
    setShowHabitModal(true)
  }

  const handleHabitCreated = (habit: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    if (quizResults && createdGoal) {
      onComplete(quizResults, createdGoal, habit)
    }
  }

  const handleGoalCancelled = () => {
    // User cancelled goal creation - complete onboarding without goal/habit
    if (quizResults) {
      onComplete(quizResults) // No goal, no habit
    }
  }

  const handleHabitCancelled = () => {
    // User cancelled habit creation - complete onboarding with goal but no habit
    if (quizResults && createdGoal) {
      onComplete(quizResults, createdGoal) // Goal but no habit
    }
  }


  const getDefaultReminderTime = () => {
    if (!quizResults) return '20:00'
    
    switch (quizResults.preferredTiming) {
      case 'morning': return '07:00'
      case 'evening': return '21:00'
      default: return '20:00'
    }
  }

  const getCurrentAnswer = () => {
    const currentQuestion = QUIZ_QUESTIONS[currentQuestionIndex]
    return answers.find(a => a.questionId === currentQuestion.id)?.selectedOption || null
  }

  const canGoNext = () => {
    return getCurrentAnswer() !== null
  }

  const canGoBack = () => {
    return currentQuestionIndex > 0
  }

  // Render current step
  return (
    <>
      {/* Main Content */}
      {currentStep === 'welcome' && (
        <WelcomeScreen 
          onStartQuiz={handleStartQuiz}
          onSkip={onSkip}
        />
      )}

      {currentStep === 'quiz' && (
        <QuizQuestion
          question={QUIZ_QUESTIONS[currentQuestionIndex]}
          selectedOption={getCurrentAnswer()}
          onSelectOption={handleSelectOption}
          onNext={handleNext}
          onBack={handleBack}
          currentQuestion={currentQuestionIndex + 1}
          totalQuestions={QUIZ_QUESTIONS.length}
          canGoNext={canGoNext()}
          canGoBack={canGoBack()}
        />
      )}

      {currentStep === 'completed' && (
        <div style={{
          height: '100vh',
          width: '100vw',
          backgroundColor: colors.background,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '20px',
          overflow: 'auto'
        }}>
          <div style={{
            textAlign: 'center',
            color: colors.text.primary
          }}>
            <div style={{
              fontSize: '4rem',
              marginBottom: '1.5rem'
            }}>
              ✨
            </div>
            <h1 style={{
              fontSize: '2rem',
              fontWeight: '600',
              marginBottom: '1rem',
              color: colors.text.primary
            }}>
              Quiz Complete!
            </h1>
            <p style={{
              fontSize: '1.1rem',
              color: colors.text.secondary
            }}>
              Setting up your personalized experience...
            </p>
          </div>
        </div>
      )}

      {/* Goal Modal */}
      {quizResults && (
        <AddGoalModal
          isOpen={showGoalModal}
          onClose={handleGoalCancelled}
          onAddGoal={handleGoalCreated}
          pillar={quizResults.leastFocusedPillar}
        />
      )}

      {/* Habit Modal */}
      {quizResults && createdGoal && (
        <QuickAddModal
          isOpen={showHabitModal}
          onClose={handleHabitCancelled}
          onAddTask={handleHabitCreated}
          prefilledPillar={quizResults.leastFocusedPillar}
          prefilledGoal={createdGoal}
          prefilledStartTime={getDefaultReminderTime()}
        />
      )}


      {/* Toast Message */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          top: '20px',
          left: '50%',
          transform: 'translateX(-50%)',
          backgroundColor: '#10B981',
          color: '#fff',
          padding: '12px 24px',
          borderRadius: '8px',
          fontSize: '14px',
          fontWeight: '500',
          zIndex: 1001,
          boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)'
        }}>
          {toastMessage}
        </div>
      )}
    </>
  )
}

export default QuizContainer
