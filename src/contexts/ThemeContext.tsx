import { createContext, useContext, useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import type { ThemeMode } from '../styles/design-system'
import type { ThemeName } from '../styles/design-system'
import { getThemeColors, getThemeShadows } from '../styles/design-system'

interface ThemeContextType {
  theme: ThemeMode
  themeName: ThemeName
  setThemeName: (name: ThemeName) => void
  toggleTheme: () => void
  colors: ReturnType<typeof getThemeColors>
  shadows: ReturnType<typeof getThemeShadows>
  isDark: boolean
  isLight: boolean
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

interface ThemeProviderProps {
  children: ReactNode
}

const THEME_STORAGE_KEY = 'ikigai-theme'
const THEME_NAME_STORAGE_KEY = 'ikigai-theme-name'

// Helper function to get initial theme
const getInitialTheme = (): ThemeMode => {
  // Check localStorage first
  const savedTheme = localStorage.getItem(THEME_STORAGE_KEY) as ThemeMode | null
  if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
    return savedTheme
  }
  
  // Fall back to system preference
  if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark'
  }
  
  // Default to light theme
  return 'light'
}

export function ThemeProvider({ children }: ThemeProviderProps) {
  const [theme, setTheme] = useState<ThemeMode>(getInitialTheme)
  const getInitialThemeName = (): ThemeName => {
    const saved = (localStorage.getItem(THEME_NAME_STORAGE_KEY) as ThemeName | null)
    if (saved === 'default' || saved === 'md3' || saved === 'neumorphism' || saved === 'highContrast' || saved === 'earthy') {
      return saved
    }
    return 'default'
  }
  const [themeName, setThemeName] = useState<ThemeName>(getInitialThemeName)
  
  // Update colors and shadows when theme changes
  const colors = getThemeColors(theme, themeName)
  const shadows = getThemeShadows(theme, themeName)
  const isDark = theme === 'dark'
  const isLight = theme === 'light'
  
  // Toggle theme function
  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
  }
  
  // Update theme name
  const updateThemeName = (name: ThemeName) => {
    setThemeName(name)
  }
  
  // Persist theme to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_STORAGE_KEY, theme)
  }, [theme])
  
  // Persist theme name to localStorage
  useEffect(() => {
    localStorage.setItem(THEME_NAME_STORAGE_KEY, themeName)
  }, [themeName])
  
  // Apply theme to document root for CSS variables
  useEffect(() => {
    const root = document.documentElement
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark')
    
    // Add current theme class
    root.classList.add(theme)
    root.setAttribute('data-theme-name', themeName)
    
    // Set CSS custom properties for easy access in CSS
    root.style.setProperty('--bg-background', colors.background)
    root.style.setProperty('--bg-surface', colors.surface)
    root.style.setProperty('--bg-surface-elevated', colors.surfaceElevated)
    root.style.setProperty('--bg-surface-variant', colors.surfaceVariant)
    
    root.style.setProperty('--text-primary', colors.text.primary)
    root.style.setProperty('--text-secondary', colors.text.secondary)
    root.style.setProperty('--text-tertiary', colors.text.tertiary)
    root.style.setProperty('--text-quaternary', colors.text.quaternary)
    root.style.setProperty('--text-accent', colors.text.accent)
    
    root.style.setProperty('--border-default', colors.border)
    root.style.setProperty('--border-subtle', colors.borderSubtle)
    
    // Interactive states
    root.style.setProperty('--bg-hover', colors.hover)
    root.style.setProperty('--bg-pressed', colors.pressed)
    root.style.setProperty('--bg-selected', colors.selected)
    
    // Shadow scale variables for utilities
    root.style.setProperty('--shadow-sm', shadows.sm)
    root.style.setProperty('--shadow-md', shadows.md)
    root.style.setProperty('--shadow-lg', shadows.lg)
    root.style.setProperty('--shadow-xl', shadows.xl)
    root.style.setProperty('--shadow-2xl', shadows['2xl'])
    
    // Update meta theme-color for mobile browsers
    const metaThemeColor = document.querySelector('meta[name="theme-color"]')
    if (metaThemeColor) {
      metaThemeColor.setAttribute('content', colors.background)
    } else {
      const meta = document.createElement('meta')
      meta.name = 'theme-color'
      meta.content = colors.background
      document.getElementsByTagName('head')[0].appendChild(meta)
    }
    
    // Update body background for smooth transitions
    document.body.style.backgroundColor = colors.background
    document.body.style.color = colors.text.primary
    
  }, [theme, themeName, colors, shadows])
  
  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    
    const handleSystemThemeChange = (e: MediaQueryListEvent) => {
      // Only auto-switch if user hasn't manually set a preference
      const savedTheme = localStorage.getItem(THEME_STORAGE_KEY)
      if (!savedTheme) {
        setTheme(e.matches ? 'dark' : 'light')
      }
    }
    
    mediaQuery.addEventListener('change', handleSystemThemeChange)
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange)
    }
  }, [])
  
  const value: ThemeContextType = {
    theme,
    themeName,
    setThemeName: updateThemeName,
    toggleTheme,
    colors,
    shadows,
    isDark,
    isLight
  }
  
  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextType {
  const context = useContext(ThemeContext)
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider')
  }
  return context
}
