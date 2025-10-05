import type { Task } from '../types'
import { getFCMToken } from '../config/firebase'

export class NotificationService {
  private static instance: NotificationService
  private scheduledNotifications: Map<string, number> = new Map()
  private fcmToken: string | null = null

  private constructor() {
    this.requestPermission()
    this.initializeFCM()
  }

  private async initializeFCM(): Promise<void> {
    try {
      this.fcmToken = await getFCMToken()
      // FCM token is now available for server-side push notifications if needed
    } catch (error) {
      console.error('Failed to initialize FCM:', error)
    }
  }

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService()
    }
    return NotificationService.instance
  }

  public async requestPermission(): Promise<boolean> {
    if (!('Notification' in window)) {
      console.warn('This browser does not support notifications')
      return false
    }

    if (Notification.permission === 'granted') {
      return true
    }

    if (Notification.permission !== 'denied') {
      const permission = await Notification.requestPermission()
      return permission === 'granted'
    }

    return false
  }

  public scheduleTaskReminder(task: Task): void {
    if (!task.hasReminder || !task.reminderTime) return

    // Clear existing notification for this task
    this.clearTaskReminder(task.id)

    const now = new Date()
    let reminderDate: Date

    if (task.repeatFrequency === 'once') {
      // For "once" tasks, use reminderDate if available, otherwise today
      if (task.reminderDate) {
        reminderDate = new Date(task.reminderDate)
        const [hours, minutes] = task.reminderTime.split(':').map(Number)
        reminderDate.setHours(hours, minutes, 0, 0)
      } else {
        // Fallback: use today with the reminder time
        reminderDate = new Date()
        const [hours, minutes] = task.reminderTime.split(':').map(Number)
        reminderDate.setHours(hours, minutes, 0, 0)
        
        // If the time has already passed today, schedule for tomorrow
        if (reminderDate <= now) {
          reminderDate.setDate(reminderDate.getDate() + 1)
        }
      }
    } else {
      // For recurring tasks, schedule for today or next occurrence
      reminderDate = new Date()
      const [hours, minutes] = task.reminderTime.split(':').map(Number)
      reminderDate.setHours(hours, minutes, 0, 0)

      if (task.repeatFrequency === 'daily') {
        // If time has passed today, schedule for tomorrow
        if (reminderDate <= now) {
          reminderDate.setDate(reminderDate.getDate() + 1)
        }
      } else if (task.repeatFrequency === 'custom' && task.customDays) {
        // Find next occurrence based on custom days
        reminderDate = this.getNextCustomDayOccurrence(reminderDate, task.customDays)
      }
    }

    // Don't schedule notifications in the past
    if (reminderDate <= now) return

    const timeUntilReminder = reminderDate.getTime() - now.getTime()
    
    // Schedule the notification
    const timeoutId = window.setTimeout(async () => {
      await this.showNotification(task)
      
      // For recurring tasks, schedule the next occurrence
      if (task.repeatFrequency !== 'once') {
        setTimeout(() => this.scheduleTaskReminder(task), 1000)
      }
    }, timeUntilReminder)

    this.scheduledNotifications.set(task.id, timeoutId)
  }

  private getNextCustomDayOccurrence(baseDate: Date, customDays: string[]): Date {
    const dayMap = {
      sunday: 0, monday: 1, tuesday: 2, wednesday: 3,
      thursday: 4, friday: 5, saturday: 6
    }

    const targetDays = customDays.map(day => dayMap[day as keyof typeof dayMap]).sort()
    const currentDay = baseDate.getDay()
    const now = new Date()

    // If it's today and time hasn't passed, use today
    if (targetDays.includes(currentDay) && baseDate > now) {
      return baseDate
    }

    // Find next target day
    let nextDay = targetDays.find(day => day > currentDay)
    
    if (!nextDay) {
      // No more days this week, get first day of next week
      nextDay = targetDays[0]
      const daysToAdd = 7 - currentDay + nextDay
      baseDate.setDate(baseDate.getDate() + daysToAdd)
    } else {
      // Found a day later this week
      const daysToAdd = nextDay - currentDay
      baseDate.setDate(baseDate.getDate() + daysToAdd)
    }

    return baseDate
  }

  public clearTaskReminder(taskId: string): void {
    const timeoutId = this.scheduledNotifications.get(taskId)
    if (timeoutId) {
      clearTimeout(timeoutId)
      this.scheduledNotifications.delete(taskId)
    }
  }

  public clearAllReminders(): void {
    this.scheduledNotifications.forEach(timeoutId => clearTimeout(timeoutId))
    this.scheduledNotifications.clear()
  }

  private async showNotification(task: Task): Promise<void> {
    if (Notification.permission !== 'granted') return

    const notificationOptions = {
      body: `Your ${task.pillar} habit reminder`,
      icon: '/ikigai-logo.png',
      badge: '/ikigai-logo.png',
      tag: task.id,
      requireInteraction: true,
      data: {
        url: window.location.origin,
        taskId: task.id
      }
    }

    try {
      // Try to use service worker notification first (required for PWA)
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.ready
        await registration.showNotification(`Time for: ${task.name}`, notificationOptions)
      } else {
        // Fallback to basic notification for desktop
        const notification = new Notification(`Time for: ${task.name}`, notificationOptions)
        
        notification.onclick = () => {
          window.focus()
          notification.close()
        }

        setTimeout(() => {
          notification.close()
        }, 30000)
      }
    } catch (error) {
      console.error('Failed to show notification:', error)
    }
  }

  public rescheduleAllTasks(tasks: Task[]): void {
    // Clear all existing notifications
    this.clearAllReminders()
    
    // Schedule notifications for all tasks with reminders
    tasks.forEach(task => {
      if (task.hasReminder && task.reminderTime && !task.completed) {
        this.scheduleTaskReminder(task)
      }
    })
  }

  public isSupported(): boolean {
    return 'Notification' in window
  }

  public getPermissionStatus(): NotificationPermission {
    return Notification.permission
  }

  public getFCMToken(): string | null {
    return this.fcmToken
  }

  // Test notification function for debugging
  public async testNotification(): Promise<void> {
    const granted = await this.requestPermission()
    if (granted) {
      const notificationOptions = {
        body: 'This is a test notification from Ikigai',
        icon: '/ikigai-logo.png',
        tag: 'test'
      }

      try {
        // Try to use service worker notification first (required for PWA)
        if ('serviceWorker' in navigator) {
          const registration = await navigator.serviceWorker.ready
          await registration.showNotification('Test Notification', notificationOptions)
        } else {
          // Fallback to basic notification for desktop
          const notification = new Notification('Test Notification', notificationOptions)
          
          notification.onclick = () => {
            window.focus()
            notification.close()
          }
          
          setTimeout(() => {
            notification.close()
          }, 5000)
        }
      } catch (error) {
        console.error('Failed to show test notification:', error)
      }
    }
  }
}

export const notificationService = NotificationService.getInstance()
