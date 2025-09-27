import React from 'react'
import { motion } from 'framer-motion'
import { Settings, Flame, Star } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import type { UserStats } from '../types'

interface TopHeaderProps {
  userStats: UserStats
  onSettingsClick: () => void
  pointsAnimating?: boolean
}

function TopHeader({ userStats, onSettingsClick, pointsAnimating = false }: TopHeaderProps) {
  const { colors, theme } = useTheme()
  
  const headerStyles: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceElevated,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '8px 16px',
    boxShadow: theme === 'dark' 
      ? '0px 2px 12px rgba(0, 0, 0, 0.15)' 
      : '0px 2px 12px rgba(0, 0, 0, 0.08)',
    borderBottom: `1px solid ${colors.borderSubtle}`,
    zIndex: 100,
    height: '48px'
  }

  const containerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    maxWidth: '400px'
  }

  const statsContainerStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    flex: 1,
    justifyContent: 'center'
  }

  const statItemStyles: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    backgroundColor: colors.surface,
    borderRadius: '16px',
    padding: '4px 10px',
    border: `1px solid ${colors.borderSubtle}`
  }

  const settingsButtonStyles: React.CSSProperties = {
    background: 'none',
    border: 'none',
    color: colors.text.primary,
    cursor: 'pointer',
    padding: '6px',
    borderRadius: '50%',
    transition: 'all 0.3s ease',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: '12px'
  }

  return (
    <header style={headerStyles}>
      <div style={containerStyles}>
        <div style={statsContainerStyles}>
          {/* Streak */}
          <div 
            style={{
              ...statItemStyles,
              border: `1px solid ${colors.accent.warning}`
            }}
          >
            <Flame size={16} color={colors.accent.warning} />
            <span style={{
              fontSize: '13px',
              fontWeight: 600,
              color: colors.accent.warning
            }}>
              {userStats.streak} Day Streak
            </span>
          </div>

          {/* Points */}
          <motion.div
            animate={{ 
              scale: pointsAnimating ? [1, 1.08, 1] : 1,
              backgroundColor: pointsAnimating ? ['transparent', `${colors.accent.primary}20`, 'transparent'] : 'transparent'
            }}
            transition={{ 
              duration: 0.8,
              ease: 'easeOut'
            }}
            style={{
              ...statItemStyles,
              border: `1px solid ${colors.accent.primary}`
            }}
          >
            <Star size={16} color={colors.accent.primary} />
            <span style={{ fontSize: '13px', fontWeight: 600, color: colors.accent.primary }}>
              {userStats.totalPoints} Points
            </span>
          </motion.div>
        </div>

        {/* Settings Button */}
        <button
          onClick={onSettingsClick}
          style={settingsButtonStyles}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = colors.hover
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent'
          }}
          aria-label="Open Settings"
        >
          <Settings size={18} />
        </button>
      </div>
    </header>
  )
}

export default TopHeader
