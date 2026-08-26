# StudyFlow AI

A study planner that helps you organize tasks, generate a rule-based weekly study schedule, track focused study sessions, and get AI-powered study advice.

Built as a first full-stack project — no authentication, single demo user, fully functional end to end.

## Features

- **Task Management** — add, complete, and delete study tasks with subject, deadline, estimated duration, and difficulty level.
- **Weekly Planner** — generates a study schedule automatically using a rule-based algorithm:
  - Sorts tasks by nearest deadline (harder tasks first on ties)
  - Splits tasks into 25/50-minute study sessions
  - Respects fixed daily availability (2 hrs on weekdays, 4 hrs on weekends)
  - Never schedules past a task's deadline
  - Regenerating a plan preserves already-completed sessions
- **Focus Timer** — a Pomodoro-style 25-minute timer tied to real scheduled sessions; completing a session logs actual study time to the database.
- **Dashboard** — live overview of today's sessions, the nearest upcoming deadline, and weekly completed-vs-planned study minutes.
- **AI Study Assistant** — chat interface powered by Google's Gemini API, with live context from your actual tasks and schedule (e.g. "What should I study today?").

## Tech Stack

- **Frontend + Backend:** Next.js (App Router) with TypeScript
- **Styling:** Tailwind CSS v4
- **Database:** Supabase (PostgreSQL)
- **AI:** Google Gemini API
- **Deployment:** Vercel (planned)

## Database Schema

- `tasks` — title, subject, deadline, estimated_minutes, difficulty, status
- `study_sessions` — task_id (FK), scheduled_date, planned_minutes, actual_minutes, status
- `ai_messages` — role, content, related_task_id

## Getting Started

1. Clone the repo and install dependencies:
```bash
   npm install
```

2. Create a `.env.local` file in the project root with:
```
   NEXT_PUBLIC_SUPABASE_URL=your-supabase-project-url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
   GEMINI_API_KEY=your-gemini-api-key
```

3. Set up your Supabase project with the three tables listed above (Row Level Security disabled, since this app has no authentication layer).

4. Run the development server:
```bash
   npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000).

## Project Structure

```
app/
  page.tsx              → Dashboard
  tasks/page.tsx         → Task management
  planner/page.tsx       → Weekly planner
  timer/page.tsx         → Focus timer
  ai/page.tsx            → AI assistant chat
  api/
    tasks/               → Task CRUD routes
    sessions/             → Session read/update routes
    planner/generate/     → Rule-based scheduler endpoint
    ai/chat/               → Gemini-powered chat endpoint
components/
  Sidebar.tsx            → Shared navigation
lib/
  scheduler.ts           → Rule-based scheduling algorithm
  supabaseClient.ts       → Supabase client instance
```

## Roadmap

- [ ] AI: break a task into smaller steps
- [ ] AI: regenerate plan after a missed session (propose-then-apply flow)
- [ ] Deploy to Vercel
