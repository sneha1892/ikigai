importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-app-compat.js')
importScripts('https://www.gstatic.com/firebasejs/10.0.0/firebase-messaging-compat.js')

firebase.initializeApp({
  apiKey: "AIzaSyDib9XGtBQdnf6uCjhZwxmLe7PmftNQo6U",
  authDomain: "ikigai-9beaf.firebaseapp.com",
  projectId: "ikigai-9beaf",
  storageBucket: "ikigai-9beaf.firebasestorage.app",
  messagingSenderId: "734483879681",
  appId: "1:734483879681:web:c7753b9428b00aa792ed00"
})

const messaging = firebase.messaging()

messaging.onBackgroundMessage((payload) => {
  console.log('Background message received:', payload)
  
  const notificationTitle = payload.notification?.title || 'Ikigai Reminder'
  const notificationOptions = {
    body: payload.notification?.body || "No thinking! Do it!",
    icon: '/ikigai-logo.png',
    badge: '/ikigai-logo.png',
    tag: 'ikigai-notification',
    requireInteraction: true
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})
