import { supabase } from '@/lib/supabase'
import type { Olympics, OlympicsEvent as DBOlympicsEvent, EventResult } from '@/lib/database.types'
import { getEvent, isValidEventType } from '@/events/registry'
import type { MatchResult, EventType, EventOptions } from '@/events/types'

const QUERY_TIMEOUT_MS = 10000

// Wrap a Supabase query with a timeout
async function queryWithTimeout<T>(
  queryFn: () => PromiseLike<T>,
  operation: string
): Promise<T> {
  return Promise.race([
    Promise.resolve(queryFn()),
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${operation} timed out`)), QUERY_TIMEOUT_MS)
    ),
  ])
}

// Generate a human-readable invite code (8 alphanumeric chars, no confusing characters)
export function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789' // no I/O/0/1
  return Array.from({ length: 8 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join('')
}

// Create a new Olympics
export async function createOlympics(
  player1Id: string,
  eventSequence: EventType[],
  mode: 'async' | 'realtime' = 'async',
  eventOptions?: EventOptions
): Promise<{ olympics: Olympics | null; error: Error | null }> {
  const inviteCode = generateInviteCode()

  try {
    const { data: olympics, error } = await queryWithTimeout(
      () => supabase
        .from('olympics')
        .insert({
          invite_code: inviteCode,
          player1_id: player1Id,
          event_sequence: eventSequence,
          mode,
        })
        .select()
        .single(),
      'Create Olympics'
    )

    if (error) {
      return { olympics: null, error: new Error(error.message) }
    }

    // Create stub olympics_events for each event in sequence
    const eventsToInsert = eventSequence.map((eventType, index) => ({
      olympics_id: olympics.id,
      event_index: index,
      event_type: eventType,
      status: 'pending' as const,
      config: eventOptions?.[eventType] || {},
    }))

    const { error: eventsError } = await queryWithTimeout(
      () => supabase
        .from('olympics_events')
        .insert(eventsToInsert),
      'Create Olympics Events'
    )

    if (eventsError) {
      // Clean up the olympics if events failed to create
      await supabase.from('olympics').delete().eq('id', olympics.id)
      return { olympics: null, error: new Error(eventsError.message) }
    }

    return { olympics, error: null }
  } catch (err) {
    console.error('createOlympics: exception', err)
    return { olympics: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// Join an Olympics by invite code
export async function joinOlympics(
  inviteCode: string,
  player2Id: string
): Promise<{ olympics: Olympics | null; error: Error | null }> {
  try {
    // First, find the Olympics (with timeout)
    const { data: olympics, error: findError } = await queryWithTimeout(
      () => supabase
        .from('olympics')
        .select('*')
        .eq('invite_code', inviteCode.toUpperCase())
        .single(),
      'Find Olympics'
    )

    if (findError || !olympics) {
      return { olympics: null, error: new Error('Olympics not found') }
    }

    if (olympics.player2_id) {
      return { olympics: null, error: new Error('Olympics already has two players') }
    }

    if (olympics.player1_id === player2Id) {
      return { olympics: null, error: new Error('You cannot join your own Olympics') }
    }

    // Update with player 2 (with timeout)
    const { data: updatedOlympics, error: updateError } = await queryWithTimeout(
      () => supabase
        .from('olympics')
        .update({ player2_id: player2Id })
        .eq('id', olympics.id)
        .select()
        .single(),
      'Join Olympics'
    )

    if (updateError) {
      return { olympics: null, error: new Error(updateError.message) }
    }

    return { olympics: updatedOlympics, error: null }
  } catch (err) {
    return { olympics: null, error: err instanceof Error ? err : new Error(String(err)) }
  }
}

// Start the Olympics (both players ready)
export async function startOlympics(
  olympicsId: string
): Promise<{ success: boolean; error: Error | null }> {
  const { error } = await supabase
    .from('olympics')
    .update({ status: 'active' })
    .eq('id', olympicsId)

  if (error) {
    return { success: false, error: new Error(error.message) }
  }

  return { success: true, error: null }
}

// Start an event (assign puzzle metadata)
export async function startEvent(
  olympicsEventId: string,
  userId?: string
): Promise<{ event: DBOlympicsEvent | null; error: Error | null }> {
  // Get the event
  const { data: event, error: fetchError } = await supabase
    .from('olympics_events')
    .select('*')
    .eq('id', olympicsEventId)
    .single()

  if (fetchError || !event) {
    return { event: null, error: new Error('Event not found') }
  }

  // If already started, return existing metadata
  if (event.started_at) {
    return { event, error: null }
  }

  // Generate puzzle metadata
  if (!isValidEventType(event.event_type)) {
    return { event: null, error: new Error('Invalid event type') }
  }

  const eventDef = getEvent(event.event_type)
  // Pass event config (e.g., difficulty) and userId to puzzle generation
  const eventConfig = (event.config as Record<string, string>) || {}
  const puzzleMetadata = eventDef.generatePuzzleMetadata({
    ...eventConfig,
    ...(userId ? { userId } : {}),
  })

  // Update the event with metadata and start time
  const { data: updatedEvent, error: updateError } = await supabase
    .from('olympics_events')
    .update({
      metadata: puzzleMetadata,
      started_at: new Date().toISOString(),
    })
    .eq('id', olympicsEventId)
    .select()
    .single()

  if (updateError) {
    return { event: null, error: new Error(updateError.message) }
  }

  return { event: updatedEvent, error: null }
}

// Submit event result
export async function submitEventResult(
  olympicsEventId: string,
  playerId: string,
  result: MatchResult
): Promise<{ success: boolean; error: Error | null }> {
  // Insert the result
  const { error: insertError } = await supabase
    .from('event_results')
    .insert({
      olympics_event_id: olympicsEventId,
      player_id: playerId,
      score: result.score,
      raw_value: result.rawValue,
      metadata: result.metadata,
      completed_at: result.completedAt,
    })

  if (insertError) {
    return { success: false, error: new Error(insertError.message) }
  }

  // Update event status
  const { data: event } = await supabase
    .from('olympics_events')
    .select('*, olympics!inner(*)')
    .eq('id', olympicsEventId)
    .single()

  if (!event) {
    return { success: false, error: new Error('Event not found') }
  }

  const olympics = event.olympics as Olympics
  const isPlayer1 = playerId === olympics.player1_id

  // Check if both players have submitted
  const { data: results } = await supabase
    .from('event_results')
    .select('*')
    .eq('olympics_event_id', olympicsEventId)

  const bothComplete = results && results.length === 2

  let newStatus: DBOlympicsEvent['status']
  if (bothComplete) {
    newStatus = 'complete'
  } else if (isPlayer1) {
    newStatus = 'p1_complete'
  } else {
    newStatus = 'p2_complete'
  }

  await supabase
    .from('olympics_events')
    .update({ status: newStatus })
    .eq('id', olympicsEventId)

  // If both complete, resolve the event
  if (bothComplete) {
    await resolveEvent(olympicsEventId)
  }

  return { success: true, error: null }
}

// Resolve event - determine gold winner
export async function resolveEvent(
  olympicsEventId: string
): Promise<{ goldWinnerId: string | null; error: Error | null }> {
  // Get the event and its results
  const { data: event } = await supabase
    .from('olympics_events')
    .select('*, olympics!inner(*)')
    .eq('id', olympicsEventId)
    .single()

  if (!event) {
    return { goldWinnerId: null, error: new Error('Event not found') }
  }

  const { data: results } = await supabase
    .from('event_results')
    .select('*')
    .eq('olympics_event_id', olympicsEventId)

  if (!results || results.length !== 2) {
    return { goldWinnerId: null, error: new Error('Not all results submitted') }
  }

  const olympics = event.olympics as Olympics
  const p1Result = results.find((r) => r.player_id === olympics.player1_id)
  const p2Result = results.find((r) => r.player_id === olympics.player2_id)

  if (!p1Result || !p2Result) {
    return { goldWinnerId: null, error: new Error('Missing player result') }
  }

  // Use the event's compare function
  if (!isValidEventType(event.event_type)) {
    return { goldWinnerId: null, error: new Error('Invalid event type') }
  }

  const eventDef = getEvent(event.event_type)

  const matchResult1: MatchResult = {
    score: Number(p1Result.score),
    rawValue: Number(p1Result.raw_value),
    completedAt: p1Result.completed_at,
    metadata: p1Result.metadata as Record<string, unknown>,
  }

  const matchResult2: MatchResult = {
    score: Number(p2Result.score),
    rawValue: Number(p2Result.raw_value),
    completedAt: p2Result.completed_at,
    metadata: p2Result.metadata as Record<string, unknown>,
  }

  const winner = eventDef.compareResults(matchResult1, matchResult2)

  let goldWinnerId: string | null = null
  if (winner === 'p1') {
    goldWinnerId = olympics.player1_id
  } else if (winner === 'p2') {
    goldWinnerId = olympics.player2_id!
  }
  // If tie, goldWinnerId stays null (or you could implement tie-breaker)

  // Update the event with the winner
  await supabase
    .from('olympics_events')
    .update({
      gold_winner_id: goldWinnerId,
      status: 'complete',
    })
    .eq('id', olympicsEventId)

  // Update Olympics medal counts
  if (goldWinnerId) {
    const isP1Winner = goldWinnerId === olympics.player1_id
    await supabase
      .from('olympics')
      .update({
        player1_gold_count: isP1Winner
          ? olympics.player1_gold_count + 1
          : olympics.player1_gold_count,
        player2_gold_count: !isP1Winner
          ? olympics.player2_gold_count + 1
          : olympics.player2_gold_count,
      })
      .eq('id', olympics.id)
  }

  // Check if this was the last event
  await advanceOlympics(olympics.id)

  return { goldWinnerId, error: null }
}

// Advance to next event or complete Olympics
export async function advanceOlympics(
  olympicsId: string
): Promise<{ isComplete: boolean; error: Error | null }> {
  const { data: olympics } = await supabase
    .from('olympics')
    .select('*')
    .eq('id', olympicsId)
    .single()

  if (!olympics) {
    return { isComplete: false, error: new Error('Olympics not found') }
  }

  const nextIndex = olympics.current_event_index + 1

  // Check if all events are complete
  if (nextIndex >= olympics.event_sequence.length) {
    // Olympics complete! Determine winner
    const winnerId =
      olympics.player1_gold_count > olympics.player2_gold_count
        ? olympics.player1_id
        : olympics.player2_gold_count > olympics.player1_gold_count
          ? olympics.player2_id
          : null // Tie

    await supabase
      .from('olympics')
      .update({
        status: 'complete',
        winner_id: winnerId,
        completed_at: new Date().toISOString(),
      })
      .eq('id', olympicsId)

    // Update player profiles with medal counts
    if (olympics.player2_id) {
      // Player 1 stats
      await supabase.rpc('increment_profile_stats', {
        profile_id: olympics.player1_id,
        gold_inc: olympics.player1_gold_count,
        silver_inc: olympics.event_sequence.length - olympics.player1_gold_count,
        olympics_inc: 1,
      })

      // Player 2 stats
      await supabase.rpc('increment_profile_stats', {
        profile_id: olympics.player2_id,
        gold_inc: olympics.player2_gold_count,
        silver_inc: olympics.event_sequence.length - olympics.player2_gold_count,
        olympics_inc: 1,
      })
    }

    return { isComplete: true, error: null }
  }

  // Advance to next event
  await supabase
    .from('olympics')
    .update({ current_event_index: nextIndex })
    .eq('id', olympicsId)

  return { isComplete: false, error: null }
}

// Check for forfeits based on timeout
export async function checkForfeits(
  olympicsId: string
): Promise<{ forfeitedBy: string | null; error: Error | null }> {
  const { data: olympics } = await supabase
    .from('olympics')
    .select('*')
    .eq('id', olympicsId)
    .single()

  if (!olympics || olympics.status !== 'active') {
    return { forfeitedBy: null, error: null }
  }

  const timeoutMs = olympics.timeout_hours * 60 * 60 * 1000

  // Get current event
  const { data: events } = await supabase
    .from('olympics_events')
    .select('*')
    .eq('olympics_id', olympicsId)
    .eq('event_index', olympics.current_event_index)
    .single()

  if (!events || !events.started_at) {
    return { forfeitedBy: null, error: null }
  }

  const elapsed = Date.now() - new Date(events.started_at).getTime()

  if (elapsed <= timeoutMs) {
    return { forfeitedBy: null, error: null }
  }

  // Check who hasn't submitted
  const { data: results } = await supabase
    .from('event_results')
    .select('player_id')
    .eq('olympics_event_id', events.id)

  const submittedPlayerIds = results?.map((r) => r.player_id) || []

  let forfeitedBy: string | null = null

  if (!submittedPlayerIds.includes(olympics.player1_id)) {
    forfeitedBy = olympics.player1_id
    await supabase
      .from('olympics')
      .update({ player1_forfeited_at: new Date().toISOString() })
      .eq('id', olympicsId)
  } else if (olympics.player2_id && !submittedPlayerIds.includes(olympics.player2_id)) {
    forfeitedBy = olympics.player2_id
    await supabase
      .from('olympics')
      .update({ player2_forfeited_at: new Date().toISOString() })
      .eq('id', olympicsId)
  }

  return { forfeitedBy, error: null }
}

// Get Olympics with all related data
export async function getOlympicsWithDetails(olympicsId: string): Promise<{
  olympics: Olympics | null
  events: DBOlympicsEvent[] | null
  error: Error | null
}> {
  const { data: olympics, error: olympicsError } = await supabase
    .from('olympics')
    .select('*')
    .eq('id', olympicsId)
    .single()

  if (olympicsError) {
    return { olympics: null, events: null, error: new Error(olympicsError.message) }
  }

  const { data: events, error: eventsError } = await supabase
    .from('olympics_events')
    .select('*')
    .eq('olympics_id', olympicsId)
    .order('event_index', { ascending: true })

  if (eventsError) {
    return { olympics, events: null, error: new Error(eventsError.message) }
  }

  return { olympics, events, error: null }
}

// Get event results for an olympics event
export async function getEventResults(olympicsEventId: string): Promise<{
  results: EventResult[] | null
  error: Error | null
}> {
  const { data: results, error } = await supabase
    .from('event_results')
    .select('*')
    .eq('olympics_event_id', olympicsEventId)

  if (error) {
    return { results: null, error: new Error(error.message) }
  }

  return { results, error: null }
}
