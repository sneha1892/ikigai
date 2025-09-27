import React from 'react'
import { Home, BarChart3, Settings } from 'lucide-react'
import { useTheme } from '../contexts/ThemeContext'
import { spacing, animations } from '../styles/design-system'

interface NavigationProps {
  currentPage: 'home' | 'review' | 'settings'
  onPageChange: (page: 'home' | 'review' | 'settings') => void
}

function Navigation({ currentPage, onPageChange }: NavigationProps) {
  const { colors } = useTheme()
  
  const navStyles: React.CSSProperties = {
    position: 'fixed',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.surfaceElevated,
    display: 'flex',
    justifyContent: 'center',
    padding: `${spacing[2]} 0 ${spacing[5]} 0`,
    boxShadow: `0px -2px 12px rgba(0, 0, 0, ${colors === colors ? '0.15' : '0.3'})`,
    borderTop: `1px solid ${colors.borderSubtle}`,
    zIndex: 50
  }
  
  const containerStyles: React.CSSProperties = {
    display: 'flex',
    gap: spacing[10],
    maxWidth: '400px',
    width: '100%',
    justifyContent: 'space-around',
    padding: `0 ${spacing[5]}`
  }
  
  const getButtonStyles = (isActive: boolean): React.CSSProperties => ({
    background: 'none',
    border: 'none',
    color: isActive ? colors.text.accent : colors.text.tertiary,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: spacing[1],
    cursor: 'pointer',
    transition: `all ${animations.duration.normal} ${animations.easing.default}`,
    padding: spacing[2],
    borderRadius: '8px',
    outline: 'none',
    minWidth: '60px'
  })
  
  const NavButton = ({ 
    page, 
    icon: Icon, 
    label 
  }: { 
    page: 'home' | 'review' | 'settings'
    icon: typeof Home
    label: string 
  }) => {
    const isActive = currentPage === page
    const [isHovered, setIsHovered] = React.useState(false)
    
    const buttonStyles = {
      ...getButtonStyles(isActive),
      backgroundColor: isHovered ? colors.hover : 'transparent',
      transform: isActive ? 'scale(1.05)' : 'scale(1)'
    }
    
    return (
      <button 
        onClick={() => onPageChange(page)}
        style={buttonStyles}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        aria-label={`Navigate to ${label}`}
        role="tab"
        aria-selected={isActive}
      >
        <Icon size={22} strokeWidth={isActive ? 2.5 : 2} />
        <span className="text-caption-1" style={{ 
          fontWeight: isActive ? 600 : 400,
          color: 'inherit'
        }}>
          {label}
        </span>
      </button>
    )
  }
  
  return (
    <nav style={navStyles} role="tablist" aria-label="Main navigation">
      <div style={containerStyles}>
        <NavButton page="home" icon={Home} label="Home" />
        <NavButton page="review" icon={BarChart3} label="Review" />
        <NavButton page="settings" icon={Settings} label="Settings" />
      </div>
    </nav>
  )
}

export default Navigation