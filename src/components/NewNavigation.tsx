import React from 'react'
import { CheckSquare, Calendar, Mountain } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'

interface NewNavigationProps {
  currentPage: 'habits-tasks' | 'day-plan' | 'goals'
  onPageChange: (page: 'habits-tasks' | 'day-plan' | 'goals') => void
}

function NewNavigation({ currentPage, onPageChange }: NewNavigationProps) {
  const { colors } = useTheme()
  
  const navStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceElevated,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '0',
    borderTop: `1px solid ${colors.borderSubtle}`,
    zIndex: 50
  }
  
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '0 12px',
    gap: '0'
  }

  const buttonStyles = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    padding: '8px 12px',
    borderRadius: '10px',
    background: 'none',
    border: 'none',
    color: isActive ? '#10B981' : colors.text.secondary,
    fontSize: '12px',
    fontWeight: '500',
    gap: '4px',
    minWidth: '70px',
    position: 'relative',
    flex: '1 1 0'
  })

  const iconContainerStyles = (isActive: boolean): React.CSSProperties => ({
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '28px',
    height: '28px',
    backgroundColor: 'transparent',
    transition: 'all 0.3s ease',
    marginBottom: '2px',
    borderRadius: '50%',
    boxShadow: isActive ? '0 0 0 2px rgba(16,185,129,0.35), 0 0 18px rgba(16,185,129,0.45)' : 'none'
  })

  const iconColor = (isActive: boolean) => isActive ? '#FFFFFF' : colors.text.secondary

  return (
    <nav style={navStyles} role="tablist" aria-label="Main navigation">
      <div style={containerStyles}>
        {/* Habits & Tasks */}
        <button 
          onClick={() => onPageChange('habits-tasks')}
          style={buttonStyles(currentPage === 'habits-tasks')}
          aria-label="Navigate to Habits & Tasks"
          role="tab"
          aria-selected={currentPage === 'habits-tasks'}
        >
          <div style={iconContainerStyles(currentPage === 'habits-tasks')}>
            <CheckSquare 
              size={16} 
              color={iconColor(currentPage === 'habits-tasks')} 
              strokeWidth={2} 
            />
          </div>
          <span>Habits & Tasks</span>
        </button>

        {/* Day Plan */}
        <button 
          onClick={() => onPageChange('day-plan')}
          style={buttonStyles(currentPage === 'day-plan')}
          aria-label="Navigate to Day Plan"
          role="tab"
          aria-selected={currentPage === 'day-plan'}
        >
          <div style={iconContainerStyles(currentPage === 'day-plan')}>
            <Calendar 
              size={16} 
              color={iconColor(currentPage === 'day-plan')} 
              strokeWidth={2} 
            />
          </div>
          <span>Day Plan</span>
        </button>

        {/* Goals */}
        <button 
          onClick={() => onPageChange('goals')}
          style={buttonStyles(currentPage === 'goals')}
          aria-label="Navigate to Goals"
          role="tab"
          aria-selected={currentPage === 'goals'}
        >
          <div style={iconContainerStyles(currentPage === 'goals')}>
            <Mountain 
              size={16} 
              color={iconColor(currentPage === 'goals')} 
              strokeWidth={2} 
            />
          </div>
          <span>Goals</span>
        </button>
      </div>
    </nav>
  )
}

export default NewNavigation
