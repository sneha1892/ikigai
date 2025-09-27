export interface Toast {
  id: string
  type: 'success' | 'error' | 'warning' | 'info'
  title: string
  message?: string
  duration?: number
}

export type ToastListener = (toasts: Toast[]) => void

class ToastService {
  private static instance: ToastService
  private toasts: Toast[] = []
  private listeners: ToastListener[] = []
  private nextId = 1

  private constructor() {}

  public static getInstance(): ToastService {
    if (!ToastService.instance) {
      ToastService.instance = new ToastService()
    }
    return ToastService.instance
  }

  public subscribe(listener: ToastListener): () => void {
    this.listeners.push(listener)
    // Immediately call with current toasts
    listener(this.toasts)
    
    // Return unsubscribe function
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener)
    }
  }

  private notify() {
    this.listeners.forEach(listener => listener(this.toasts))
  }

  public addToast(toast: Omit<Toast, 'id'>): string {
    const id = `toast-${this.nextId++}`
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? 5000
    }

    this.toasts.push(newToast)
    this.notify()

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      setTimeout(() => {
        this.removeToast(id)
      }, newToast.duration)
    }

    return id
  }

  public removeToast(id: string) {
    this.toasts = this.toasts.filter(toast => toast.id !== id)
    this.notify()
  }

  public clearAll() {
    this.toasts = []
    this.notify()
  }

  // Convenience methods
  public success(title: string, message?: string, duration?: number) {
    return this.addToast({ type: 'success', title, message, duration })
  }

  public error(title: string, message?: string, duration?: number) {
    return this.addToast({ type: 'error', title, message, duration: duration ?? 7000 })
  }

  public warning(title: string, message?: string, duration?: number) {
    return this.addToast({ type: 'warning', title, message, duration })
  }

  public info(title: string, message?: string, duration?: number) {
    return this.addToast({ type: 'info', title, message, duration })
  }
}

export const toastService = ToastService.getInstance()
