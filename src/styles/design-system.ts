/**
 * Unified Design System for Ikigai App
 * iOS 17 inspired with soft pastel colors, supporting both light and dark themes
 */

export type ThemeMode = 'light' | 'dark'
export type ThemeName = 'default' | 'md3' | 'neumorphism' | 'highContrast' | 'earthy'

// Base color palette - soft pastels with iOS 17 aesthetic
export const colors = {
  // Pillar colors - soft pastels that work in both themes
  mental: {
    light: '#7DD3FC',    // Sky blue
    dark: '#7DD3FC',
    subtle: '#E0F2FE',   // Very light blue
    bg: '#F0F9FF'        // Background tint
  },
  physical: {
    light: '#86EFAC',    // Mint green
    dark: '#86EFAC',
    subtle: '#DCFCE7',   // Very light green
    bg: '#F0FDF4'        // Background tint
  },
  social: {
    light: '#FDBA74',    // Warm orange
    dark: '#FDBA74',
    subtle: '#FED7AA',   // Very light orange
    bg: '#FFFBEB'        // Background tint
  },
  intellectual: {
    light: '#C4B5FD',    // Soft purple
    dark: '#C4B5FD',
    subtle: '#E9D5FF',   // Very light purple
    bg: '#FAF5FF'        // Background tint
  },
  
  // Accent colors
  accent: {
    primary: '#10B981',   // Emerald
    secondary: '#3B82F6', // Blue
    success: '#22C55E',   // Green
    warning: '#F59E0B',   // Amber
    error: '#EF4444',     // Red
  },
  
  // Neutral colors for light theme - modern, elegant aesthetic
  light: {
    // Warm elevated background with pure-white surfaces
    background: '#FAF8F5',
    surface: '#FFFFFF',
    surfaceElevated: '#FFFFFF',
    surfaceVariant: '#F2ECE4',
    
    // Refined, soft text hierarchy
    primary: '#282828',
    secondary: '#6E6E6E',
    tertiary: '#8A8A8A',
    quaternary: '#A7A7A7',
    
    // Softer, warmer borders
    border: '#E6DED2',
    borderSubtle: '#F5EFE7',
    
    // Interactive states with gentle warmth
    hover: '#F4EEE6',
    pressed: '#EBE2D6',
    selected: '#E7F2EE',
    
    // Accent colors – muted dusty teal/sage
    accent: {
      primary: '#2E7D6A',
      secondary: '#5A8FBF',
      success: '#2E7D6A',
      warning: '#C07A00',
      error: '#C84C4C'
    },
    
    // Text colors
    text: {
      primary: '#282828',
      secondary: '#6E6E6E',
      tertiary: '#8A8A8A',
      quaternary: '#A7A7A7',
      inverse: '#FFFFFF',
      accent: '#2E7D6A'
    }
  },
  
  // Neutral colors for dark theme - softer and more refined
  dark: {
    background: '#0F172A',
    surface: '#111827',
    surfaceElevated: '#1F2937',
    surfaceVariant: '#1E293B', // Subtle elevation
    
    primary: '#fafafa',       // Off-white for main text
    secondary: '#a3a3a3',     // Medium gray for secondary text
    tertiary: '#737373',      // Darker gray for tertiary text
    quaternary: '#525252',    // Darker gray for disabled/quaternary
    
    border: '#404040',
    borderSubtle: '#2D2D2D',
    
    // Interactive states
    hover: '#262626',
    pressed: '#2D2D2D',
    selected: '#1E293B',
    
    // Accent colors
    accent: {
      primary: '#10B981',
      secondary: '#3B82F6',
      success: '#22C55E',
      warning: '#F59E0B',
      error: '#EF4444'
    },
    
    // Text colors - refined for better readability
    text: {
      primary: '#fafafa',      // Off-white for main text
      secondary: '#a3a3a3',    // Medium gray for secondary text
      tertiary: '#737373',     // Darker gray for tertiary text
      quaternary: '#525252',   // Darker gray for disabled text
      inverse: '#0F172A',      // Dark text for light backgrounds
      accent: '#10B981'        // Accent color for links/highlights
    }
  }
} as const

// Typography system - iOS 17 inspired
export const typography = {
  // Font families
  fonts: {
    system: ['-apple-system', 'BlinkMacSystemFont', 'SF Pro Display', 'system-ui', 'sans-serif'],
    mono: ['SF Mono', 'Monaco', 'Consolas', 'monospace']
  },
  
  // Font weights
  weights: {
    regular: 400,
    medium: 500,
    semibold: 600,
    bold: 700
  },
  
  // Type scale - iOS 17 inspired
  scale: {
    // Large titles
    largeTitle: {
      fontSize: '34px',
      lineHeight: '41px',
      fontWeight: 700,
      letterSpacing: '-0.5px'
    },
    
    // Headlines
    title1: {
      fontSize: '28px',
      lineHeight: '34px',
      fontWeight: 700,
      letterSpacing: '-0.3px'
    },
    title2: {
      fontSize: '22px',
      lineHeight: '28px',
      fontWeight: 600,
      letterSpacing: '-0.2px'
    },
    title3: {
      fontSize: '20px',
      lineHeight: '25px',
      fontWeight: 600,
      letterSpacing: '-0.1px'
    },
    
    // Headlines
    headline: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: 600,
      letterSpacing: '-0.1px'
    },
    
    // Body text
    body: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: 400,
      letterSpacing: '0px'
    },
    bodyEmphasized: {
      fontSize: '17px',
      lineHeight: '22px',
      fontWeight: 600,
      letterSpacing: '0px'
    },
    
    // Callouts
    callout: {
      fontSize: '16px',
      lineHeight: '21px',
      fontWeight: 400,
      letterSpacing: '0px'
    },
    calloutEmphasized: {
      fontSize: '16px',
      lineHeight: '21px',
      fontWeight: 600,
      letterSpacing: '0px'
    },
    
    // Subheadlines
    subheadline: {
      fontSize: '15px',
      lineHeight: '20px',
      fontWeight: 400,
      letterSpacing: '0px'
    },
    subheadlineEmphasized: {
      fontSize: '15px',
      lineHeight: '20px',
      fontWeight: 600,
      letterSpacing: '0px'
    },
    
    // Footnotes
    footnote: {
      fontSize: '13px',
      lineHeight: '18px',
      fontWeight: 400,
      letterSpacing: '0px'
    },
    footnoteEmphasized: {
      fontSize: '13px',
      lineHeight: '18px',
      fontWeight: 600,
      letterSpacing: '0px'
    },
    
    // Captions
    caption1: {
      fontSize: '12px',
      lineHeight: '16px',
      fontWeight: 400,
      letterSpacing: '0px'
    },
    caption2: {
      fontSize: '11px',
      lineHeight: '13px',
      fontWeight: 400,
      letterSpacing: '0px'
    }
  }
} as const

// Spacing system - 4px base unit
export const spacing = {
  0: '0px',
  1: '4px',
  2: '8px',
  3: '12px',
  4: '16px',
  5: '20px',
  6: '24px',
  7: '28px',
  8: '32px',
  10: '40px',
  12: '48px',
  16: '64px',
  20: '80px',
  24: '96px',
  32: '128px'
} as const

// Border radius system
export const radius = {
  none: '0px',
  xs: '4px',
  sm: '8px',
  md: '12px',
  lg: '16px',
  xl: '20px',
  '2xl': '24px',
  '3xl': '32px',
  full: '9999px'
} as const

// Shadow system - iOS inspired
export const shadows = {
  light: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
  },
  dark: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.3)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.4), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.4), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
  }
} as const

// Animation system
export const animations = {
  duration: {
    fast: '150ms',
    normal: '250ms',
    slow: '350ms',
    slower: '500ms'
  },
  easing: {
    default: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    in: 'cubic-bezier(0.4, 0.0, 1, 1)',
    out: 'cubic-bezier(0.0, 0.0, 0.2, 1)',
    inOut: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    spring: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)'
  }
} as const

// Component-specific design tokens
export const components = {
  button: {
    height: {
      sm: '32px',
      md: '40px',
      lg: '48px',
      xl: '56px'
    },
    padding: {
      sm: '0 12px',
      md: '0 16px',
      lg: '0 20px',
      xl: '0 24px'
    }
  },
  card: {
    padding: {
      sm: spacing[3],
      md: spacing[4],
      lg: spacing[6]
    }
  },
  input: {
    height: {
      sm: '36px',
      md: '44px',
      lg: '52px'
    }
  }
} as const

// Types for derived theme tokens used throughout the app
interface ThemeTextColors {
  primary: string
  secondary: string
  tertiary: string
  quaternary: string
  inverse: string
  accent: string
}

interface ThemeAccentColors {
  primary: string
  secondary: string
  success: string
  warning: string
  error: string
}

export interface ThemePalette {
  background: string
  surface: string
  surfaceElevated: string
  surfaceVariant: string
  primary: string
  secondary: string
  tertiary: string
  quaternary: string
  border: string
  borderSubtle: string
  hover: string
  pressed: string
  selected: string
  accent: ThemeAccentColors
  text: ThemeTextColors
}

export interface ThemeShadowScale {
  sm: string
  md: string
  lg: string
  xl: string
  '2xl': string
}

// Define additional theme presets (by name) for both modes
const themeColorPresets: Record<ThemeName, { light: ThemePalette; dark: ThemePalette }> = {
  default: {
    light: colors.light,
    dark: colors.dark
  },
  md3: {
    // Material Design 3 inspired tokens
    light: {
      background: '#FFFBFE',
      surface: '#FFFBFE',
      surfaceElevated: '#FFFFFF',
      surfaceVariant: '#E7E0EC',
      primary: '#1C1B1F',
      secondary: '#49454F',
      tertiary: '#625B71',
      quaternary: '#79747E',
      border: '#E6E0E9',
      borderSubtle: '#F3EDF7',
      hover: '#F3EDF7',
      pressed: '#E6E0E9',
      selected: '#EADDFF',
      accent: {
        primary: '#6750A4',
        secondary: '#386A20',
        success: '#2E7D32',
        warning: '#B26A00',
        error: '#B3261E'
      },
      text: {
        primary: '#1C1B1F',
        secondary: '#49454F',
        tertiary: '#625B71',
        quaternary: '#79747E',
        inverse: '#FFFFFF',
        accent: '#6750A4'
      }
    },
    dark: {
      background: '#1C1B1F',
      surface: '#1C1B1F',
      surfaceElevated: '#2B2930',
      surfaceVariant: '#49454F',
      primary: '#E6E1E5',
      secondary: '#CAC4D0',
      tertiary: '#CCC2DC',
      quaternary: '#938F99',
      border: '#2E2A32',
      borderSubtle: '#2A2830',
      hover: '#2A2830',
      pressed: '#2E2A32',
      selected: '#4F378B',
      accent: {
        primary: '#CFBCFF',
        secondary: '#86DA7B',
        success: '#4CAF50',
        warning: '#F9A825',
        error: '#F2B8B5'
      },
      text: {
        primary: '#E6E1E5',
        secondary: '#CAC4D0',
        tertiary: '#CCC2DC',
        quaternary: '#938F99',
        inverse: '#1C1B1F',
        accent: '#CFBCFF'
      }
    }
  },
  neumorphism: {
    // Soft, elevated surfaces with subtle contrast
    light: {
      background: '#E9EEF3',
      surface: '#F2F5F9',
      surfaceElevated: '#FFFFFF',
      surfaceVariant: '#ECF0F3',
      primary: '#1E293B',
      secondary: '#334155',
      tertiary: '#475569',
      quaternary: '#64748B',
      border: '#E5EAF1',
      borderSubtle: '#F3F6FA',
      hover: '#EDF1F5',
      pressed: '#E3E8EF',
      selected: '#DFF7EE',
      accent: {
        primary: '#10B981',
        secondary: '#60A5FA',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      text: {
        primary: '#0F172A',
        secondary: '#334155',
        tertiary: '#475569',
        quaternary: '#64748B',
        inverse: '#FFFFFF',
        accent: '#10B981'
      }
    },
    dark: {
      background: '#0E141B',
      surface: '#111821',
      surfaceElevated: '#16202B',
      surfaceVariant: '#1B2633',
      primary: '#E5E7EB',
      secondary: '#A3A3A3',
      tertiary: '#8B8B8B',
      quaternary: '#6B7280',
      border: '#223042',
      borderSubtle: '#18212C',
      hover: '#1A2430',
      pressed: '#1F2A38',
      selected: '#123B2A',
      accent: {
        primary: '#34D399',
        secondary: '#60A5FA',
        success: '#22C55E',
        warning: '#F59E0B',
        error: '#EF4444'
      },
      text: {
        primary: '#F3F4F6',
        secondary: '#D1D5DB',
        tertiary: '#9CA3AF',
        quaternary: '#6B7280',
        inverse: '#0E141B',
        accent: '#34D399'
      }
    }
  },
  highContrast: {
    // Maximize readability and contrast
    light: {
      background: '#FFFFFF',
      surface: '#FFFFFF',
      surfaceElevated: '#FFFFFF',
      surfaceVariant: '#F2F2F2',
      primary: '#000000',
      secondary: '#1F1F1F',
      tertiary: '#2E2E2E',
      quaternary: '#4D4D4D',
      border: '#000000',
      borderSubtle: '#1A1A1A',
      hover: '#EDEDED',
      pressed: '#DBDBDB',
      selected: '#D1FAE5',
      accent: {
        primary: '#007ACC',
        secondary: '#0A84FF',
        success: '#007F00',
        warning: '#9A6700',
        error: '#B00020'
      },
      text: {
        primary: '#000000',
        secondary: '#1F1F1F',
        tertiary: '#2E2E2E',
        quaternary: '#4D4D4D',
        inverse: '#FFFFFF',
        accent: '#007ACC'
      }
    },
    dark: {
      background: '#000000',
      surface: '#000000',
      surfaceElevated: '#0D0D0D',
      surfaceVariant: '#141414',
      primary: '#FFFFFF',
      secondary: '#E6E6E6',
      tertiary: '#CCCCCC',
      quaternary: '#B3B3B3',
      border: '#FFFFFF',
      borderSubtle: '#E6E6E6',
      hover: '#141414',
      pressed: '#1F1F1F',
      selected: '#003355',
      accent: {
        primary: '#4FC3F7',
        secondary: '#66B2FF',
        success: '#34C759',
        warning: '#FFD60A',
        error: '#FF453A'
      },
      text: {
        primary: '#FFFFFF',
        secondary: '#E6E6E6',
        tertiary: '#CCCCCC',
        quaternary: '#B3B3B3',
        inverse: '#000000',
        accent: '#4FC3F7'
      }
    }
  },
  earthy: {
    // Earthy, warm natural tones
    light: {
      background: '#FAF7F2',
      surface: '#FFFDF8',
      surfaceElevated: '#FFFFFF',
      surfaceVariant: '#F2ECE4',
      primary: '#1B1A17',
      secondary: '#3F3A34',
      tertiary: '#5B5247',
      quaternary: '#7A6F62',
      border: '#E6DED2',
      borderSubtle: '#F5EFE7',
      hover: '#F4EEE6',
      pressed: '#EBE2D6',
      selected: '#DDE7DD',
      accent: {
        primary: '#6B8E23',
        secondary: '#8B5E34',
        success: '#3F8A43',
        warning: '#C07A00',
        error: '#B23A2A'
      },
      text: {
        primary: '#1B1A17',
        secondary: '#3F3A34',
        tertiary: '#5B5247',
        quaternary: '#7A6F62',
        inverse: '#FFFFFF',
        accent: '#6B8E23'
      }
    },
    dark: {
      background: '#12100E',
      surface: '#161310',
      surfaceElevated: '#1C1814',
      surfaceVariant: '#221D18',
      primary: '#EDEBE6',
      secondary: '#CAC3B9',
      tertiary: '#A39382',
      quaternary: '#8C7A66',
      border: '#2A241D',
      borderSubtle: '#201B16',
      hover: '#1D1915',
      pressed: '#231E18',
      selected: '#263622',
      accent: {
        primary: '#9ACD32',
        secondary: '#C28E5E',
        success: '#7FBF7F',
        warning: '#FFC107',
        error: '#E57373'
      },
      text: {
        primary: '#EDEBE6',
        secondary: '#CAC3B9',
        tertiary: '#A39382',
        quaternary: '#8C7A66',
        inverse: '#12100E',
        accent: '#9ACD32'
      }
    }
  }
}

const themeShadowPresets: Record<ThemeName, { light: ThemeShadowScale; dark: ThemeShadowScale }> = {
  default: {
    light: shadows.light,
    dark: shadows.dark
  },
  md3: {
    light: {
      sm: '0px 1px 2px rgba(0,0,0,0.06)',
      md: '0px 2px 4px rgba(0,0,0,0.08)',
      lg: '0px 4px 8px rgba(0,0,0,0.10)',
      xl: '0px 8px 16px rgba(0,0,0,0.12)',
      '2xl': '0px 16px 24px rgba(0,0,0,0.14)'
    },
    dark: {
      sm: '0px 1px 2px rgba(0,0,0,0.40)',
      md: '0px 2px 4px rgba(0,0,0,0.45)',
      lg: '0px 4px 8px rgba(0,0,0,0.50)',
      xl: '0px 8px 16px rgba(0,0,0,0.55)',
      '2xl': '0px 16px 24px rgba(0,0,0,0.60)'
    }
  },
  neumorphism: {
    light: {
      sm: '6px 6px 12px #cdd3da, -6px -6px 12px #ffffff',
      md: '8px 8px 16px #cdd3da, -8px -8px 16px #ffffff',
      lg: '12px 12px 24px #cdd3da, -12px -12px 24px #ffffff',
      xl: '16px 16px 32px #cdd3da, -16px -16px 32px #ffffff',
      '2xl': '24px 24px 48px #cdd3da, -24px -24px 48px #ffffff'
    },
    dark: {
      sm: '6px 6px 12px #0a0f15, -6px -6px 12px #121921',
      md: '8px 8px 16px #0a0f15, -8px -8px 16px #121921',
      lg: '12px 12px 24px #0a0f15, -12px -12px 24px #121921',
      xl: '16px 16px 32px #0a0f15, -16px -16px 32px #121921',
      '2xl': '24px 24px 48px #0a0f15, -24px -24px 48px #121921'
    }
  },
  highContrast: {
    light: {
      sm: '0 0 0 1px rgba(0,0,0,0.9)',
      md: '0 0 0 2px rgba(0,0,0,1)',
      lg: '0 0 0 3px rgba(0,0,0,1)',
      xl: '0 0 0 4px rgba(0,0,0,1)',
      '2xl': '0 0 0 5px rgba(0,0,0,1)'
    },
    dark: {
      sm: '0 0 0 1px rgba(255,255,255,0.9)',
      md: '0 0 0 2px rgba(255,255,255,1)',
      lg: '0 0 0 3px rgba(255,255,255,1)',
      xl: '0 0 0 4px rgba(255,255,255,1)',
      '2xl': '0 0 0 5px rgba(255,255,255,1)'
    }
  },
  earthy: {
    light: {
      sm: '0 2px 4px rgba(27,26,23,0.06)',
      md: '0 4px 8px rgba(27,26,23,0.08)',
      lg: '0 8px 16px rgba(27,26,23,0.10)',
      xl: '0 12px 20px rgba(27,26,23,0.12)',
      '2xl': '0 16px 28px rgba(27,26,23,0.14)'
    },
    dark: {
      sm: '0 2px 4px rgba(0,0,0,0.40)',
      md: '0 4px 8px rgba(0,0,0,0.45)',
      lg: '0 8px 16px rgba(0,0,0,0.50)',
      xl: '0 12px 20px rgba(0,0,0,0.55)',
      '2xl': '0 16px 28px rgba(0,0,0,0.60)'
    }
  }
}

// Helper function to get theme colors by name (defaults to 'default')
const getThemeColors = (theme: ThemeMode, name: ThemeName = 'default') => {
  return themeColorPresets[name][theme]
}

// Helper function to get theme shadows by name (defaults to 'default')
const getThemeShadows = (theme: ThemeMode, name: ThemeName = 'default') => {
  return themeShadowPresets[name][theme]
}

// Export the complete design system
export const designSystem = {
  colors,
  typography,
  spacing,
  radius,
  shadows,
  animations,
  components,
  getThemeColors,
  getThemeShadows
} as const

export type DesignSystem = typeof designSystem

// Export helper functions individually
export { getThemeColors, getThemeShadows }
