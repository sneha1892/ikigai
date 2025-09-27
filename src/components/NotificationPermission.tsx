import { useState, useEffect } from 'react'
import { Bell, BellOff } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { notificationService } from '../services/notificationService'

interface NotificationPermissionProps {
  onPermissionChange?: (granted: boolean) => void
}

function NotificationPermission({ onPermissionChange }: NotificationPermissionProps) {
  const { colors } = useTheme()
  const [permission, setPermission] = useState<NotificationPermission>('default')
  const [isSupported, setIsSupported] = useState(false)

  useEffect(() => {
    setIsSupported(notificationService.isSupported())
    if (notificationService.isSupported()) {
      setPermission(notificationService.getPermissionStatus())
    }
  }, [])

  const handleRequestPermission = async () => {
    const granted = await notificationService.requestPermission()
    const newPermission = notificationService.getPermissionStatus()
    setPermission(newPermission)
    onPermissionChange?.(granted)
  }

  if (!isSupported) {
    return (
      <div style={{
        padding: '12px 16px',
        backgroundColor: colors.surface,
        border: '1px solid #444',
        borderRadius: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: colors.text.tertiary
        }}>
          <BellOff size={20} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              Notifications not supported
            </div>
            <div style={{ fontSize: '12px', marginTop: '2px' }}>
              Your browser doesn't support notifications
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (permission === 'granted') {
    return (
      <div style={{
        padding: '12px 16px',
        backgroundColor: `rgba(16, 185, 129, 0.1)`,
        border: '1px solid rgba(16, 185, 129, 0.3)',
        borderRadius: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#10B981'
        }}>
          <Bell size={20} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              Notifications enabled
            </div>
            <div style={{ fontSize: '12px', marginTop: '2px', color: colors.text.tertiary }}>
              You'll receive reminders for your habits
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (permission === 'denied') {
    return (
      <div style={{
        padding: '12px 16px',
        backgroundColor: `rgba(239, 68, 68, 0.1)`,
        border: '1px solid rgba(239, 68, 68, 0.3)',
        borderRadius: '12px',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: '#EF4444'
        }}>
          <BellOff size={20} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              Notifications blocked
            </div>
            <div style={{ fontSize: '12px', marginTop: '2px', color: colors.text.tertiary }}>
              Enable in browser settings to receive reminders
            </div>
          </div>
        </div>
      </div>
    )
  }

  // permission === 'default'
  return (
    <div style={{
      padding: '12px 16px',
      backgroundColor: colors.surface,
      border: '1px solid #444',
      borderRadius: '12px',
      marginBottom: '16px'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          color: colors.text.primary
        }}>
          <Bell size={20} />
          <div>
            <div style={{ fontSize: '14px', fontWeight: '500' }}>
              Enable notifications?
            </div>
            <div style={{ fontSize: '12px', marginTop: '2px', color: colors.text.tertiary }}>
              Get reminded when it's time for your habits
            </div>
          </div>
        </div>
        <button
          onClick={handleRequestPermission}
          style={{
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: '#10B981',
            color: '#fff',
            fontSize: '12px',
            fontWeight: '500',
            cursor: 'pointer',
            transition: 'background-color 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#059669'
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = '#10B981'
          }}
        >
          Allow
        </button>
      </div>
    </div>
  )
}

export default NotificationPermission
