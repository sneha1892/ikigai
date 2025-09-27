import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { CheckCircle, XCircle, AlertTriangle, Info, X } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { toastService, type Toast } from '../services/toastService'

function ToastContainer() {
  const { colors } = useTheme()
  const [toasts, setToasts] = useState<Toast[]>([])

  useEffect(() => {
    const unsubscribe = toastService.subscribe(setToasts)
    return unsubscribe
  }, [])

  const getToastIcon = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle size={20} />
      case 'error':
        return <XCircle size={20} />
      case 'warning':
        return <AlertTriangle size={20} />
      case 'info':
        return <Info size={20} />
    }
  }

  const getToastColors = (type: Toast['type']) => {
    switch (type) {
      case 'success':
        return {
          background: colors.accent.success,
          border: colors.accent.success,
          icon: '#FFFFFF'
        }
      case 'error':
        return {
          background: colors.accent.error,
          border: colors.accent.error,
          icon: '#FFFFFF'
        }
      case 'warning':
        return {
          background: colors.accent.warning,
          border: colors.accent.warning,
          icon: '#FFFFFF'
        }
      case 'info':
        return {
          background: colors.accent.secondary,
          border: colors.accent.secondary,
          icon: '#FFFFFF'
        }
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: '20px',
        right: '20px',
        zIndex: 9999,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        maxWidth: '400px',
        width: '100%'
      }}
    >
      <AnimatePresence>
        {toasts.map((toast) => {
          const toastColors = getToastColors(toast.type)
          
          return (
            <motion.div
              key={toast.id}
              initial={{ opacity: 0, y: -50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.9 }}
              transition={{
                duration: 0.3,
                ease: [0.4, 0, 0.2, 1]
              }}
              style={{
                backgroundColor: colors.surfaceElevated,
                borderRadius: '12px',
                padding: '16px',
                border: `2px solid ${toastColors.border}`,
                boxShadow: `0 4px 12px rgba(0, 0, 0, 0.15)`,
                display: 'flex',
                alignItems: 'flex-start',
                gap: '12px',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {/* Color accent bar */}
              <div
                style={{
                  position: 'absolute',
                  left: 0,
                  top: 0,
                  bottom: 0,
                  width: '4px',
                  backgroundColor: toastColors.background
                }}
              />
              
              {/* Icon */}
              <div style={{ 
                color: toastColors.icon,
                backgroundColor: toastColors.background,
                borderRadius: '50%',
                padding: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                minWidth: '36px',
                height: '36px'
              }}>
                {getToastIcon(toast.type)}
              </div>
              
              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <h4 style={{
                  color: colors.text.primary,
                  fontSize: '16px',
                  fontWeight: '600',
                  margin: '0 0 4px 0',
                  lineHeight: '1.3'
                }}>
                  {toast.title}
                </h4>
                {toast.message && (
                  <p style={{
                    color: colors.text.secondary,
                    fontSize: '14px',
                    margin: 0,
                    lineHeight: '1.4'
                  }}>
                    {toast.message}
                  </p>
                )}
              </div>
              
              {/* Close button */}
              <button
                onClick={() => toastService.removeToast(toast.id)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: colors.text.tertiary,
                  cursor: 'pointer',
                  padding: '4px',
                  borderRadius: '4px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  transition: 'all 0.2s ease'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.hover
                  e.currentTarget.style.color = colors.text.primary
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                  e.currentTarget.style.color = colors.text.tertiary
                }}
              >
                <X size={16} />
              </button>
              
              {/* Progress bar for auto-dismiss */}
              {toast.duration && toast.duration > 0 && (
                <motion.div
                  initial={{ width: '100%' }}
                  animate={{ width: '0%' }}
                  transition={{ 
                    duration: toast.duration / 1000,
                    ease: 'linear'
                  }}
                  style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    height: '3px',
                    backgroundColor: toastColors.background,
                    opacity: 0.7
                  }}
                />
              )}
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}

export default ToastContainer
