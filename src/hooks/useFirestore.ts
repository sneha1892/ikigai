import { useEffect, useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import {
  subscribeToUserTasks,
  subscribeToUserStats,
  subscribeToUserGoals,
  subscribeToUserRoutines,
  addTask as firestoreAddTask,
  updateTask as firestoreUpdateTask,
  deleteTask as firestoreDeleteTask,
  updateUserStats as firestoreUpdateUserStats,
  addGoal as firestoreAddGoal,
  updateGoal as firestoreUpdateGoal,
  deleteGoal as firestoreDeleteGoal,
  addRoutine as firestoreAddRoutine,
  updateRoutine as firestoreUpdateRoutine,
  deleteRoutine as firestoreDeleteRoutine,
  initializeUserData,
  migrateHabitCompletions,
  addModification as firestoreAddModification,
  findAndUpsertModification as firestoreFindAndUpsertModification,
  deleteModification as firestoreDeleteModification,
  subscribeToUserModifications
} from '../services/firestore'
import type { Task, UserStats, Goal, Routine, DailyModification } from '../types'

// Initial user stats for new users
const initialUserStats: UserStats = {
  streak: 0,
  totalPoints: 0,
  level: 1
}

export function useFirestore() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState<Task[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [routines, setRoutines] = useState<Routine[]>([])
  const [dailyModifications, setDailyModifications] = useState<DailyModification[]>([])
  const [userStats, setUserStats] = useState<UserStats>(initialUserStats)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) {
      setTasks([])
      setGoals([])
      setUserStats(initialUserStats)
      setLoading(false)
      return
    }

    let unsubscribeTasks: (() => void) | undefined
    let unsubscribeStats: (() => void) | undefined
    let unsubscribeGoals: (() => void) | undefined
    let unsubscribeRoutines: (() => void) | undefined
    let unsubscribeModifications: (() => void) | undefined
    let isCancelled = false

    const setupListeners = async () => {
      try {
        // Check if effect was cancelled before async operations
        if (isCancelled) return

        // Initialize user data if needed
        await initializeUserData(user.uid, initialUserStats)
        
        // Run habit completions migration
        await migrateHabitCompletions(user.uid)

        // Check again after async operation
        if (isCancelled) return

        // Set up real-time listeners
        unsubscribeTasks = subscribeToUserTasks(user.uid, (newTasks) => {
          if (!isCancelled) {
            setTasks(newTasks)
            setLoading(false)
          }
        })

        unsubscribeStats = subscribeToUserStats(user.uid, (newStats) => {
          if (!isCancelled && newStats) {
            setUserStats(newStats)
          }
        })

        unsubscribeGoals = subscribeToUserGoals(user.uid, (newGoals) => {
          if (!isCancelled) {
            setGoals(newGoals)
          }
        })

        unsubscribeRoutines = subscribeToUserRoutines(user.uid, (newRoutines) => {
          if (!isCancelled) {
            setRoutines(newRoutines)
          }
        })

        unsubscribeModifications = subscribeToUserModifications(user.uid, (newModifications) => {
          if (!isCancelled) {
            setDailyModifications(newModifications)
          }
        })
      } catch (error) {
        if (!isCancelled) {
          console.error('Error setting up listeners:', error)
          setLoading(false)
        }
      }
    }

    setupListeners()

    // Cleanup function
    return () => {
      isCancelled = true
      if (unsubscribeTasks) unsubscribeTasks()
      if (unsubscribeStats) unsubscribeStats()
      if (unsubscribeGoals) unsubscribeGoals()
      if (unsubscribeRoutines) unsubscribeRoutines()
      if (unsubscribeModifications) unsubscribeModifications()
    }
  }, [user])

  // Task operations
  const addTask = async (taskData: Omit<Task, 'id' | 'completed' | 'createdAt'>) => {
    if (!user) return

    try {
      await firestoreAddTask(user.uid, {
        ...taskData,
        completed: false,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Error adding task:', error)
      throw error
    }
  }

  const updateTask = async (taskId: string, updates: Partial<Task>) => {
    if (!user) return

    try {
      await firestoreUpdateTask(user.uid, taskId, updates)
    } catch (error) {
      console.error('Error updating task:', error)
      throw error
    }
  }

  const deleteTask = async (taskId: string) => {
    if (!user) return

    try {
      await firestoreDeleteTask(user.uid, taskId)
    } catch (error) {
      console.error('Error deleting task:', error)
      throw error
    }
  }

  const toggleTask = async (taskId: string, date?: string) => {
    if (!user) return

    const task = tasks.find(t => t.id === taskId)
    if (!task) return

    const isHabit = Boolean(task.challengeDuration || task.repeatFrequency !== 'once')
    const targetDate = date || new Date().toISOString().split('T')[0]
    
    // For habits, prevent marking NEW future dates (but allow unmarking existing ones)
    if (isHabit && date) {
      const today = new Date().toISOString().split('T')[0]
      const targetDateObj = new Date(targetDate + 'T00:00:00')
      const todayObj = new Date(today + 'T00:00:00')
      
      if (targetDateObj > todayObj) {
        const existing = Array.isArray(task.completionDates) ? [...task.completionDates] : []
        const isCurrentlyCompleted = existing.includes(targetDate)
        
        // Only prevent if trying to mark a future date that's not already completed
        if (!isCurrentlyCompleted) {
          console.warn('Cannot mark habit for future date:', targetDate)
          return
        }
      }
    }
    
    try {
      // For habits, toggle completion for the specific date
      let completionDatesUpdate: string[] | undefined = undefined
      let newCompleted: boolean
      
      if (isHabit) {
        const existing = Array.isArray(task.completionDates) ? [...task.completionDates] : []
        const isCompletedOnDate = existing.includes(targetDate)
        const today = new Date().toISOString().split('T')[0]
        
        if (isCompletedOnDate) {
          // Remove the date if it was completed
          completionDatesUpdate = existing.filter(d => d !== targetDate)
        } else {
          // Add the date if it wasn't completed
          completionDatesUpdate = [...existing, targetDate]
        }
        
        // For habits, newCompleted should reflect TODAY's completion status after the update
        newCompleted = completionDatesUpdate.includes(today)
      } else {
        // For regular tasks, just toggle the completed flag
        newCompleted = !task.completed
      }

      // Update the task
      await updateTask(taskId, {
        completed: newCompleted,
        completedAt: newCompleted ? new Date() : undefined,
        ...(completionDatesUpdate !== undefined ? { completionDates: completionDatesUpdate } : {})
      })

      // Update user stats - for habits, base points on the actual action performed
      let pointsChange = 0
      if (isHabit) {
        const existing = Array.isArray(task.completionDates) ? [...task.completionDates] : []
        const wasCompletedOnDate = existing.includes(targetDate)
        pointsChange = wasCompletedOnDate ? -10 : 10 // -10 if we're removing, +10 if we're adding
      } else {
        pointsChange = newCompleted ? 10 : -10
      }
      
      // Allow points to go negative temporarily, then clamp to 0
      const newTotalPoints = Math.max(0, userStats.totalPoints + pointsChange)
      const newStats = {
        ...userStats,
        totalPoints: newTotalPoints
      }

      await updateUserStats(newStats)
    } catch (error) {
      console.error('Error toggling task:', error)
      throw error
    }
  }

  const updateUserStats = async (newStats: UserStats) => {
    if (!user) return

    try {
      await firestoreUpdateUserStats(user.uid, newStats)
    } catch (error) {
      console.error('Error updating user stats:', error)
      throw error
    }
  }

  // Goal operations
  const addGoal = async (goalData: Omit<Goal, 'id' | 'createdAt'>) => {
    if (!user) return

    try {
      await firestoreAddGoal(user.uid, {
        ...goalData,
        createdAt: new Date()
      })
    } catch (error) {
      console.error('Error adding goal:', error)
      throw error
    }
  }

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!user) return

    try {
      await firestoreUpdateGoal(user.uid, goalId, updates)
    } catch (error) {
      console.error('Error updating goal:', error)
      throw error
    }
  }

  const deleteGoal = async (goalId: string) => {
    if (!user) return

    try {
      await firestoreDeleteGoal(user.uid, goalId)
    } catch (error) {
      console.error('Error deleting goal:', error)
      throw error
    }
  }

  // Routine operations
  const addRoutine = async (routineData: Omit<Routine, 'id'>) => {
    if (!user) return
    try {
      await firestoreAddRoutine(user.uid, routineData)
    } catch (error) {
      console.error('Error adding routine:', error)
      throw error
    }
  }

  const updateRoutine = async (routineId: string, updates: Partial<Routine>) => {
    if (!user) return
    try {
      await firestoreUpdateRoutine(user.uid, routineId, updates)
    } catch (error) {
      console.error('Error updating routine:', error)
      throw error
    }
  }

  const deleteRoutine = async (routineId: string) => {
    if (!user) return
    try {
      await firestoreDeleteRoutine(user.uid, routineId)
    } catch (error) {
      console.error('Error deleting routine:', error)
      throw error
    }
  }

  // Modification operations
  const addModification = async (modificationData: Omit<DailyModification, 'id'>) => {
    if (!user) {
      return;
    }
    try {
      const newModification = await firestoreFindAndUpsertModification(user.uid, modificationData);
      
      // Optimistically update local state for immediate UI feedback
      setDailyModifications(prev => {
        // Find if a modification for this item already exists by its ID
        const existingIndex = prev.findIndex(m => m.id === newModification.id);
        
        if (existingIndex > -1) {
          // If it exists, update it in the array
          const updatedMods = [...prev];
          updatedMods[existingIndex] = newModification;
          return updatedMods;
        } else {
          // If it's new, add it to the array
          return [...prev, newModification];
        }
      });
    } catch (error) {
      console.error('Error adding modification:', error)
      throw error
    }
  }

  const deleteModification = async (modificationId: string) => {
    if (!user) return
    try {
      await firestoreDeleteModification(user.uid, modificationId)
    } catch (error) {
      console.error('Error deleting modification:', error)
      throw error
    }
  }

  return {
    tasks,
    goals,
    routines,
    dailyModifications,
    userStats,
    loading,
    addTask,
    updateTask,
    deleteTask,
    toggleTask,
    updateUserStats,
    addGoal,
    updateGoal,
    deleteGoal,
    addRoutine,
    updateRoutine,
    deleteRoutine,
    addModification,
    deleteModification
  }
}
