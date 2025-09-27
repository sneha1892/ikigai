# Prompt Rules

These rules ensure consistent prompting and implementation flow for the Ikigai app.
- Never try to run commands, tell me what to do and I will do it. 

## Principles
- Mobile-first (max width ~400px)
- Follow Material Design dark theme CSS already in `src/index.css`
- Prefer small, focused React components
- Use TypeScript with clear interfaces
- Progressive enhancement: start simple, iterate

## Effective Prompting Template
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
1. Complete working code - for each file that is going to change, do not remove old functionalities when adding new ones unless specified or required
2. Step-by-step explanation
3. How it fits into existing structure
4. Next steps
```

## Working Agreements
- Keep the `docs` up to date when a decision is made.
- Add new UI images under `project-docs/images/` and link relatively.
- If a component grows beyond a single responsibility, split it.


