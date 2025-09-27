import React from 'react'
import { Sun, Moon } from 'lucide-react'
import { useTheme } from '../../contexts/ThemeContext'
import { animations } from '../../styles/design-system'

interface ThemeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  showLabels?: boolean
  className?: string
}

export function ThemeToggle({ size = 'md', showLabels = false, className = '' }: ThemeToggleProps) {
  const { toggleTheme, colors, isDark } = useTheme()
  
  // Size configurations
  const sizeConfig = {
    sm: {
      width: '44px',
      height: '24px',
      thumbSize: '20px',
      iconSize: 14,
      gap: '8px'
    },
    md: {
      width: '52px',
      height: '28px',
      thumbSize: '24px',
      iconSize: 16,
      gap: '12px'
    },
    lg: {
      width: '60px',
      height: '32px',
      thumbSize: '28px',
      iconSize: 18,
      gap: '16px'
    }
  }
  
  const config = sizeConfig[size]
  
  const toggleStyle: React.CSSProperties = {
    position: 'relative',
    width: config.width,
    height: config.height,
    backgroundColor: isDark ? colors.accent.primary : colors.border,
    borderRadius: '9999px',
    cursor: 'pointer',
    transition: `all ${animations.duration.normal} ${animations.easing.default}`,
    border: 'none',
    outline: 'none',
    padding: '2px',
    display: 'flex',
    alignItems: 'center',
    boxShadow: isDark 
      ? `inset 0 1px 3px rgba(0, 0, 0, 0.3), 0 1px 2px rgba(0, 0, 0, 0.2)`
      : `inset 0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.05)`,
  }
  
  const thumbStyle: React.CSSProperties = {
    width: config.thumbSize,
    height: config.thumbSize,
    backgroundColor: colors.surface,
    borderRadius: '50%',
    transform: isDark ? `translateX(calc(${config.width} - ${config.thumbSize} - 4px))` : 'translateX(0)',
    transition: `all ${animations.duration.normal} ${animations.easing.spring}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.2), 0 1px 2px rgba(0, 0, 0, 0.1)',
    color: isDark ? colors.accent.primary : colors.text.tertiary,
    position: 'absolute',
    top: '2px',
    left: '2px'
  }
  
  const containerStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: config.gap,
    userSelect: 'none'
  }
  
  const labelStyle: React.CSSProperties = {
    fontSize: size === 'sm' ? '14px' : size === 'md' ? '15px' : '16px',
    fontWeight: 500,
    color: colors.text.secondary,
    transition: `color ${animations.duration.normal} ${animations.easing.default}`,
    minWidth: size === 'sm' ? '32px' : size === 'md' ? '36px' : '40px'
  }
  
  const activeLabelStyle: React.CSSProperties = {
    ...labelStyle,
    color: colors.text.primary,
    fontWeight: 600
  }
  
  return (
    <div style={containerStyle} className={className}>
      {showLabels && (
        <span style={!isDark ? activeLabelStyle : labelStyle}>
          Light
        </span>
      )}
      
      <button
        onClick={toggleTheme}
        style={toggleStyle}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1)'
        }}
        onMouseDown={(e) => {
          e.currentTarget.style.transform = 'scale(0.98)'
        }}
        onMouseUp={(e) => {
          e.currentTarget.style.transform = 'scale(1.02)'
        }}
        aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
        role="switch"
        aria-checked={isDark}
      >
        <div style={thumbStyle}>
          {isDark ? (
            <Moon size={config.iconSize} strokeWidth={2.5} />
          ) : (
            <Sun size={config.iconSize} strokeWidth={2.5} />
          )}
        </div>
      </button>
      
      {showLabels && (
        <span style={isDark ? activeLabelStyle : labelStyle}>
          Dark
        </span>
      )}
    </div>
  )
}

// Alternative compact version for inline use
export function CompactThemeToggle({ className = '' }: { className?: string }) {
  const { toggleTheme, colors, isDark } = useTheme()
  
  const buttonStyle: React.CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '40px',
    height: '40px',
    borderRadius: '12px',
    backgroundColor: colors.surfaceVariant,
    border: 'none',
    cursor: 'pointer',
    transition: `all ${animations.duration.normal} ${animations.easing.default}`,
    color: colors.text.secondary,
    outline: 'none'
  }
  
  return (
    <button
      onClick={toggleTheme}
      style={buttonStyle}
      className={className}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = colors.hover
        e.currentTarget.style.color = colors.text.primary
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = colors.surfaceVariant
        e.currentTarget.style.color = colors.text.secondary
      }}
      onMouseDown={(e) => {
        e.currentTarget.style.backgroundColor = colors.pressed
      }}
      aria-label={`Switch to ${isDark ? 'light' : 'dark'} theme`}
    >
      {isDark ? <Moon size={18} strokeWidth={2} /> : <Sun size={18} strokeWidth={2} />}
    </button>
  )
}
