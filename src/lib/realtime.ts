import { RealtimeChannel } from '@supabase/supabase-js'
import { supabase } from './supabase'
import type { Olympics, OlympicsEvent, EventResult } from './database.types'

export type OlympicsChangeHandler = (olympics: Olympics) => void
export type EventChangeHandler = (event: OlympicsEvent) => void
export type ResultInsertHandler = (result: EventResult) => void

export function subscribeToOlympics(
  olympicsId: string,
  onOlympicsChange: OlympicsChangeHandler,
  onEventChange: EventChangeHandler,
  onResultInsert: ResultInsertHandler
): RealtimeChannel {
  const channel = supabase
    .channel(`olympics:${olympicsId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'olympics',
        filter: `id=eq.${olympicsId}`,
      },
      (payload) => {
        onOlympicsChange(payload.new as Olympics)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'olympics_events',
        filter: `olympics_id=eq.${olympicsId}`,
      },
      (payload) => {
        onEventChange(payload.new as OlympicsEvent)
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'event_results',
      },
      (payload) => {
        onResultInsert(payload.new as EventResult)
      }
    )
    .subscribe()

  return channel
}

export function unsubscribeFromOlympics(channel: RealtimeChannel): void {
  supabase.removeChannel(channel)
}

export interface PresenceState {
  odlineAt: string
  oderer: string
}

export function subscribeToLobbyPresence(
  olympicsId: string,
  onSync: (presences: Record<string, PresenceState[]>) => void
): RealtimeChannel {
  const channel = supabase.channel(`lobby:${olympicsId}`)

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState<PresenceState>()
      onSync(state)
    })
    .subscribe()

  return channel
}

export async function trackPresence(
  channel: RealtimeChannel,
  userId: string
): Promise<void> {
  await channel.track({
    onlineAt: new Date().toISOString(),
    userId,
  })
}
