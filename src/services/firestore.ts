import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  query, 
  orderBy,
  setDoc,
  getDoc,
  getDocs,
  writeBatch,
  where
} from 'firebase/firestore'
import { db } from '../config/firebase'
import type { Task, UserStats, Goal, Routine, DailyModification } from '../types'

// Collection Functions
export const tasksCollection = (userId: string) => 
  collection(db, 'users', userId, 'tasks')

export const goalsCollection = (userId: string) => 
  collection(db, 'users', userId, 'goals')

// Routines collection
export const routinesCollection = (userId: string) => 
  collection(db, 'users', userId, 'routines')

export const modificationsCollection = (userId: string) =>
  collection(db, 'users', userId, 'dailyModifications')

export const userStatsDoc = (userId: string) => 
  doc(db, 'users', userId, 'profile', 'stats')

// Add a new task
export const addTask = async (userId: string, taskData: Omit<Task, 'id'>) => {
  try {
    // Clean the data to remove undefined values
    const cleanedData = {
      ...taskData,
      createdAt: new Date(),
      userId,
      // Ensure optional fields have default values instead of undefined
      customDays: taskData.customDays || null,
      completedAt: taskData.completedAt || null,
      reminderTime: taskData.reminderTime || null,
      duration: taskData.duration !== undefined ? taskData.duration : null
    }
    
    const docRef = await addDoc(tasksCollection(userId), cleanedData)
    return docRef.id
  } catch (error) {
    console.error('Error adding task:', error)
    throw error
  }
}

// Update a task
export const updateTask = async (userId: string, taskId: string, updates: Partial<Task>) => {
  try {
    const taskRef = doc(tasksCollection(userId), taskId)
    
    // Task data is now handled in useFirestore hook for habit completions
    
    // Clean updates to remove undefined values
    const cleanedUpdates: any = { updatedAt: new Date() }
    
    Object.keys(updates).forEach(key => {
      const value = (updates as any)[key]
      if (value !== undefined) {
        cleanedUpdates[key] = value
      }
    })

    // Note: Habit completion dates are now handled directly in the useFirestore hook
    // to support date-specific completions, so we don't override them here
    
    await updateDoc(taskRef, cleanedUpdates)
  } catch (error) {
    console.error('Error updating task:', error)
    throw error
  }
}

// Delete a task
export const deleteTask = async (userId: string, taskId: string) => {
  try {
    const taskRef = doc(tasksCollection(userId), taskId)
    await deleteDoc(taskRef)
  } catch (error) {
    console.error('Error deleting task:', error)
    throw error
  }
}

// Real-time listener for user tasks
export const subscribeToUserTasks = (
  userId: string, 
  callback: (tasks: Task[]) => void
) => {
  const q = query(
    tasksCollection(userId),
    orderBy('createdAt', 'desc')
  )
  
  return onSnapshot(q, (snapshot) => {
    const tasks: Task[] = []
    snapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      } as Task)
    })
    callback(tasks)
  }, (error) => {
    // Only log errors that aren't permission-related (which happen during sign out)
    if (!error.message.includes('Missing or insufficient permissions')) {
      console.error('Error listening to tasks:', error)
    }
  })
}

// Routines Collection Functions
export const addRoutine = async (userId: string, routineData: Omit<Routine, 'id'>) => {
  try {
    const cleanedData = {
      ...routineData,
      createdAt: new Date(),
      userId
    }
    const docRef = await addDoc(routinesCollection(userId), cleanedData)
    return docRef.id
  } catch (error) {
    console.error('Error adding routine:', error)
    throw error
  }
}

export const updateRoutine = async (userId: string, routineId: string, updates: Partial<Routine>) => {
  try {
    const routineRef = doc(routinesCollection(userId), routineId)
    await updateDoc(routineRef, { ...updates, updatedAt: new Date() })
  } catch (error) {
    console.error('Error updating routine:', error)
    throw error
  }
}

export const deleteRoutine = async (userId: string, routineId: string) => {
  try {
    const routineRef = doc(routinesCollection(userId), routineId)
    await deleteDoc(routineRef)
  } catch (error) {
    console.error('Error deleting routine:', error)
    throw error
  }
}

export const subscribeToUserRoutines = (
  userId: string,
  callback: (routines: Routine[]) => void
) => {
  const q = query(
    routinesCollection(userId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const routines: Routine[] = []
    snapshot.forEach((docItem) => {
      routines.push({ id: docItem.id, ...docItem.data() } as Routine)
    })
    callback(routines)
  }, (error) => {
    if (!error.message.includes('Missing or insufficient permissions')) {
      console.error('Error listening to routines:', error)
    }
  })
}

// Daily Modification Functions
export const addModification = async (userId: string, modificationData: Omit<DailyModification, 'id'>): Promise<DailyModification> => {
  try {
    const dataToSave = { ...modificationData, userId };
    const docRef = await addDoc(modificationsCollection(userId), dataToSave);
    return { id: docRef.id, ...modificationData };
  } catch (error) {
    console.error('Error adding modification:', error);
    throw error;
  }
};

export const findAndUpsertModification = async (userId: string, modificationData: Omit<DailyModification, 'id'>): Promise<DailyModification> => {
  const { date, itemId, itemType, modification } = modificationData;

  const q = query(
    modificationsCollection(userId),
    where('date', '==', date),
    where('itemId', '==', itemId),
    where('itemType', '==', itemType)
  );

  try {
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      // Update existing modification
      const existingDoc = querySnapshot.docs[0];
      await updateDoc(existingDoc.ref, { modification });
      // Return the full, updated document data
      const updatedData = { ...existingDoc.data(), ...modificationData };
      return { id: existingDoc.id, ...updatedData } as DailyModification;
    } else {
      // Add new modification
      const dataToSave = { ...modificationData, userId };
      const docRef = await addDoc(modificationsCollection(userId), dataToSave);
      return { id: docRef.id, ...modificationData };
    }
  } catch (error) {
    console.error('Error finding and upserting modification:', error);
    throw error;
  }
};

export const deleteModification = async (userId: string, modificationId: string) => {
  try {
    const modificationRef = doc(modificationsCollection(userId), modificationId);
    await deleteDoc(modificationRef);
  } catch (error) {
    console.error('Error deleting modification:', error);
    throw error;
  }
};

export const subscribeToUserModifications = (
  userId: string,
  callback: (modifications: DailyModification[]) => void
) => {
  const q = query(
    modificationsCollection(userId)
  );

  return onSnapshot(q, (snapshot) => {
    const modifications: DailyModification[] = [];
    snapshot.forEach((docItem) => {
      modifications.push({ id: docItem.id, ...docItem.data() } as DailyModification);
    });
    callback(modifications);
  }, (error) => {
    if (!error.message.includes('Missing or insufficient permissions')) {
      console.error('Error listening to modifications:', error);
    }
  });
};


// User Stats Functions
export const updateUserStats = async (userId: string, stats: UserStats) => {
  try {
    const statsRef = userStatsDoc(userId)
    await setDoc(statsRef, {
      ...stats,
      updatedAt: new Date()
    }, { merge: true })
  } catch (error) {
    console.error('Error updating user stats:', error)
    throw error
  }
}

export const getUserStats = async (userId: string): Promise<UserStats | null> => {
  try {
    const statsRef = userStatsDoc(userId)
    const doc = await getDoc(statsRef)
    
    if (doc.exists()) {
      return doc.data() as UserStats
    }
    return null
  } catch (error) {
    console.error('Error getting user stats:', error)
    throw error
  }
}

// Real-time listener for user stats
export const subscribeToUserStats = (
  userId: string,
  callback: (stats: UserStats | null) => void
) => {
  const statsRef = userStatsDoc(userId)
  
  return onSnapshot(statsRef, (doc) => {
    if (doc.exists()) {
      callback(doc.data() as UserStats)
    } else {
      callback(null)
    }
  }, (error) => {
    // Only log errors that aren't permission-related (which happen during sign out)
    if (!error.message.includes('Missing or insufficient permissions')) {
      console.error('Error listening to user stats:', error)
    }
  })
}

// Goals Collection Functions
// Add a new goal
export const addGoal = async (userId: string, goalData: Omit<Goal, 'id'>) => {
  try {
    const cleanedData = {
      ...goalData,
      createdAt: new Date(),
      userId
    }
    
    const docRef = await addDoc(goalsCollection(userId), cleanedData)
    return docRef.id
  } catch (error) {
    console.error('Error adding goal:', error)
    throw error
  }
}

// Update a goal
export const updateGoal = async (userId: string, goalId: string, updates: Partial<Goal>) => {
  try {
    const goalRef = doc(goalsCollection(userId), goalId)
    await updateDoc(goalRef, {
      ...updates,
      updatedAt: new Date()
    })
  } catch (error) {
    console.error('Error updating goal:', error)
    throw error
  }
}

// Delete a goal
export const deleteGoal = async (userId: string, goalId: string) => {
  try {
    const goalRef = doc(goalsCollection(userId), goalId)
    await deleteDoc(goalRef)
  } catch (error) {
    console.error('Error deleting goal:', error)
    throw error
  }
}

// Subscribe to user goals
export const subscribeToUserGoals = (
  userId: string, 
  callback: (goals: Goal[]) => void
) => {
  const q = query(
    goalsCollection(userId),
    orderBy('createdAt', 'desc')
  )

  return onSnapshot(q, (snapshot) => {
    const goals: Goal[] = []
    snapshot.forEach((doc) => {
      goals.push({ id: doc.id, ...doc.data() } as Goal)
    })
    callback(goals)
  }, (error) => {
    console.error('Error listening to goals:', error)
  })
}

// Initialize new user data
export const initializeUserData = async (userId: string, initialStats: UserStats) => {
  try {
    // Check if user stats already exist
    const existingStats = await getUserStats(userId)
    
    if (!existingStats) {
      // Create initial user stats
      await updateUserStats(userId, initialStats)
      console.log('User data initialized')
    }
  } catch (error) {
    console.error('Error initializing user data:', error)
    throw error
  }
}

// Migration function to add duration to existing tasks
export const migrateTasksWithDuration = async (userId: string) => {
  try {
    console.log('Starting migration: Adding duration to existing tasks...')
    
    // Get all tasks for the user
    const tasksSnapshot = await getDocs(tasksCollection(userId))
    const batch = writeBatch(db)
    let migrationCount = 0
    
    tasksSnapshot.forEach((docSnapshot) => {
      const taskData = docSnapshot.data()
      
      // Only update tasks that don't have duration field
      if (taskData.duration === undefined) {
        const taskRef = doc(tasksCollection(userId), docSnapshot.id)
        let calculatedDuration = 30; // Default duration

        // Calculate duration from start and end times if they exist
        if (taskData.startTime && taskData.endTime) {
          const [startHours, startMinutes] = taskData.startTime.split(':').map(Number)
          const [endHours, endMinutes] = taskData.endTime.split(':').map(Number)
          const startTotalMinutes = startHours * 60 + startMinutes
          const endTotalMinutes = endHours * 60 + endMinutes
          calculatedDuration = endTotalMinutes - startTotalMinutes
          if (calculatedDuration <= 0) calculatedDuration = 30 // Fallback if calculation is invalid
        }

        batch.update(taskRef, { 
          duration: calculatedDuration,
          migratedAt: new Date() // Track when migration happened
        })
        migrationCount++
      }
    })
    
    if (migrationCount > 0) {
      await batch.commit()
      console.log(`Migration completed: Updated ${migrationCount} tasks with default duration`)
    } else {
      console.log('No tasks needed migration')
    }
    
    return migrationCount
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  }
}

// Migration function to initialize completionDates for existing habits
export const migrateHabitCompletions = async (userId: string) => {
  try {
    console.log('Starting migration: Initializing completionDates for habits...')
    
    // Get all tasks for the user
    const tasksSnapshot = await getDocs(tasksCollection(userId))
    const batch = writeBatch(db)
    let migrationCount = 0
    
    tasksSnapshot.forEach((docSnapshot) => {
      const taskData = docSnapshot.data() as Task
      const isHabit = Boolean(taskData.challengeDuration || taskData.repeatFrequency !== 'once')
      
      // Only update habits that don't have completionDates field
      if (isHabit && !Array.isArray(taskData.completionDates)) {
        const taskRef = doc(tasksCollection(userId), docSnapshot.id)
        
        // If task is currently completed, add today's date
        const completionDates = taskData.completed ? [new Date().toISOString().split('T')[0]] : []
        
        batch.update(taskRef, { 
          completionDates,
          migratedAt: new Date()
        })
        migrationCount++
      }
    })
    
    if (migrationCount > 0) {
      await batch.commit()
      console.log(`Migration completed: Updated ${migrationCount} habits with completionDates`)
    } else {
      console.log('No habits needed migration')
    }
    
    return migrationCount
  } catch (error) {
    console.error('Error during migration:', error)
    throw error
  }
}
