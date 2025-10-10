import { useState, useEffect } from 'react'
import TopHeader from './components/TopHeader'
import NewNavigation from './components/NewNavigation'
import DayPlan from './pages/DayPlan'
import HabitsAndTasks from './pages/HabitsAndTasks'
import Goals from './pages/Goals'
import Settings from './pages/Settings'
import Login from './pages/Login'
import Onboarding from './pages/Onboarding'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider, useTheme } from './contexts/ThemeContext'
import { useFirestore } from './hooks/useFirestore'
import { notificationService } from './services/notificationService'
import { toastService } from './services/toastService'
import ToastContainer from './components/ToastContainer'
// Voice UI removed
// import VoiceInput from './components/VoiceInput'
// import { aiService } from './services/aiService'
import type { Task, QuizResults, Goal } from './types'
// import type { VoiceResponse } from './types/ai'
import './App.css'

// Main authenticated app component
function AuthenticatedApp() {
  const { onboardingState, onboardingLoading, completeOnboarding, skipOnboarding } = useAuth()
  const { tasks, goals, routines, dailyModifications, userStats, loading, addTask, updateTask, deleteTask, toggleTask, addGoal, updateGoal, deleteGoal, addRoutine, updateRoutine, deleteRoutine, addModification } = useFirestore()

  // Voice AI wiring removed
  const { colors } = useTheme()
  const [currentPage, setCurrentPage] = useState<'habits-tasks' | 'day-plan' | 'goals'>('day-plan') // Default to center page
  const [showSettings, setShowSettings] = useState(false)
  const [pointsAnimating, setPointsAnimating] = useState(false)
  const [previousPage, setPreviousPage] = useState<'habits-tasks' | 'day-plan' | 'goals'>('day-plan')

  // Setup notifications when tasks change
  useEffect(() => {
    if (!loading && tasks.length > 0) {
      notificationService.rescheduleAllTasks(tasks)
    }
  }, [tasks, loading])

  const handleToggleTask = async (taskId: string, date?: string) => {
    try {
      const task = tasks.find(t => t.id === taskId)
      if (task && !task.completed) {
        // Trigger points animation for task completion
        setPointsAnimating(true)
        setTimeout(() => setPointsAnimating(false), 800)
      }
      await toggleTask(taskId, date)
    } catch (error) {
      console.error('Failed to toggle task:', error)
      toastService.error('Failed to update task', 'Please try again.')
    }
  }

  const handleAddTask = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    try {
      await addTask(taskData)
      toastService.success('Task added successfully!', `"${taskData.name}" has been added to your ${taskData.pillar} habits.`)
      // Notification will be scheduled when the task appears in the tasks array via useEffect
    } catch (error) {
      console.error('Failed to add task:', error)
      toastService.error('Failed to add task', 'Please try again.')
    }
  }

  const handleAddGoal = async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    try {
      await addGoal(goalData)
      toastService.success('Goal added successfully!', `"${goalData.title}" has been added to your goals.`)
    } catch (error) {
      console.error('Failed to add goal:', error)
      toastService.error('Failed to add goal', 'Please try again.')
    }
  }

  const handleEditGoal = async (goalId: string, goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    try {
      await updateGoal(goalId, goalData)
      toastService.success('Goal updated successfully!', `"${goalData.title}" has been updated.`)
    } catch (error) {
      console.error('Failed to edit goal:', error)
      toastService.error('Failed to edit goal', 'Please try again.')
    }
  }

  const handleDeleteGoal = async (goalId: string) => {
    try {
      await deleteGoal(goalId)
      toastService.success('Goal deleted', 'The goal has been removed from your list.')
    } catch (error) {
      console.error('Failed to delete goal:', error)
      toastService.error('Failed to delete goal', 'Please try again.')
    }
  }

  // Voice command handlers removed

  const handleEditTask = async (taskId: string, taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    try {
      // Clear old reminder before updating
      notificationService.clearTaskReminder(taskId)
      await updateTask(taskId, taskData)
      // Notification will be rescheduled when the task updates in the tasks array via useEffect
    } catch (error) {
      console.error('Failed to edit task:', error)
      toastService.error('Failed to edit task', 'Please try again.')
    }
  }

  const handleDeleteTask = async (taskId: string) => {
    try {
      // Clear reminder before deleting
      notificationService.clearTaskReminder(taskId)
      await deleteTask(taskId)
      toastService.success('Task deleted', 'The task has been removed from your habits.')
    } catch (error) {
      console.error('Failed to delete task:', error)
      toastService.error('Failed to delete task', 'Please try again.')
    }
  }

  const handleCompleteOnboarding = async (
    results: QuizResults, 
    firstGoal?: Omit<Goal, 'id' | 'createdAt'>, 
    firstHabit?: Omit<Task, 'id' | 'completed' | 'createdAt'>
  ) => {
    try {
      await completeOnboarding(results)
      
      // Add goal if created during onboarding
      if (firstGoal) {
        await addGoal(firstGoal)
      }
      
      // If user created a first habit, add it to their tasks
      if (firstHabit) {
        await addTask(firstHabit)
      }

      // Always navigate to home page after onboarding completion
      setCurrentPage('day-plan')
    } catch (error) {
      console.error('Failed to complete onboarding:', error)
    }
  }

  const handleSkipOnboarding = async () => {
    try {
      await skipOnboarding()
      // Always navigate to home page after skipping onboarding
      setCurrentPage('day-plan')
    } catch (error) {
      console.error('Failed to skip onboarding:', error)
    }
  }

  // Show loading spinner while data is loading
  if (loading || onboardingLoading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.surfaceVariant}`,
          borderTop: `3px solid ${colors.text.accent}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  // Show onboarding if user hasn't completed it
  if (onboardingState && !onboardingState.completed) {
    return (
      <Onboarding 
        onComplete={handleCompleteOnboarding}
        onSkip={handleSkipOnboarding}
      />
    )
  }

  // Show settings modal
  if (showSettings) {
    return (
      <div style={{ height: '100vh', width: '100vw' }}>
        <Settings />
        <button
          onClick={() => {
            setShowSettings(false)
            setCurrentPage(previousPage)
          }}
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: colors.surface,
            border: `1px solid ${colors.borderSubtle}`,
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: colors.text.primary,
            zIndex: 1000
          }}
        >
          ✕
        </button>
      </div>
    )
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'habits-tasks':
        return (
          <HabitsAndTasks 
            tasks={tasks}
            userStats={userStats}
            goals={goals}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddGoal={addGoal}
          />
        )
      
      case 'day-plan':
        return (
          <DayPlan 
            tasks={tasks}
            userStats={userStats}
            goals={goals}
            routines={routines}
            dailyModifications={dailyModifications}
            onToggleTask={handleToggleTask}
            onAddTask={handleAddTask}
            onEditTask={handleEditTask}
            onDeleteTask={handleDeleteTask}
            onAddGoal={handleAddGoal}
            onAddRoutine={(r)=>addRoutine(r)}
            onEditRoutine={(id, r)=>updateRoutine(id, r)}
            onDeleteRoutine={deleteRoutine}
            onAddModification={addModification}
          />
        )
      
      case 'goals':
        return (
          <Goals 
            tasks={tasks}
            goals={goals}
            onAddGoal={handleAddGoal}
            onEditGoal={handleEditGoal}
            onDeleteGoal={handleDeleteGoal}
            onEditTask={handleEditTask}
          />
        )
      
      default:
        return null
    }
  }

  return (
    <div style={{ 
      height: '100vh', 
      width: '100vw',
      display: 'flex',
      flexDirection: 'column',
      backgroundColor: colors.background,
      overflow: 'hidden'
    }}>
      <TopHeader 
        userStats={userStats}
        onSettingsClick={() => {
          setPreviousPage(currentPage)
          setShowSettings(true)
        }}
        pointsAnimating={pointsAnimating}
      />
      <div 
        className="scrollbar-hidden"
        style={{ 
          flex: 1, 
          overflow: 'auto',
          paddingBottom: '0'
        }}
      >
        {renderPage()}
      </div>
      <NewNavigation 
        currentPage={currentPage} 
        onPageChange={setCurrentPage}
      />
        <ToastContainer />
      </div>
    )
  }

// App router component that handles authentication
function AppRouter() {
  const { user, loading } = useAuth()
  const { colors } = useTheme()

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        width: '100vw',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: colors.background
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: `3px solid ${colors.surfaceVariant}`,
          borderTop: `3px solid ${colors.text.accent}`,
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }} />
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </div>
    )
  }

  return user ? <AuthenticatedApp /> : <Login />
}

// Main App component with providers
function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <AppRouter />
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App