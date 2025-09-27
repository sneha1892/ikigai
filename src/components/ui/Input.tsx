import React, { forwardRef } from 'react'
import type { InputHTMLAttributes } from 'react'
import { useTheme } from '../../contexts/ThemeContext'
import { radius, components, animations } from '../../styles/design-system'

export interface InputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'size'> {
  variant?: 'default' | 'filled' | 'outlined'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  helperText?: string
  error?: string
  icon?: React.ReactNode
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    variant = 'default',
    size = 'md',
    label,
    helperText,
    error,
    icon,
    iconPosition = 'left',
    fullWidth = false,
    className = '',
    style,
    disabled,
    ...props 
  }, ref) => {
    const { colors } = useTheme()
    const [isFocused, setIsFocused] = React.useState(false)
    
    const getVariantStyles = (variant: string, isFocused: boolean, hasError: boolean) => {
      const baseStyles = {
        backgroundColor: disabled ? colors.surfaceVariant : colors.surface,
        border: `1px solid ${hasError ? '#EF4444' : isFocused ? colors.text.accent : colors.border}`,
        borderRadius: radius.sm,
        transition: `all ${animations.duration.fast} ${animations.easing.default}`,
        outline: 'none'
      }
      
      switch (variant) {
        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: disabled ? colors.surfaceVariant : colors.surfaceVariant,
            border: 'none',
            borderBottom: `2px solid ${hasError ? '#EF4444' : isFocused ? colors.text.accent : colors.border}`,
            borderRadius: `${radius.sm} ${radius.sm} 0 0`
          }
        
        case 'outlined':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            border: `2px solid ${hasError ? '#EF4444' : isFocused ? colors.text.accent : colors.border}`
          }
        
        default:
          return baseStyles
      }
    }
    
    const inputStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      height: components.input.height[size],
      padding: icon 
        ? iconPosition === 'left' 
          ? '0 12px 0 40px' 
          : '0 40px 0 12px'
        : '0 12px',
      fontSize: size === 'sm' ? '14px' : size === 'lg' ? '16px' : '15px',
      fontFamily: 'inherit',
      color: colors.text.primary,
      ...getVariantStyles(variant, isFocused, !!error),
      ...style
    }
    
    const containerStyles: React.CSSProperties = {
      position: 'relative',
      width: fullWidth ? '100%' : 'auto'
    }
    
    const labelStyles: React.CSSProperties = {
      display: 'block',
      fontSize: '14px',
      fontWeight: 500,
      color: error ? '#EF4444' : colors.text.primary,
      marginBottom: '6px'
    }
    
    const helperTextStyles: React.CSSProperties = {
      fontSize: '12px',
      color: error ? '#EF4444' : colors.text.tertiary,
      marginTop: '4px',
      lineHeight: '1.4'
    }
    
    const iconStyles: React.CSSProperties = {
      position: 'absolute',
      top: '50%',
      transform: 'translateY(-50%)',
      [iconPosition === 'left' ? 'left' : 'right']: '12px',
      color: error ? '#EF4444' : isFocused ? colors.text.accent : colors.text.tertiary,
      pointerEvents: 'none',
      transition: `color ${animations.duration.fast} ${animations.easing.default}`
    }
    
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }
    
    return (
      <div style={containerStyles} className={className}>
        {label && (
          <label style={labelStyles}>
            {label}
          </label>
        )}
        
        <div style={{ position: 'relative' }}>
          <input
            ref={ref}
            style={inputStyles}
            disabled={disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            {...props}
          />
          
          {icon && (
            <div style={iconStyles}>
              {icon}
            </div>
          )}
        </div>
        
        {(helperText || error) && (
          <div style={helperTextStyles}>
            {error || helperText}
          </div>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

// Textarea component
export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'filled' | 'outlined'
  label?: string
  helperText?: string
  error?: string
  fullWidth?: boolean
  resize?: boolean
}

export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    variant = 'default',
    label,
    helperText,
    error,
    fullWidth = false,
    resize = true,
    className = '',
    style,
    disabled,
    rows = 4,
    ...props 
  }, ref) => {
    const { colors } = useTheme()
    const [isFocused, setIsFocused] = React.useState(false)
    
    const getVariantStyles = (variant: string, isFocused: boolean, hasError: boolean) => {
      const baseStyles = {
        backgroundColor: disabled ? colors.surfaceVariant : colors.surface,
        border: `1px solid ${hasError ? '#EF4444' : isFocused ? colors.text.accent : colors.border}`,
        borderRadius: radius.sm,
        transition: `all ${animations.duration.fast} ${animations.easing.default}`,
        outline: 'none'
      }
      
      switch (variant) {
        case 'filled':
          return {
            ...baseStyles,
            backgroundColor: disabled ? colors.surfaceVariant : colors.surfaceVariant,
            border: 'none',
            borderBottom: `2px solid ${hasError ? '#EF4444' : isFocused ? colors.text.accent : colors.border}`,
            borderRadius: `${radius.sm} ${radius.sm} 0 0`
          }
        
        case 'outlined':
          return {
            ...baseStyles,
            backgroundColor: 'transparent',
            border: `2px solid ${hasError ? '#EF4444' : isFocused ? colors.text.accent : colors.border}`
          }
        
        default:
          return baseStyles
      }
    }
    
    const textareaStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto',
      minHeight: `${rows * 24}px`,
      padding: '12px',
      fontSize: '15px',
      fontFamily: 'inherit',
      color: colors.text.primary,
      resize: resize ? 'vertical' : 'none',
      ...getVariantStyles(variant, isFocused, !!error),
      ...style
    }
    
    const containerStyles: React.CSSProperties = {
      width: fullWidth ? '100%' : 'auto'
    }
    
    const labelStyles: React.CSSProperties = {
      display: 'block',
      fontSize: '14px',
      fontWeight: 500,
      color: error ? '#EF4444' : colors.text.primary,
      marginBottom: '6px'
    }
    
    const helperTextStyles: React.CSSProperties = {
      fontSize: '12px',
      color: error ? '#EF4444' : colors.text.tertiary,
      marginTop: '4px',
      lineHeight: '1.4'
    }
    
    const handleFocus = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(true)
      props.onFocus?.(e)
    }
    
    const handleBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
      setIsFocused(false)
      props.onBlur?.(e)
    }
    
    return (
      <div style={containerStyles} className={className}>
        {label && (
          <label style={labelStyles}>
            {label}
          </label>
        )}
        
        <textarea
          ref={ref}
          style={textareaStyles}
          disabled={disabled}
          rows={rows}
          onFocus={handleFocus}
          onBlur={handleBlur}
          {...props}
        />
        
        {(helperText || error) && (
          <div style={helperTextStyles}>
            {error || helperText}
          </div>
        )}
      </div>
    )
  }
)

Textarea.displayName = 'Textarea'
