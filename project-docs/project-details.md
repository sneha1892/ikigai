# Ikigai App - Development Context Package

## PROJECT SUMMARY
I'm building an Ikigai habit tracking app using React + Vite + Material Design CSS + Firebase. The app helps users improve their lives holistically using the Four Pillars of Well-being framework.

## CURRENT STATUS ✅
- **App Shell**: React + Vite + TypeScript stable
- **Styling**: Custom Material Design CSS (no Tailwind)
- **Navigation**: Three primary pages — `Habits & Tasks`, `Day Plan`, `Goals` (+ `Settings` modal)
- **Data Layer**: Firebase (Firestore + Auth) integrated via `useFirestore`
- **Goals CRUD**: Add, edit, delete working; `AddGoalModal` includes pillar selector and habit linking
- **Day Plan**: Unscheduled habits section fixed (no accidental deletes), collapsible, completed items sink
- **Streak Logic**: Adjusted to count from most recent completion
- **Notifications**: Reschedules when tasks change; clear/re-schedule on edit/delete
- **Voice Assistant (Client)**: Temporarily removed to start fresh; server kept for secrets and future AI

## TECH STACK
- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Custom Material Design CSS (Dark Theme #121212)
- **Icons**: Lucide React
- **Backend**: Firebase (Firestore + Auth) with custom hooks
- **Server (local)**: `server/index.ts` (Express) for AI key proxy (Deepgram/Gemini/OpenAI)
- **Deployment**: Firebase Hosting (client) — server runs locally during development

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

## CURRENT FILE STRUCTURE (high-level)
```
src/
├── components/
│   ├── ToastContainer.tsx
│   └── TopHeader.tsx, NewNavigation.tsx, TaskItem.tsx, etc.
├── hooks/
│   └── useFirestore.ts (CRUD for tasks, goals, routines, modifications)
├── pages/
│   ├── DayPlan.tsx (timeline + unscheduled section)
│   ├── HabitsAndTasks.tsx
│   ├── Goals.tsx (goal CRUD + link habits)
│   └── Settings.tsx (modal-style page)
├── services/
│   ├── notificationService.ts, toastService.ts, date utils, etc.
│   └── (voice services temporarily removed to start fresh)
├── App.tsx (router shell, page orchestration)
└── index.css (Material Design CSS)

server/
├── index.ts (Express proxy for Deepgram/Gemini/OpenAI)
├── package.json, tsconfig.json
└── .env (kept local, ignored in git)
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

### Phase A: Stability and UX (current)
- [x] Fix unscheduled habit deletion and instance ID handling
- [x] Add edit/delete for Goals, pillar select in goal modal, link habits
- [x] Improve visible FAB and checklist padding
- [x] Streak logic correctness
- [ ] Modal polish (close-after-update consistency across modals)

### Phase B: Clean Voice Reboot
- [x] Remove client voice code to start fresh
- [x] Keep `server/index.ts` and `.env` for secrets proxy
- [ ] Re-introduce voice MVP with one path:
  - Option 1: OpenAI Realtime (single vendor STT+LLM)
  - Option 2: Deepgram (STT) + Gemini tool-calling (LLM)
- [ ] Minimal UI mic with clear states and timeouts
- [ ] Function-calls map to existing Firebase CRUD handlers

### Phase C: Conversation & Personalization
- [ ] Multi-turn clarifications (time, frequency, pillar)
- [ ] Voice shortcuts and personalization settings
- [ ] Malayalam STT/TTS slot (post-English MVP)

### Phase D: New Features
- [ ] Step marker, water log
- [ ] Mindfulness tab (gratitude, affirmations)
- [ ] Reward system (fruits, coins, milestones)

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

## FIREBASE CONFIG (Reference)
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

# Start local voice server (secrets proxy)
cd server && npm run dev

# Install new dependencies
npm install [package-name]

# Build for production
npm run build
```

---

