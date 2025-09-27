import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { 
  type User, 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut as firebaseSignOut 
} from 'firebase/auth'
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc } from 'firebase/firestore'
import { auth, googleProvider, db } from '../config/firebase'
import type { OnboardingState, QuizResults } from '../types'

interface AuthContextType {
  user: User | null
  loading: boolean
  onboardingState: OnboardingState | null
  onboardingLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  completeOnboarding: (results: QuizResults) => Promise<void>
  skipOnboarding: () => Promise<void>
  resetAccount: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [onboardingState, setOnboardingState] = useState<OnboardingState | null>(null)
  const [onboardingLoading, setOnboardingLoading] = useState(true)

  // Load onboarding state when user changes
  useEffect(() => {
    const loadOnboardingState = async (userId: string) => {
      try {
        setOnboardingLoading(true)
        const onboardingDoc = await getDoc(doc(db, 'users', userId, 'profile', 'onboarding'))
        
        if (onboardingDoc.exists()) {
          setOnboardingState(onboardingDoc.data() as OnboardingState)
        } else {
          // New user - set default onboarding state
          const defaultState: OnboardingState = {
            completed: false,
            currentStep: 'welcome'
          }
          setOnboardingState(defaultState)
        }
      } catch (error) {
        console.error('Error loading onboarding state:', error)
        // Set default state on error
        setOnboardingState({
          completed: false,
          currentStep: 'welcome'
        })
      } finally {
        setOnboardingLoading(false)
      }
    }

    if (user) {
      loadOnboardingState(user.uid)
    } else {
      setOnboardingState(null)
      setOnboardingLoading(false)
    }
  }, [user])

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user)
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider)
    } catch (error) {
      console.error('Error signing in with Google:', error)
      throw error
    }
  }

  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Error signing out:', error)
      throw error
    }
  }

  const completeOnboarding = async (results: QuizResults) => {
    if (!user) return

    try {
      const completedState: OnboardingState = {
        completed: true,
        currentStep: 'complete',
        quizResults: results
      }

      await setDoc(doc(db, 'users', user.uid, 'profile', 'onboarding'), completedState)
      setOnboardingState(completedState)
    } catch (error) {
      console.error('Error saving onboarding results:', error)
      throw error
    }
  }

  const skipOnboarding = async () => {
    if (!user) return

    try {
      const skippedState: OnboardingState = {
        completed: true,
        currentStep: 'complete'
      }

      await setDoc(doc(db, 'users', user.uid, 'profile', 'onboarding'), skippedState)
      setOnboardingState(skippedState)
    } catch (error) {
      console.error('Error skipping onboarding:', error)
      throw error
    }
  }

  const resetAccount = async () => {
    if (!user) return

    try {
      // Delete all user tasks
      const tasksSnapshot = await getDocs(collection(db, 'users', user.uid, 'tasks'))
      const deletePromises = tasksSnapshot.docs.map(doc => deleteDoc(doc.ref))
      await Promise.all(deletePromises)

      // Delete all user goals (if they exist)
      try {
        const goalsSnapshot = await getDocs(collection(db, 'users', user.uid, 'goals'))
        const deleteGoalsPromises = goalsSnapshot.docs.map(doc => deleteDoc(doc.ref))
        await Promise.all(deleteGoalsPromises)
      } catch (error) {
        // Goals collection might not exist yet, that's okay
        console.log('Goals collection not found, skipping...')
      }

      // Reset onboarding state
      const resetState: OnboardingState = {
        completed: false,
        currentStep: 'welcome'
      }

      await setDoc(doc(db, 'users', user.uid, 'profile', 'onboarding'), resetState)
      setOnboardingState(resetState)

      console.log('Account reset successfully')
    } catch (error) {
      console.error('Error resetting account:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    onboardingState,
    onboardingLoading,
    signInWithGoogle,
    signOut,
    completeOnboarding,
    skipOnboarding,
    resetAccount
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
