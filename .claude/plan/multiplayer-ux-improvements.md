# Implementation Plan: Multiplayer UX Improvements

## Overview

Improve both **async** and **realtime** multiplayer modes to enhance user experience and reduce friction in common workflows.

### Key Goals

1. **Async Mode**: Allow single-player start → complete → share flow with easy link/code sharing
2. **Realtime Mode**: Add "rematch" capability so paired players can play multiple Olympics without re-linking

---

## Current State Analysis

### Async Mode (Current Issues)
- ✅ P1 can play alone and share code after completion
- ❌ No shareable link option (only invite code)
- ❌ Code display is small and not prominently featured
- ❌ No "Share via..." native sharing options
- ❌ Copying just the code requires manual context when texting

### Realtime Mode (Current Issues)
- ✅ Both players can join and play together
- ❌ "Rematch" creates a NEW Olympics with NEW invite code
- ❌ P2 must re-enter code for every new game
- ❌ No persistent "session" concept for rematches
- ❌ After rematch, navigation flow is confusing

---

## Technical Solution

### Part 1: Enhanced Sharing System (Async + Realtime)

**Goal**: Make sharing super easy with both link and code options

#### 1.1 Shareable Links
- Generate shareable URL: `https://meyerolympics.vercel.app/join/{inviteCode}`
- URL already supported in routing (`/join/:inviteCode`)
- Add "Copy Link" button alongside "Copy Code" button
- Add native share support via Web Share API (for mobile)

#### 1.2 Enhanced Share UI Components
Create a reusable `ShareOlympics` component with:
- Large, prominent invite code display
- "Copy Code" button
- "Copy Link" button
- "Share" button (uses Web Share API if available)
- Visual feedback on copy (checkmark animation)

### Part 2: Async Mode Improvements

**Goal**: Streamlined solo-play-then-share experience

#### 2.1 Post-Completion Share Screen
- After P1 completes all events, show dedicated share screen
- Prominent "Challenge a Friend" messaging
- All share options (code, link, native share)
- Preview of P1's results as "challenge"
- Clear CTA with visual hierarchy

#### 2.2 Join Experience
- When P2 joins via link, show what they're challenging
- Display P1's name and medal count as motivation
- "Accept Challenge" button to start

### Part 3: Realtime Rematch System

**Goal**: Persistent session for multiple rematches without re-linking

#### 3.1 Session Concept
Introduce a `game_sessions` table to link multiple Olympics:

```sql
CREATE TABLE game_sessions (
  id UUID PRIMARY KEY,
  session_code TEXT UNIQUE NOT NULL,  -- persistent 8-char code
  player1_id UUID REFERENCES profiles(id),
  player2_id UUID REFERENCES profiles(id),
  mode TEXT DEFAULT 'realtime',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_active_at TIMESTAMPTZ DEFAULT NOW()
);

-- Link Olympics to sessions
ALTER TABLE olympics ADD COLUMN session_id UUID REFERENCES game_sessions(id);
```

#### 3.2 Rematch Flow
When "Rematch" is clicked in realtime mode:
1. Check if Olympics has a `session_id`
2. If yes: Create new Olympics linked to same session
3. Both players auto-redirect to new Olympics lobby (no re-linking needed)
4. Session persists for future rematches

#### 3.3 Session-Based Lobby
For realtime sessions:
- Show session code (not individual Olympics code)
- Both players share same session
- "New Game" creates new Olympics within session
- Session history shows past games played

### Part 4: Unified Navigation Improvements

#### 4.1 Post-Game Actions
After Olympics completes:
- **Async (no P2)**: "Share Challenge" → Share screen
- **Async (with P2)**: "View Results" → Final ceremony, "Rematch" option
- **Realtime**: "Rematch" → Same session, new Olympics

#### 4.2 URL Structure
- `/join/{code}` - Works for both invite codes and session codes
- `/session/{sessionId}` - Session lobby (realtime)
- `/olympics/{id}/*` - Individual Olympics routes (unchanged)

---

## Implementation Steps

### Phase 1: Share Component & UI (Frontend Only)
**Estimated: Low complexity**

1. Create `src/components/shared/ShareOlympics.tsx`
   - Props: `inviteCode`, `title`, `message`
   - Copy code button with visual feedback
   - Copy link button (generates full URL)
   - Native share button (Web Share API with fallback)

2. Update `src/pages/OlympicsSummary.tsx`
   - Replace inline share UI with `<ShareOlympics>` component
   - Add better visual hierarchy for "Challenge a Friend" flow

3. Update `src/components/lobby/WaitingRoom.tsx`
   - Use `<ShareOlympics>` component for invite code display
   - Add "Copy Link" option

### Phase 2: Game Sessions (Database + Backend)
**Estimated: Medium complexity**

1. Create migration `005_game_sessions.sql`:
   - Create `game_sessions` table
   - Add `session_id` column to `olympics`
   - Add indexes for session lookups

2. Update `src/engine/OlympicsEngine.ts`:
   - Add `createSession()` function
   - Add `joinSession()` function
   - Modify `create()` to optionally link to session
   - Add `rematchInSession()` function

3. Update `src/engine/useOlympics.ts`:
   - Add session state and methods
   - Add `rematch()` that preserves session

### Phase 3: Rematch Flow (Frontend)
**Estimated: Medium complexity**

1. Update `src/pages/OlympicsSummary.tsx`:
   - Modify `handleRematch` to use session-aware rematch
   - For realtime: stay in same session
   - For async: create new standalone Olympics

2. Update `src/components/podium/FinalCeremony.tsx`:
   - Pass session info to rematch handler
   - Update button text based on mode

3. Create `src/pages/SessionLobby.tsx` (optional):
   - Show session history
   - "New Game" button for session
   - Works for persistent realtime sessions

### Phase 4: Polish & Edge Cases
**Estimated: Low complexity**

1. Handle session expiration (24h inactivity?)
2. Handle player2 leaving mid-session
3. Add loading states for rematch creation
4. Test both flows end-to-end

---

## Key Files to Modify

| File | Operation | Description |
|------|-----------|-------------|
| `src/components/shared/ShareOlympics.tsx` | Create | Reusable share component |
| `src/pages/OlympicsSummary.tsx` | Modify | Use ShareOlympics, improve share flow |
| `src/components/lobby/WaitingRoom.tsx` | Modify | Use ShareOlympics, add link copy |
| `supabase/migrations/005_game_sessions.sql` | Create | Session table and Olympics FK |
| `src/engine/OlympicsEngine.ts` | Modify | Add session CRUD functions |
| `src/engine/useOlympics.ts` | Modify | Add session-aware rematch |
| `src/lib/database.types.ts` | Modify | Add GameSession type |
| `src/components/podium/FinalCeremony.tsx` | Modify | Session-aware rematch button |

---

## Risks and Mitigation

| Risk | Mitigation |
|------|------------|
| Session state complexity | Start with simple session model, expand later |
| Web Share API not available | Fallback to copy buttons (already planned) |
| Migration conflicts | Test migration on dev DB first |
| P2 leaves session permanently | Add "Leave Session" option, session cleanup |
| URL sharing issues (auth required) | Show clear "Sign in to accept challenge" flow |

---

## Alternative Approach (Simpler)

If the full session system is too complex for now, a **minimal rematch** can be achieved:

1. **Store opponent in local storage** after first game
2. **"Quick Rematch" button** that creates new Olympics
3. **Pre-populate P2** if they're still logged in
4. Requires both players to click "rematch" but no re-entering code

This is less elegant but simpler to implement.

---

## Pseudo-Code: Key Components

### ShareOlympics Component
```tsx
function ShareOlympics({ inviteCode, title, message }) {
  const shareUrl = `${window.location.origin}/join/${inviteCode}`

  const copyCode = () => navigator.clipboard.writeText(inviteCode)
  const copyLink = () => navigator.clipboard.writeText(shareUrl)
  const nativeShare = () => navigator.share({ title, text: message, url: shareUrl })

  return (
    <div>
      <CodeDisplay code={inviteCode} />
      <Button onClick={copyCode}>Copy Code</Button>
      <Button onClick={copyLink}>Copy Link</Button>
      {navigator.canShare && <Button onClick={nativeShare}>Share</Button>}
    </div>
  )
}
```

### Session-Aware Rematch
```tsx
async function rematchInSession(olympicsId, sessionId) {
  // If session exists, create new Olympics in same session
  // If no session, create new session and Olympics
  const newOlympics = await supabase
    .from('olympics')
    .insert({
      ...originalSettings,
      session_id: sessionId,
      player2_id: originalOlympics.player2_id  // Keep same opponent
    })

  return newOlympics
}
```

### Session Lobby State
```tsx
function useSession(sessionId) {
  const [session, setSession] = useState(null)
  const [olympicsHistory, setOlympicsHistory] = useState([])

  // Fetch session and all Olympics in session
  // Subscribe to session updates
  // Return: session, createNewGame(), leaveSession()
}
```

---

## Recommended Implementation Order

1. **Start with Share UI** (Phase 1) - Quick win, improves both modes immediately
2. **Add basic rematch** (Phase 3 simplified) - Using localStorage for opponent memory
3. **Add sessions** (Phase 2) if persistent rematching is highly desired
4. **Polish** (Phase 4) as issues are discovered

This order provides incremental value and allows user feedback before committing to the full session system.
