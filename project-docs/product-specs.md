# Project Summary: The "Ikigai" App

## 1. App Name & Core Idea
- **App Name**: Ikigai
- **Core Idea**: Building a system for the users to improve the quality of the life and productivity holistically
- **Problem Solved**: Goes beyond a simple to‑do list by structuring habits around whole day plan to aid the goals across different pillars of life.

## 2. The Four Pillars of Well‑being
- **Mental Health**: Meditation, reading, journaling, learning a new skill
- **Physical Health**: Exercise, nutrition, sleep, hydration
- **Social & Family**: Calling a friend, family time, gratitude
- **Intellectual & Purpose**: Volunteering, creative hobbies, time in nature

## 3. Main Features & Modules
### Core Loop (current)
- Add/manage tasks and goals (CRUD for both)
- Mark tasks complete to earn points and maintain a streak (logic adjusted to recent-first)
- Dayplan view to arrange the habits and routines for a day - added automatically as per the habit repeat frequency and can add/skip habits for the day as well

### Task & Goal Management
- **Quick Add** (planned): bottom sheet for fast task creation
- **Edit/Link**: Goals can link to existing habits; pillar selection in goal modal
- **Categorization**: Assign to four pillars (Mental, Physical, Social, Intellectual)
- **Reminders**: App-level check-in, per-task reminders; clear/reschedule on CRUD


## 4. Material Design Philosophy (Dark Theme)
- Dark background around `#121212` with lighter surfaces for elevation
- Subtle elevation and shadows; lighter elevated surfaces
- Bold, intentional typography (Roboto or similar)
- Meaningful motion for feedback (ripple, fade‑in, completion micro‑animation)


## 5. Development Plan (Updated)
### MVP (Now)
- Stable CRUD (tasks, goals), streaks, notifications
- Day Plan with unscheduled section; Goal modal with pillar + linking


**Near-Term Features:**

- Floating mic button (FAB-style)
- Press-and-hold or tap-to-toggle recording
- Visual feedback: waveform animation, recording indicator
- Transcription display in real-time
- Cancel/Submit options

Conversational AI Integration

**Architecture**:

- Streaming API calls for real-time responses
- Context window management (last N messages)
- System prompt with app structure knowledge
- Function calling for CRUD operations

**System Prompt Template**:

```
You are a helpful assistant for Ikigai, a habit tracking app with 4 pillars:
Mental, Physical, Social, and Intellectual health. Help users create habits,
goals, and routines through natural conversation. Ask clarifying questions
when needed. Available functions: addHabit(), addGoal(), addRoutine(),
scheduleTask(), getHabits(), getGoals().
```

### 5.2 Conversation UI

**Design**:

- Bottom sheet modal (expandable)
- Chat-like interface (user messages, AI responses)
- Voice + text input (hybrid mode)
- Quick action buttons for common operations
- Context pills showing current entities being discussed

### 5.3 Multi-Turn Context Management

**New File**: `src/services/conversationContext.ts`

**Features**:

- Track partial entities across turns
- "I want to add a habit" → "What's the habit?" → "Meditation" → "What time?" → "7am"
- Resume interrupted conversations
- Clear context command

### 5.4 Proactive Assistance

**Enhancements**:

- "You haven't completed your morning routine. Would you like to start now?"
- "You're on a 5-day streak! Keep it up!"
- "Reminder: Call to remind [voice call feature, future]"

---

## Phase 6: Advanced Voice Features

### 6.1 Malayalam Language Support (Phase 2)

**Files**: `src/services/speechService.ts`, `src/services/nlpService.ts`

**Approach**:

- Add Malayalam speech recognition
- Bilingual NLP models
- Code-switched support (English-Malayalam mix)
- Cultural context in prompts


### 6.2 Voice Settings & Personalization

**Files**: `src/pages/Settings.tsx`

**Options**:

- Voice selection (if supported by browser)
- Speech rate, pitch
- Wake word preference (future: "Hey Ikigai")
- Language selection (English now, Malayalam later slot)

---

### Stretch
- Conversation mode: multi‑turn clarifications (time, frequency, pillar)
- Personalization and shortcuts; Malayalam slot after English MVP
- Reports/insights; expanded gamification

## 7. Next Steps for Discussion
1. Detailed UX flows for task creation/editing/onboarding
2. Additional UI images as flows solidify (Quick Add, Edit)

---
Notes:
- Images are stored in `project-docs/images/` and referenced relatively.
- Follow the app‑wide rules in `project-docs/prompts/rules.md`.
