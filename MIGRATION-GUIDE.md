# Design System Migration Guide

## Overview
This guide outlines the systematic migration of existing components to use our new unified design system. The migration is designed to be gradual and non-breaking, allowing existing functionality to continue working while progressively adopting the new design system.

## What's Been Implemented

### ✅ Core Infrastructure
- **Design System (`src/styles/design-system.ts`)**: Complete token system with light/dark theme support
- **Theme Context (`src/contexts/ThemeContext.tsx`)**: React context for theme management with localStorage persistence
- **Global CSS (`src/styles/globals.css`)**: CSS custom properties and utility classes
- **Base Components**: Button, Card, Input, Textarea, ThemeToggle

### ✅ Theme Integration
- **App.tsx**: Updated with ThemeProvider and theme-aware styling
- **Settings Page**: Added iOS-style theme toggle with smooth animations
- **Loading Screens**: Now use theme colors dynamically

## Migration Strategy

### Phase 1: Foundation (✅ COMPLETED)
- [x] Create design system tokens
- [x] Implement theme context
- [x] Create base component library
- [x] Add theme toggle to settings
- [x] Update main app shell

### Phase 2: Component Migration (CURRENT)
Priority order for migrating existing components:

#### High Priority (Core UI)
1. **Navigation Component** (`src/components/navigation.tsx`)
   - Replace hardcoded colors with theme colors
   - Use design system spacing and typography
   - Ensure proper contrast in both themes

2. **TaskItem Component** (`src/components/TaskItem.tsx`)
   - Migrate to use Card component as base
   - Update colors to use theme system
   - Improve typography consistency

3. **Modal Components**
   - QuickAddModal
   - AddGoalModal
   - SimpleTaskModal

#### Medium Priority (Page Components)
4. **Home Page** (`src/pages/Home.tsx`)
5. **Overview Page** (`src/pages/Overview.tsx`)
6. **Login Page** (`src/pages/Login.tsx`)

#### Lower Priority (Onboarding)
7. **Onboarding Components** (`src/components/onboarding/`)
   - These already have custom styling that works well
   - Can be migrated last for consistency

### Phase 3: Polish & Optimization
- Fine-tune animations and transitions
- Ensure accessibility compliance
- Performance optimization
- Documentation updates

## Migration Patterns

### 1. Gradual Color Migration
Instead of replacing all inline styles at once, use CSS custom properties:

```tsx
// Before
style={{ backgroundColor: '#1e1e1e', color: '#fff' }}

// After (gradual)
style={{ backgroundColor: 'var(--bg-surface)', color: 'var(--text-primary)' }}

// Eventually (using theme context)
const { colors } = useTheme()
style={{ backgroundColor: colors.surface, color: colors.text.primary }}
```

### 2. Component Wrapping
Wrap existing components with new base components:

```tsx
// Before
<div className="md-card" style={{ backgroundColor: '#1e1e1e', padding: '20px' }}>

// After
<Card variant="default" padding="md">
```

### 3. Typography Migration
Replace custom font styles with design system classes:

```tsx
// Before
style={{ fontSize: '16px', fontWeight: '600', color: '#fff' }}

// After
className="text-callout-emphasized text-primary"
```

## Implementation Guidelines

### Do's ✅
- Use the `useTheme()` hook for dynamic colors
- Leverage CSS custom properties for gradual migration
- Test both light and dark themes for every change
- Maintain existing functionality during migration
- Use design system spacing tokens
- Follow iOS 17 design principles

### Don'ts ❌
- Don't break existing functionality
- Don't migrate everything at once
- Don't ignore accessibility considerations
- Don't hardcode colors anymore
- Don't skip testing in both themes

## Available Resources

### Design System Tokens
```tsx
import { useTheme } from '../contexts/ThemeContext'
const { colors, shadows, isDark, isLight } = useTheme()
```

### Base Components
```tsx
import { Button, Card, Input, ThemeToggle } from '../components/ui'
```

### CSS Utilities
```css
/* Colors */
.bg-surface, .text-primary, .border-default

/* Typography */
.text-title-1, .text-body, .text-footnote

/* Spacing */
.p-4, .m-6, .rounded-lg

/* Shadows */
.shadow-md, .shadow-lg
```

## Testing Checklist

For each migrated component:
- [ ] Works in light theme
- [ ] Works in dark theme
- [ ] Smooth theme transitions
- [ ] Maintains existing functionality
- [ ] Proper contrast ratios
- [ ] Responsive behavior intact
- [ ] No console errors
- [ ] Accessibility preserved

## Next Steps

1. **Start with Navigation**: Most visible component, good impact
2. **Migrate TaskItem**: Core functionality component
3. **Update Modals**: Consistent modal experience
4. **Page-by-page migration**: Systematic approach
5. **Polish and optimize**: Final refinements

## Benefits After Migration

- **Consistent Design**: Unified look across all components
- **Theme Support**: Seamless light/dark mode switching
- **Better Accessibility**: Proper contrast and focus states
- **Maintainability**: Centralized design tokens
- **iOS 17 Aesthetic**: Modern, clean interface
- **Performance**: Optimized animations and transitions
- **Developer Experience**: Easy to use component library

## Support

The design system is fully documented in:
- `src/styles/design-system.ts` - Core tokens and utilities
- `src/contexts/ThemeContext.tsx` - Theme management
- `src/components/ui/` - Base component library
- `src/styles/globals.css` - CSS utilities and variables
