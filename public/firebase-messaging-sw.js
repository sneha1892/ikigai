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
    requireInteraction: true,
    data: {
      url: payload.data?.url || '/'  // Add URL data to notification
    }
  }

  self.registration.showNotification(notificationTitle, notificationOptions)
})

// Add notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event)
  
  event.notification.close()  // Close the notification
  
  // Get the URL to open (default to app root)
  const urlToOpen = event.notification.data?.url || '/'
  
  // This handles opening the app or focusing an existing window
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // Check if there's already a window open
        for (const client of clientList) {
          if (client.url.includes(self.registration.scope) && 'focus' in client) {
            return client.focus()
          }
        }
        // If no window is open, open a new one
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})
