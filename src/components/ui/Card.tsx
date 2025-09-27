import React, { forwardRef } from 'react'
import type { HTMLAttributes } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { radius, components } from '../../styles/design-system'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'elevated' | 'outlined' | 'filled'
  padding?: 'sm' | 'md' | 'lg' | 'none'
  interactive?: boolean
  children: React.ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ 
    variant = 'default', 
    padding = 'md', 
    interactive = false,
    children, 
    className = '',
    style,
    onClick,
    ...props 
  }, ref) => {
    const { colors, shadows } = useTheme()
    
    const getVariantStyles = (variant: string) => {
      switch (variant) {
        case 'elevated':
          return {
            backgroundColor: colors.surfaceElevated,
            border: 'none',
            boxShadow: shadows.lg
          }
        
        case 'outlined':
          return {
            backgroundColor: colors.surface,
            border: `1px solid ${colors.border}`,
            boxShadow: 'none'
          }
        
        case 'filled':
          return {
            backgroundColor: colors.surfaceVariant,
            border: 'none',
            boxShadow: 'none'
          }
        
        default:
          return {
            backgroundColor: colors.surface,
            border: `1px solid ${colors.borderSubtle}`,
            boxShadow: shadows.sm
          }
      }
    }
    
    const getPadding = (padding: string) => {
      if (padding === 'none') return '0'
      return components.card.padding[padding as keyof typeof components.card.padding]
    }
    
    const baseStyles: React.CSSProperties = {
      borderRadius: radius.lg,
      padding: getPadding(padding),
      transition: 'all 0.2s ease',
      cursor: interactive || onClick ? 'pointer' : 'default',
      ...getVariantStyles(variant),
      ...style
    }
    
    const [isHovered, setIsHovered] = React.useState(false)
    const [isPressed, setIsPressed] = React.useState(false)
    
    const interactiveStyles = interactive || onClick ? {
      transform: isPressed ? 'scale(0.98)' : isHovered ? 'translateY(-1px)' : 'translateY(0)',
      boxShadow: isHovered && variant !== 'outlined' && variant !== 'filled' 
        ? shadows.md 
        : baseStyles.boxShadow
    } : {}
    
    const dynamicStyles = {
      ...baseStyles,
      ...interactiveStyles
    }
    
    const handleMouseEnter = () => {
      if (interactive || onClick) setIsHovered(true)
    }
    
    const handleMouseLeave = () => {
      if (interactive || onClick) {
        setIsHovered(false)
        setIsPressed(false)
      }
    }
    
    const handleMouseDown = () => {
      if (interactive || onClick) setIsPressed(true)
    }
    
    const handleMouseUp = () => {
      if (interactive || onClick) setIsPressed(false)
    }
    
    return (
      <div
        ref={ref}
        style={dynamicStyles}
        className={className}
        onClick={onClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onMouseDown={handleMouseDown}
        onMouseUp={handleMouseUp}
        {...props}
      >
        {children}
      </div>
    )
  }
)

Card.displayName = 'Card'

// Card sub-components for better composition
export interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, className = '', style, ...props }, ref) => {
    const { colors } = useTheme()
    
    const headerStyles: React.CSSProperties = {
      borderBottom: `1px solid ${colors.borderSubtle}`,
      paddingBottom: '12px',
      marginBottom: '16px',
      ...style
    }
    
    return (
      <div
        ref={ref}
        style={headerStyles}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardHeader.displayName = 'CardHeader'

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode
  level?: 1 | 2 | 3 | 4 | 5 | 6
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, level = 3, className = '', style, ...props }, ref) => {
    const { colors } = useTheme()
    
    const titleStyles: React.CSSProperties = {
      color: colors.text.primary,
      fontSize: level === 1 ? '24px' : level === 2 ? '20px' : level === 3 ? '18px' : '16px',
      fontWeight: 600,
      lineHeight: '1.2',
      margin: 0,
      ...style
    }
    
    const Tag = `h${level}` as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
    
    return React.createElement(
      Tag,
      {
        ref: ref as any,
        style: titleStyles,
        className,
        ...props
      },
      children
    )
  }
)

CardTitle.displayName = 'CardTitle'

export interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ children, className = '', style, ...props }, ref) => {
    const { colors } = useTheme()
    
    const contentStyles: React.CSSProperties = {
      color: colors.text.secondary,
      lineHeight: '1.5',
      ...style
    }
    
    return (
      <div
        ref={ref}
        style={contentStyles}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardContent.displayName = 'CardContent'

export interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, className = '', style, ...props }, ref) => {
    const { colors } = useTheme()
    
    const footerStyles: React.CSSProperties = {
      borderTop: `1px solid ${colors.borderSubtle}`,
      paddingTop: '12px',
      marginTop: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: '8px',
      ...style
    }
    
    return (
      <div
        ref={ref}
        style={footerStyles}
        className={className}
        {...props}
      >
        {children}
      </div>
    )
  }
)

CardFooter.displayName = 'CardFooter'
