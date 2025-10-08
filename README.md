# Ikigai App - Development Context Package

## PROJECT SUMMARY
I'm building an Ikigai habit tracking app using React + Vite + Material Design CSS + Firebase. The app helps users improve their lives holistically using the Four Pillars of Well-being framework.

## CURRENT STATUS ✅
- **Setup Complete**: Vite + React + TypeScript working
- **Styling**: Custom Material Design CSS implemented (no Tailwind)
- **Navigation**: Three-tab system (Home/Overview/Settings) with modern Lucide icons
- **Structure**: Basic app shell and component structure created
- **Next Phase**: Ready to build actual feature components

## TECH STACK
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Custom Material Design CSS (Dark Theme #121212)
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore + Auth) - not yet implemented
- **Deployment**: Firebase Hosting

## APP CONCEPT
**Four Pillars of Well-being:**
1. Mental Health (meditation, reading, journaling, learning)
2. Physical Health (exercise, nutrition, sleep, hydration) 
3. Social Health (calling friends, family time, gratitude)
4. Intellectual & Purpose (volunteering, creative hobbies, nature)

**Core Features:**
- Daily habit tracking with completion checkboxes
- Gamification: streaks, points, milestones
- Quick Add modal for creating habits
- Four pillars overview dashboard
- Progress reports and insights

## CURRENT FILE STRUCTURE
```
src/
├── components/
│   ├── Navigation.tsx ✅ (Complete)
│   ├── ui/ (planned)
│   ├── PillarCard.tsx (needed)
│   ├── QuickAdd.tsx (needed)
│   └── TaskItem.tsx (needed)
├── pages/
│   ├── Home.tsx (needed - daily task list)
│   ├── Overview.tsx (needed - four pillars)
│   └── Settings.tsx (needed - user settings)
├── services/
│   └── firebase.ts (planned)
├── types/
│   └── index.ts (needs task/user interfaces)
├── App.tsx ✅ (Basic shell with navigation)
└── index.css ✅ (Material Design CSS)
```

## MATERIAL DESIGN IMPLEMENTATION
Using custom CSS with proper Material Design specifications:
- Background: #121212 (dark gray, not pure black)
- Surface colors: #1e1e1e, #2d2d2d for elevation
- Typography: Roboto font with proper scale
- Elevation: Shadow system for cards and buttons
- Colors: Custom pillar colors + #10B981 accent green

## UI DESIGNS REFERENCE
**Page Structure:**
1. **Home Page**: Daily task list with completion checkboxes (like a today view)
2. **Overview Page**: Four pillar cards showing habit categories and progress
3. **Settings Page**: User profile and app settings

**Navigation**: Bottom tab bar with Home, Overview, Settings

## NEXT DEVELOPMENT PHASES

### Phase 1: Core Components (Current)
- [ ] Home page with daily task list
- [ ] Overview page with four pillar cards  
- [ ] Basic task creation
- [ ] Task completion functionality

### Phase 2: Enhanced Features
- [ ] Quick Add modal with bottom sheet
- [ ] Task editing capabilities
- [ ] Local storage for persistence

### Phase 3: Firebase Integration
- [ ] User authentication
- [ ] Cloud data storage
- [ ] Real-time sync

### Phase 4: Advanced Features
- [ ] Streaks and scoring system
- [ ] Progress analytics
- [ ] Reminders and notifications

## KEY CSS CLASSES AVAILABLE
```css
/* Typography */
.headline-large, .headline-medium, .title-large, .body-large, .body-medium

/* Components */
.md-card, .md-filled-button, .md-fab
.elevation-1, .elevation-2, .elevation-3

/* Pillar Colors */
.pillar-mental (#7DD3FC), .pillar-physical (#86EFAC)
.pillar-social (#FDBA74), .pillar-intellectual (#C4B5FD)

/* Layout */
.container (max-width: 400px, centered, mobile-first)
```

## DEVELOPMENT PRINCIPLES
- **Mobile-First**: Designed for 400px max width
- **Material Design**: Following Google's spec for dark theme
- **Component-Based**: Small, focused, reusable components
- **TypeScript**: Proper typing for data structures
- **Progressive Enhancement**: Start simple, add complexity gradually

## EFFECTIVE PROMPTING TEMPLATE
```
Context: Building Ikigai habit tracking app with React+Vite+Material Design CSS.

Current Goal: [Specific component/feature you want to build]

What I have: [Current state - reference this context doc]

What I need: [Specific outcome you want]

Requirements:
- Use existing Material Design CSS classes
- Follow mobile-first approach (max-width: 400px)
- TypeScript with proper interfaces
- Component should be small and focused

Please provide:
1. Complete working code
2. Step-by-step explanation
3. How it fits into existing structure
4. Next steps
```

## FIREBASE CONFIG (When Ready)
Create `src/services/firebase.ts` with:
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  // Your config from Firebase Console
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
```

## COMMON COMMANDS
```bash
# Start development server
npm run dev

# Install new dependencies
npm install [package-name]

# Build for production
npm run build
```

---
