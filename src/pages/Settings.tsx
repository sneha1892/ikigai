import { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { useTheme } from '../contexts/ThemeContext'
import type { ThemeName } from '../styles/design-system'
import { ThemeToggle } from '../components/ui/ThemeToggle'
import { Button } from '../components/ui/Button'
import { notificationService } from '../services/notificationService'
import { 
  User, 
  Bell, 
  Palette, 
  Trash2, 
  LogOut, 
  Shield,
  Info,
  MessageCircle
} from 'lucide-react'

function Settings() {
  const { user, signOut, resetAccount } = useAuth()
  const { colors, themeName, setThemeName } = useTheme()
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [isResetting, setIsResetting] = useState(false)
  const [notificationStatus, setNotificationStatus] = useState(
    notificationService.getPermissionStatus()
  )

  const handleSignOut = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Sign out failed:', error)
    }
  }

  const handleResetAccount = async () => {
    try {
      setIsResetting(true)
      await resetAccount()
      setShowResetConfirm(false)
    } catch (error) {
      console.error('Account reset failed:', error)
    } finally {
      setIsResetting(false)
    }
  }

  const handleNotificationPermission = async () => {
    const granted = await notificationService.requestPermission()
    setNotificationStatus(notificationService.getPermissionStatus())
    
    if (granted) {
      // Test notification
      await notificationService.testNotification()
    }
  }

  const getNotificationStatusText = () => {
    switch (notificationStatus) {
      case 'granted':
        return 'Enabled'
      case 'denied':
        return 'Blocked'
      default:
        return 'Not Set'
    }
  }

  const getNotificationStatusColor = () => {
    switch (notificationStatus) {
      case 'granted':
        return colors.accent.success
      case 'denied':
        return colors.accent.error
      default:
        return colors.text.tertiary
    }
  }

  return (
    <div style={{
      boxSizing: 'border-box',
      minHeight: '100vh',
      width: '100%',
      maxWidth: '720px',
      margin: '0 auto',
      backgroundColor: colors.background,
      color: colors.text.primary,
      padding: '16px',
      overflowX: 'hidden',
      overflowY: 'auto'
    }}>
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <h1 style={{
          fontSize: '24px',
          fontWeight: '600',
          marginBottom: '8px',
          color: colors.text.primary
        }}>
          Settings
        </h1>
        <p style={{
          color: colors.text.tertiary,
          fontSize: '14px'
        }}>
          Manage your account and app preferences
        </p>
      </div>

      {/* User Profile Section */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '12px',
        border: `1px solid ${colors.borderSubtle}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <User size={20} color={colors.text.primary} />
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text.primary,
            margin: 0
          }}>
            Account
          </h2>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          padding: '10px',
          backgroundColor: colors.surfaceVariant,
          borderRadius: '10px',
          marginBottom: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
            {user?.photoURL && (
              <img
                src={user.photoURL}
                alt="Profile"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  objectFit: 'cover'
                }}
              />
            )}
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text.primary,
                margin: '0 0 2px 0'
              }}>
                {user?.displayName || 'User'}
              </p>
              <p style={{
                fontSize: '12px',
                color: colors.text.tertiary,
                margin: 0
              }}>
                {user?.email}
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            icon={<LogOut size={14} />}
          >
            Sign Out
          </Button>
        </div>
      </div>

      {/* Appearance Section */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '12px',
        border: `1px solid ${colors.borderSubtle}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <Palette size={20} color={colors.text.primary} />
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text.primary,
            margin: 0
          }}>
            Appearance
          </h2>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          backgroundColor: colors.surfaceVariant,
          borderRadius: '10px'
        }}>
          <div>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.text.primary,
              margin: '0 0 2px 0'
            }}>
              Theme
            </p>
{/*}            <p style={{
              fontSize: '13px',
              color: colors.text.tertiary,
              margin: 0
            }}>
              Switch between light and dark modes
            </p>*/}
          </div>
          <ThemeToggle />
        </div>
        {/* Theme Variant Selector */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          backgroundColor: colors.surfaceVariant,
          borderRadius: '10px',
          marginTop: '10px'
        }}>
          <div>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.text.primary,
              margin: '0 0 2px 0'
            }}>
              Theme Style
            </p>
{/*}            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              margin: 0
            }}>
              Default, Material 3, Neumorphism, High Contrast, Earthy
            </p>*/}
          </div>
          <select
            value={themeName}
            onChange={(e) => setThemeName(e.target.value as ThemeName)}
            style={{
              backgroundColor: colors.surface,
              color: colors.text.primary,
              border: `1px solid ${colors.border}`,
              borderRadius: '8px',
              padding: '8px 10px',
              outline: 'none',
              cursor: 'pointer'
            }}
          >
            <option value="default">Default</option>
            <option value="md3">Material 3</option>
            <option value="neumorphism">Neumorphism</option>
            <option value="highContrast">High Contrast</option>
            <option value="earthy">Earthy</option>
          </select>
        </div>
      </div>

      
      {/* Notifications Section */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '12px',
        border: `1px solid ${colors.borderSubtle}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <Bell size={20} color={colors.text.primary} />
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text.primary,
            margin: 0
          }}>
            Notifications
          </h2>
        </div>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '10px',
          backgroundColor: colors.surfaceVariant,
          borderRadius: '10px',
          marginBottom: notificationStatus === 'granted' ? '8px' : '0'
        }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.text.primary,
              margin: '0 0 2px 0'
            }}>
              Push Notifications
            </p>
{/*}            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              margin: 0
            }}>
              Get reminded about your habits
            </p>*/}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <span style={{
              fontSize: '12px',
              fontWeight: '500',
              color: getNotificationStatusColor()
            }}>
              {getNotificationStatusText()}
            </span>
            {notificationStatus !== 'granted' && (
              <Button
                size="sm"
                onClick={handleNotificationPermission}
              >
                Enable
              </Button>
            )}
          </div>
        </div>

        {notificationStatus === 'granted' && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => notificationService.testNotification()}
            style={{ marginTop: '8px' }}
          >
            Test Notification
          </Button>
        )}
      </div>

      {/* Data & Privacy Section */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '12px',
        border: `1px solid ${colors.borderSubtle}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <Shield size={20} color={colors.text.primary} />
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text.primary,
            margin: 0
          }}>
            Data & Privacy
          </h2>
        </div>
        
        <div style={{
          padding: '10px',
          backgroundColor: colors.surfaceVariant,
          borderRadius: '10px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            justifyContent: 'space-between',
            gap: '10px'
          }}>
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '14px',
                fontWeight: '500',
                color: colors.text.primary,
                margin: '0 0 4px 0'
              }}>
                Reset Account
              </p>
              <p style={{
                fontSize: '12px',
                color: colors.text.tertiary,
                margin: 0,
                lineHeight: '1.4'
              }}>
                Delete all habits, goals, and progress data
              </p>
            </div>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => setShowResetConfirm(true)}
              icon={<Trash2 size={14} />}
              style={{ flexShrink: 0 }}
            >
              Reset
            </Button>
          </div>
        </div>
      </div>

      {/* About Section */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '12px',
        border: `1px solid ${colors.borderSubtle}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <Info size={20} color={colors.text.primary} />
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text.primary,
            margin: 0
          }}>
            About
          </h2>
        </div>
        
        <div style={{
          padding: '10px',
          backgroundColor: colors.surfaceVariant,
          borderRadius: '10px'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '8px'
          }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.text.primary,
              margin: 0
            }}>
              Ikigai Habit Tracker
            </p>
            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              margin: 0,
              fontWeight: '500'
            }}>
              v1.1.0
            </p>
          </div>
          <p style={{
            fontSize: '12px',
            color: colors.text.tertiary,
            margin: 0,
            lineHeight: '1.4'
          }}>
            A holistic habit tracking app based on the Four Pillars of Well-being framework.
          </p>
        </div>
      </div>

      {/* Changelog Section */}
      <div style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '12px',
        border: `1px solid ${colors.borderSubtle}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <Info size={20} color={colors.text.primary} />
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text.primary,
            margin: 0
          }}>
            What's New in v1.1.0
          </h2>
        </div>
        
        <div style={{
          padding: '10px',
          backgroundColor: colors.surfaceVariant,
          borderRadius: '10px'
        }}>
          <ul style={{
            margin: 0,
            paddingLeft: '14px',
            fontSize: '13px',
            color: colors.text.secondary,
            lineHeight: '1.5'
          }}>
            <li style={{ marginBottom: '4px' }}>New 3-page layout: Habits & Tasks, Day Plan, Goals</li>
            <li style={{ marginBottom: '4px' }}>Indicator for Today</li>
            <li style={{ marginBottom: '4px' }}>Removed the option to mark habits done in future dates</li>
            <li style={{ marginBottom: '4px' }}>Added habits have independent mark done</li>
            <li style={{ marginBottom: '4px' }}>Start time input option is added in add from library</li>
            <li style={{ marginBottom: '4px' }}>Notification will now open the app</li>
            <li style={{ marginBottom: '0px' }}>General performance fixes and optimizations</li>
          </ul>
        </div>
      </div>
{/* Feedback Section */}
<div style={{
        backgroundColor: colors.surface,
        borderRadius: '12px',
        padding: '14px',
        marginBottom: '12px',
        border: `1px solid ${colors.borderSubtle}`
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '10px'
        }}>
          <MessageCircle size={20} color={colors.text.primary} />
          <h2 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: colors.text.primary,
            margin: 0
          }}>
            Feedback
          </h2>
        </div>

        <div style={{
          padding: '10px',
          backgroundColor: colors.surfaceVariant,
          borderRadius: '10px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px'
        }}>
          <div style={{ flex: 1 }}>
            <p style={{
              fontSize: '14px',
              fontWeight: '500',
              color: colors.text.primary,
              margin: '0 0 2px 0'
            }}>
              Share your feedback
            </p>
            <p style={{
              fontSize: '12px',
              color: colors.text.tertiary,
              margin: 0
            }}>
              Tell us what to improve or what you love
            </p>
          </div>
          <Button
            size="sm"
            onClick={() => window.open('https://wa.me/919645900341?text=Hi%20Ikigai%20Team%2C%20here%27s%20my%20feedback%3A', '_blank')}
          >
            WhatsApp
          </Button>
        </div>
      </div>

      {/* Reset Confirmation Modal */}
      {showResetConfirm && (
        <>
          {/* Backdrop */}
          <div
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'rgba(0, 0, 0, 0.5)',
              zIndex: 2000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onClick={() => setShowResetConfirm(false)}
          />
          
          {/* Modal */}
          <div
            style={{
              position: 'fixed',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              backgroundColor: colors.surfaceElevated,
              borderRadius: '16px',
              padding: '24px',
              zIndex: 2001,
              minWidth: '320px',
              maxWidth: '400px',
              border: `1px solid ${colors.borderSubtle}`
            }}
          >
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              marginBottom: '16px'
            }}>
              <Trash2 size={24} color={colors.accent.error} />
              <h3 style={{
                color: colors.text.primary,
                fontSize: '20px',
                fontWeight: '600',
                margin: 0
              }}>
                Reset Account
              </h3>
            </div>
            
            <p style={{
              color: colors.text.secondary,
              fontSize: '16px',
              lineHeight: '1.5',
              marginBottom: '24px'
            }}>
              Are you sure you want to reset your account? This will permanently delete:
            </p>
            
            <ul style={{
              color: colors.text.tertiary,
              fontSize: '14px',
              marginBottom: '24px',
              paddingLeft: '20px'
            }}>
              <li>All your habits and tasks</li>
              <li>All your goals and progress</li>
              <li>Your onboarding preferences</li>
              <li>All statistics and streaks</li>
            </ul>
            
            <p style={{
              color: colors.accent.error,
              fontSize: '14px',
              fontWeight: '500',
              marginBottom: '24px'
            }}>
              This action cannot be undone.
            </p>
            
            <div style={{
              display: 'flex',
              gap: '12px'
            }}>
              <Button
                variant="secondary"
                onClick={() => setShowResetConfirm(false)}
                style={{ flex: 1 }}
                disabled={isResetting}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleResetAccount}
                loading={isResetting}
                style={{ flex: 1 }}
              >
                Reset Account
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

export default Settings
