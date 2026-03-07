# Competition Olympics — Claude Code Instructions

## Project Overview
A 1v1 competitive gaming platform where two players compete through a series of mini-games ("events"), earning gold/silver medals per event. The player with the most gold medals wins the Olympics.

## Tech Stack
- **Frontend:** React + Vite + TypeScript
- **Database/Auth/Realtime:** Supabase
- **Hosting:** Vercel
- **State Management:** Zustand
- **Styling:** Tailwind CSS
- **Routing:** React Router v6
- **Testing:** Vitest

## Initial Setup Steps

### 1. Initialize the Vite + React + TypeScript project
```bash
npm create vite@latest . -- --template react-ts
npm install
```

### 2. Install all dependencies
```bash
npm install @supabase/supabase-js zustand react-router-dom @tanstack/react-query
npm install -D tailwindcss postcss autoprefixer @types/node
npx tailwindcss init -p
```

### 3. Environment variables
Create `.env.local`:
```
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

---

## Architecture: The Event Plugin System

This is the most critical architectural pattern. Every game is a self-contained plugin.

### File: `src/events/types.ts`
Define these core interfaces:

```typescript
export type EventType = 'sudoku' | 'flashback' | 'holdem' | 'cribbage' | 'geography';

export type WinCondition = 'highest_score' | 'lowest_score' | 'fastest_time';

export interface MatchResult {
  score: number;           // normalized 0-100 for display purposes
  rawValue: number;        // actual game metric (time in ms, chips, points, etc.)
  completedAt: string;     // ISO timestamp
  metadata: Record<string, unknown>; // game-specific extra data
}

export interface EventComponentProps {
  olympicsId: string;
  playerId: string;
  onComplete: (result: MatchResult) => void;
  opponentResult?: MatchResult; // only available in async mode after opponent finishes
  isRealtime?: boolean;
}

export interface OlympicsEvent {
  id: EventType;
  name: string;
  description: string;
  icon: string;             // emoji or lucide icon name
  estimatedMinutes: number;
  supportsAsync: boolean;
  supportsRealtime: boolean;
  winCondition: WinCondition;
  rules: string[];          // bullet points shown on event intro card

  // Core scoring methods
  compareResults(r1: MatchResult, r2: MatchResult): 'p1' | 'p2' | 'tie';
  formatScore(result: MatchResult): string; // human-readable: "4:23", "847 pts"

  // The React component that runs the actual game
  Component: React.FC<EventComponentProps>;
}
```

### File: `src/events/registry.ts`
Central registry — import all event plugins here:

```typescript
import { sudokuEvent } from './sudoku';
import { flashbackEvent } from './flashback';
import { holdemEvent } from './holdem';
import { cribbageEvent } from './cribbage';
import { geographyEvent } from './geography';
import type { OlympicsEvent, EventType } from './types';

export const EVENT_REGISTRY: Record<EventType, OlympicsEvent> = {
  sudoku: sudokuEvent,
  flashback: flashbackEvent,
  holdem: holdemEvent,
  cribbage: cribbageEvent,
  geography: geographyEvent,
};

export const getAllEvents = (): OlympicsEvent[] => Object.values(EVENT_REGISTRY);
export const getEvent = (type: EventType): OlympicsEvent => EVENT_REGISTRY[type];
```

---

## Database Schema

Run these migrations in Supabase SQL editor (create file `supabase/migrations/001_initial.sql`):

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  display_name TEXT NOT NULL,
  avatar_url TEXT,
  total_golds INTEGER DEFAULT 0,
  total_silvers INTEGER DEFAULT 0,
  total_olympics INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Olympics (a single games instance between 2 players)
CREATE TABLE olympics (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  invite_code TEXT UNIQUE NOT NULL,           -- short shareable code e.g. "ZEUS-42"
  player1_id UUID REFERENCES profiles(id) NOT NULL,
  player2_id UUID REFERENCES profiles(id),   -- null until P2 joins
  status TEXT DEFAULT 'lobby'                -- lobby | active | complete
    CHECK (status IN ('lobby', 'active', 'complete')),
  event_sequence TEXT[] NOT NULL,            -- ordered array of EventType strings
  current_event_index INTEGER DEFAULT 0,
  player1_gold_count INTEGER DEFAULT 0,
  player2_gold_count INTEGER DEFAULT 0,
  winner_id UUID REFERENCES profiles(id),
  mode TEXT DEFAULT 'async'                  -- async | realtime
    CHECK (mode IN ('async', 'realtime')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  completed_at TIMESTAMPTZ
);

-- Individual event instances within an Olympics
CREATE TABLE olympics_events (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  olympics_id UUID REFERENCES olympics(id) ON DELETE CASCADE NOT NULL,
  event_index INTEGER NOT NULL,              -- position in the sequence
  event_type TEXT NOT NULL,                 -- matches EventType
  status TEXT DEFAULT 'pending'
    CHECK (status IN ('pending', 'p1_active', 'p2_active', 'p1_complete', 'p2_complete', 'complete')),
  gold_winner_id UUID REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Individual player results for each event
CREATE TABLE event_results (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  olympics_event_id UUID REFERENCES olympics_events(id) ON DELETE CASCADE NOT NULL,
  player_id UUID REFERENCES profiles(id) NOT NULL,
  score DECIMAL NOT NULL,                   -- normalized 0-100
  raw_value DECIMAL NOT NULL,               -- actual game metric
  metadata JSONB DEFAULT '{}',              -- game-specific data
  completed_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(olympics_event_id, player_id)
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympics ENABLE ROW LEVEL SECURITY;
ALTER TABLE olympics_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE event_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Profiles viewable by all" ON profiles FOR SELECT USING (true);
CREATE POLICY "Users manage own profile" ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Olympics viewable by participants" ON olympics FOR SELECT
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);
CREATE POLICY "Anyone can create olympics" ON olympics FOR INSERT WITH CHECK (auth.uid() = player1_id);
CREATE POLICY "Participants can update olympics" ON olympics FOR UPDATE
  USING (auth.uid() = player1_id OR auth.uid() = player2_id);

CREATE POLICY "Events viewable by participants" ON olympics_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM olympics o
    WHERE o.id = olympics_id
    AND (o.player1_id = auth.uid() OR o.player2_id = auth.uid())
  ));

CREATE POLICY "Results viewable by participants" ON event_results FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM olympics_events oe
    JOIN olympics o ON o.id = oe.olympics_id
    WHERE oe.id = olympics_event_id
    AND (o.player1_id = auth.uid() OR o.player2_id = auth.uid())
  ));
CREATE POLICY "Players submit own results" ON event_results FOR INSERT
  WITH CHECK (auth.uid() = player_id);

-- Enable realtime on key tables
ALTER PUBLICATION supabase_realtime ADD TABLE olympics;
ALTER PUBLICATION supabase_realtime ADD TABLE olympics_events;
ALTER PUBLICATION supabase_realtime ADD TABLE event_results;

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, username, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'username', split_part(NEW.email, '@', 1)),
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## Project File Structure to Create

```
src/
├── events/
│   ├── types.ts               ← Core interfaces (see above)
│   ├── registry.ts            ← Central event registry (see above)
│   ├── sudoku/
│   │   ├── index.ts           ← Event definition + scoring logic
│   │   ├── SudokuGame.tsx     ← Game component
│   │   └── generator.ts       ← Sudoku puzzle generator
│   ├── flashback/
│   │   ├── index.ts           ← Flashback = NYT Connections-style word grouping game
│   │   ├── FlashbackGame.tsx
│   │   └── puzzleData.ts      ← Hardcoded puzzle sets
│   ├── holdem/
│   │   ├── index.ts           ← Texas Hold-em, first to bust opponent or most chips after 20 hands
│   │   ├── HoldemGame.tsx
│   │   └── engine.ts          ← Card dealing, hand evaluation, betting logic
│   ├── cribbage/
│   │   ├── index.ts           ← Cribbage, first to 121 points
│   │   ├── CribbageGame.tsx
│   │   └── scoring.ts         ← Cribbage hand scoring logic
│   └── geography/
│       ├── index.ts           ← MapTap-style, 5 locations, closest guess wins
│       ├── GeographyGame.tsx
│       └── locations.ts       ← Hardcoded location data with lat/lng
│
├── engine/
│   ├── OlympicsEngine.ts      ← Core flow: advance events, award medals, detect winner
│   ├── medalLogic.ts          ← compareResults wrapper, determine gold/silver
│   └── useOlympics.ts         ← Main React hook: wraps Supabase queries + realtime
│
├── components/
│   ├── lobby/
│   │   ├── CreateOlympicsForm.tsx    ← Pick events, set mode, generate invite
│   │   ├── JoinOlympicsForm.tsx      ← Enter invite code
│   │   └── WaitingRoom.tsx           ← Pre-game lobby, both players ready up
│   ├── scoreboard/
│   │   ├── MedalStandings.tsx        ← Live medal count during Olympics
│   │   └── EventHistory.tsx          ← Completed events list
│   ├── podium/
│   │   ├── PodiumReveal.tsx          ← Animated gold/silver reveal after each event
│   │   └── FinalCeremony.tsx         ← End screen, champion declared
│   └── shared/
│       ├── EventCard.tsx             ← Card showing event info + status
│       ├── PlayerAvatar.tsx
│       ├── MedalBadge.tsx            ← Gold/silver badge component
│       └── CountdownTimer.tsx        ← Reusable timer for timed events
│
├── pages/
│   ├── Home.tsx                      ← Landing, create or join
│   ├── Auth.tsx                      ← Login/signup (email + Google)
│   ├── OlympicsLobby.tsx             ← Waiting room page
│   ├── EventIntro.tsx                ← Rules card before each event
│   ├── EventPlay.tsx                 ← Loads correct event component from registry
│   ├── EventResult.tsx               ← Podium reveal page
│   └── OlympicsSummary.tsx           ← Final standings + winner
│
├── lib/
│   ├── supabase.ts                   ← Supabase client init
│   └── realtime.ts                   ← Realtime channel helpers
│
├── store/
│   └── useAppStore.ts                ← Zustand store (auth state, current olympics)
│
└── App.tsx                           ← Router setup
```

---

## Routing Structure

```
/                          → Home.tsx
/auth                      → Auth.tsx
/create                    → CreateOlympicsForm page
/join/:inviteCode          → JoinOlympicsForm (pre-filled)
/olympics/:id/lobby        → OlympicsLobby.tsx
/olympics/:id/event/:idx/intro    → EventIntro.tsx
/olympics/:id/event/:idx/play     → EventPlay.tsx
/olympics/:id/event/:idx/result   → EventResult.tsx
/olympics/:id/summary      → OlympicsSummary.tsx
```

---

## Olympics Engine Logic (`src/engine/OlympicsEngine.ts`)

Implement these core functions:

```typescript
// Advance to next event after current event completes
export async function advanceOlympics(olympicsId: string): Promise<void>

// Called when a player submits their event result
export async function submitEventResult(
  olympicsEventId: string,
  playerId: string,
  result: MatchResult
): Promise<void>

// Check if both results are in, determine gold winner, update medals
export async function resolveEvent(olympicsEventId: string): Promise<void>

// Check if all events complete, determine overall champion
export async function resolveOlympics(olympicsId: string): Promise<void>

// Generate a human-readable invite code like "ZEUS-42" or "ATLAS-77"
export function generateInviteCode(): string
```

---

## Event Implementation Notes

### Sudoku
- Generate puzzles using a backtracking algorithm (implement in `generator.ts`)
- 3 difficulty tiers: easy (35 clues), medium (28 clues), hard (22 clues)
- Score: lower time = better. Both players get the SAME puzzle for fairness
- Async-friendly: store puzzle seed in `olympics_events.metadata`

### Flashback (NYT Connections-style)
- 16 words arranged in a 4x4 grid, group them into 4 categories of 4
- 4 mistakes allowed before game over
- Score: `1000 - (mistakes * 150) - (secondsTaken * 0.5)`
- Async: both players get the same puzzle set (hardcoded from `puzzleData.ts`)
- Include ~20 pre-built puzzle sets, pick one randomly per Olympics

### Texas Hold-em
- 1v1, heads-up poker
- Play 20 hands or until one player is eliminated
- Each player starts with 1000 chips, small blind 10/big blind 20
- Score: chip count at end (or 1000 if opponent busted)
- **Realtime only** — players must be online simultaneously

### Cribbage
- Traditional 2-player cribbage, first to 121 points
- Full implementation: deal, discard to crib, cut, play (pegging), show (scoring)
- Score: points scored (121 if you win, opponent's final score if you lose)
- **Realtime only** — turn-based card game

### Geography
- Show 5 mystery locations on a world map (zoomed out, no labels)
- Player clicks where they think it is
- Score: `5000 - (averageDistanceKm * 0.5)` capped at 0
- Use a simple SVG world map or integrate Leaflet.js with tiles disabled
- Hardcode 50+ location challenges in `locations.ts`
- Async-friendly: both players get the same 5 locations

---

## Realtime Architecture

Use Supabase Realtime channels. Create one channel per Olympics:

```typescript
// Channel naming: `olympics:{olympicsId}`
// Subscribe in useOlympics hook
// Listen for:
//   - olympics table UPDATE (status changes, score updates)
//   - olympics_events table UPDATE (event status changes)  
//   - event_results table INSERT (opponent submitted result)
```

For truly real-time games (Hold-em, Cribbage), also use presence to confirm both players are online before starting.

---

## UI/UX Design Direction

Go for an **Olympic ceremony aesthetic** — dark background, gold/silver/bronze accents, dramatic reveals. Think broadcast sports graphics meets modern web app.

- **Colors:** Deep navy `#0a1628`, gold `#FFD700`, silver `#C0C0C0`, white
- **Typography:** A bold display font for headings (Oswald or Bebas Neue from Google Fonts), clean sans for body
- **Animations:** Podium reveals should be dramatic — staggered slide-in, medal shine effect
- **Medal badges:** Gold and silver with subtle gradients, not flat colors

---

## Phase 1 Deliverable (What Claude Code Should Build First)

1. ✅ Project scaffold (Vite + React + TS + Tailwind)
2. ✅ Supabase client setup + auth (email/password + Google OAuth)
3. ✅ Database migration SQL file
4. ✅ Event plugin types and registry (empty stubs for all 5 events)
5. ✅ Zustand store with auth state
6. ✅ All page components (stubbed with correct routing)
7. ✅ Olympics creation flow (pick events, generate invite code)
8. ✅ Join Olympics flow (enter invite code)
9. ✅ Waiting room / lobby with realtime presence
10. ✅ `useOlympics` hook with Supabase queries
11. ✅ Olympics engine core functions
12. ✅ Basic medal standings component
13. ✅ **Sudoku event — fully implemented** (first complete game)

Phase 2: Implement remaining 4 events one by one.
Phase 3: Polish, animations, leaderboards, shareable result cards.

---

## Key Decisions & Constraints

- **Same puzzle for both players** in async events — store the puzzle seed/ID in `olympics_events` metadata column so both players get identical content
- **No time limit enforcement server-side** for async events — trust client timestamps (add server validation later)
- **Realtime games require both players online** — show a "waiting for opponent to reconnect" state if connection drops
- **Tie-breaking** — ties award gold to the player who completed the event first (`completedAt` timestamp)
- **Olympics can't start until P2 joins** — lobby polls/subscribes to the olympics row until `player2_id` is populated

---

## Adding a New Event (Future Reference)

1. Create `src/events/[name]/` directory
2. Implement `OlympicsEvent` interface in `index.ts`
3. Build game component in `[Name]Game.tsx`
4. Add to `src/events/registry.ts`
5. That's it — the engine and routing handle the rest automatically
