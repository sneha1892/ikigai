import React, { forwardRef } from 'react'
import type { ButtonHTMLAttributes } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { spacing, radius, animations, components } from '../../styles/design-system'

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  fullWidth?: boolean
  loading?: boolean
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false, 
    loading = false,
    icon,
    iconPosition = 'left',
    children, 
    disabled, 
    className = '',
    style,
    ...props 
  }, ref) => {
    const { colors, shadows } = useTheme()
    
    const getVariantStyles = (variant: string, isPressed: boolean = false) => {
      switch (variant) {
        case 'primary':
          return {
            backgroundColor: isPressed ? '#059669' : colors.text.accent,
            color: '#FFFFFF',
            border: 'none',
            boxShadow: shadows.sm
          }
        
        case 'secondary':
          return {
            backgroundColor: isPressed ? colors.pressed : colors.surfaceVariant,
            color: colors.text.primary,
            border: `1px solid ${colors.border}`,
            boxShadow: 'none'
          }
        
        case 'tertiary':
          return {
            backgroundColor: isPressed ? colors.pressed : colors.surface,
            color: colors.text.primary,
            border: `1px solid ${colors.border}`,
            boxShadow: 'none'
          }
        
        case 'ghost':
          return {
            backgroundColor: isPressed ? colors.pressed : 'transparent',
            color: colors.text.secondary,
            border: 'none',
            boxShadow: 'none'
          }
        
        case 'destructive':
          return {
            backgroundColor: isPressed ? '#B91C1C' : '#DC2626',
            color: '#FFFFFF',
            border: 'none',
            boxShadow: shadows.sm
          }
        
        default:
          return {
            backgroundColor: colors.text.accent,
            color: '#FFFFFF',
            border: 'none',
            boxShadow: shadows.sm
          }
      }
    }
    
    const baseStyles: React.CSSProperties = {
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      fontFamily: 'inherit',
      fontSize: size === 'sm' ? '14px' : size === 'lg' ? '16px' : size === 'xl' ? '17px' : '15px',
      fontWeight: 600,
      lineHeight: '1',
      borderRadius: size === 'sm' ? radius.sm : size === 'lg' ? radius.md : radius.sm,
      height: components.button.height[size],
      padding: components.button.padding[size],
      width: fullWidth ? '100%' : 'auto',
      cursor: disabled || loading ? 'not-allowed' : 'pointer',
      transition: `all ${animations.duration.fast} ${animations.easing.default}`,
      outline: 'none',
      userSelect: 'none',
      opacity: disabled || loading ? 0.6 : 1,
      position: 'relative',
      overflow: 'hidden',
      ...getVariantStyles(variant),
      ...style
    }
    
    const [isPressed, setIsPressed] = React.useState(false)
    const [isHovered, setIsHovered] = React.useState(false)
    
    const handleMouseDown = () => setIsPressed(true)
    const handleMouseUp = () => setIsPressed(false)
    const handleMouseLeave = () => {
      setIsPressed(false)
      setIsHovered(false)
    }
    const handleMouseEnter = () => setIsHovered(true)
    
    const dynamicStyles = {
      ...baseStyles,
      ...getVariantStyles(variant, isPressed),
      transform: isPressed ? 'scale(0.98)' : isHovered ? 'scale(1.02)' : 'scale(1)'
    }
    
    const LoadingSpinner = () => (
      <div
        style={{
          width: '16px',
          height: '16px',
          border: '2px solid transparent',
          borderTop: '2px solid currentColor',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}
      />
    )
    
    return (
      <>
        <button
          ref={ref}
          style={dynamicStyles}
          className={className}
          disabled={disabled || loading}
          onMouseDown={handleMouseDown}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseLeave}
          onMouseEnter={handleMouseEnter}
          {...props}
        >
          {loading && <LoadingSpinner />}
          {!loading && icon && iconPosition === 'left' && icon}
          {!loading && children}
          {!loading && icon && iconPosition === 'right' && icon}
        </button>
        
        <style>
          {`
            @keyframes spin {
              0% { transform: rotate(0deg); }
              100% { transform: rotate(360deg); }
            }
          `}
        </style>
      </>
    )
  }
)

Button.displayName = 'Button'
