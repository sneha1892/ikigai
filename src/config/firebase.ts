// Import the functions you need from the SDKs you need
import { initializeApp } from 'firebase/app'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// Your web app's Firebase configuration
// TODO: Replace with your actual Firebase config
const firebaseConfig = {
    apiKey: "AIzaSyDib9XGtBQdnf6uCjhZwxmLe7PmftNQo6U",
    authDomain: "ikigai-9beaf.firebaseapp.com",
    projectId: "ikigai-9beaf",
    storageBucket: "ikigai-9beaf.firebasestorage.app",
    messagingSenderId: "734483879681",
    appId: "1:734483879681:web:c7753b9428b00aa792ed00"
  };

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()

// Initialize Cloud Firestore and get a reference to the service
export const db = getFirestore(app)

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = getMessaging(app)

// Get FCM registration token
export const getFCMToken = async () => {
  try {
    const token = await getToken(messaging, {
      vapidKey: 'BFEz-a1to5VAsATrR2XW4v-oN5qdNeV6Dag6zME_6jIt3UePyDHUg_qkcydSgB15e6b5vGZoPRanHu86_IQcSpY'
    })
    return token
  } catch (error) {
    console.error('Error getting FCM token:', error)
    return null
  }
}

// Handle foreground messages
onMessage(messaging, (payload) => {
  console.log('Foreground message received:', payload)
  // Let the existing NotificationService handle the display
})

// Suppress Firebase console logs in development
if (import.meta.env.DEV) {
  // Reduce Firebase logging noise during development
  const originalError = console.error
  console.error = (...args) => {
    // Filter out expected Firebase errors during auth transitions
    const message = args[0]?.toString() || ''
    
    if (
      message.includes('WebChannelConnection RPC') ||
      message.includes('transport errored') ||
      message.includes('Failed to get document because the client is offline')
    ) {
      return // Suppress these expected errors
    }
    
    originalError.apply(console, args)
  }
}

export default app
