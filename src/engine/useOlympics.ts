import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import {
  subscribeToOlympics,
  unsubscribeFromOlympics,
} from '@/lib/realtime'
import type { Olympics, OlympicsEvent, EventResult, Profile, GameSession } from '@/lib/database.types'
import type { RealtimeChannel } from '@supabase/supabase-js'
import {
  createOlympics,
  joinOlympics,
  startOlympics,
  startEvent,
  submitEventResult,
  getOlympicsWithDetails,
  getEventResults,
  rematchInSession,
} from './OlympicsEngine'
import type { MatchResult, EventType, EventOptions } from '@/events/types'
import { useAppStore } from '@/store/useAppStore'

interface UseOlympicsReturn {
  // Data
  olympics: Olympics | null
  events: OlympicsEvent[] | null
  currentEvent: OlympicsEvent | null
  player1Profile: Profile | null
  player2Profile: Profile | null
  currentEventResults: EventResult[] | null
  session: GameSession | null

  // Loading states
  isLoading: boolean
  isCreating: boolean
  isJoining: boolean
  isStarting: boolean
  isSubmitting: boolean
  isRematching: boolean

  // Actions
  create: (eventSequence: EventType[], mode?: 'async' | 'realtime', eventOptions?: EventOptions) => Promise<Olympics | null>
  join: (inviteCode: string) => Promise<Olympics | null>
  start: () => Promise<boolean>
  beginEvent: (eventId?: string) => Promise<OlympicsEvent | null>
  submitResult: (result: MatchResult, eventId?: string) => Promise<boolean>
  rematch: (eventSequence?: EventType[], eventOptions?: EventOptions) => Promise<Olympics | null>
  refetch: () => void

  // Error
  error: Error | null
}

interface UseOlympicsOptions {
  /** Disable realtime subscription to reduce WebSocket connections */
  disableRealtime?: boolean
}

export function useOlympics(olympicsId?: string, options?: UseOlympicsOptions): UseOlympicsReturn {
  const queryClient = useQueryClient()
  const { user, setCurrentOlympics, setCurrentOlympicsEvents } = useAppStore()
  const [_channel, setChannel] = useState<RealtimeChannel | null>(null)
  const disableRealtime = options?.disableRealtime ?? false

  // Fetch Olympics data
  const {
    data: olympicsData,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['olympics', olympicsId],
    queryFn: async () => {
      if (!olympicsId) return { olympics: null, events: null }
      return getOlympicsWithDetails(olympicsId)
    },
    enabled: !!olympicsId,
    refetchOnWindowFocus: false,
    // Poll every 2 seconds in these cases (fallback since realtime isn't reliable):
    // 1. In lobby waiting for player2 or game start
    // 2. During active game (to sync event status between players)
    refetchInterval: (query) => {
      const data = query.state.data
      const status = data?.olympics?.status
      if (status === 'lobby' || status === 'active') {
        return 2000
      }
      return false
    },
  })

  const olympics = olympicsData?.olympics ?? null
  const events = olympicsData?.events ?? null

  // Update store when data changes
  useEffect(() => {
    setCurrentOlympics(olympics)
    setCurrentOlympicsEvents(events)
  }, [olympics, events, setCurrentOlympics, setCurrentOlympicsEvents])

  // Get current event
  const currentEvent = events?.find(
    (e) => e.event_index === olympics?.current_event_index
  ) ?? null

  // Fetch player profiles
  const { data: player1Profile } = useQuery({
    queryKey: ['profile', olympics?.player1_id],
    queryFn: async () => {
      if (!olympics?.player1_id) return null
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', olympics.player1_id)
        .single()
      return data
    },
    enabled: !!olympics?.player1_id,
  })

  const { data: player2Profile, refetch: refetchPlayer2Profile } = useQuery({
    queryKey: ['profile', olympics?.player2_id],
    queryFn: async () => {
      if (!olympics?.player2_id) return null
      console.log('[useOlympics] Fetching player2 profile:', olympics.player2_id)
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', olympics.player2_id)
        .single()
      console.log('[useOlympics] Player2 profile result:', data)
      return data
    },
    enabled: !!olympics?.player2_id,
  })

  // Force refetch player2 profile when player2_id changes
  useEffect(() => {
    if (olympics?.player2_id) {
      console.log('[useOlympics] player2_id detected, refetching profile:', olympics.player2_id)
      refetchPlayer2Profile()
    }
  }, [olympics?.player2_id, refetchPlayer2Profile])

  // Fetch current event results
  const { data: currentEventResults } = useQuery({
    queryKey: ['eventResults', currentEvent?.id],
    queryFn: async () => {
      if (!currentEvent?.id) return null
      const { results } = await getEventResults(currentEvent.id)
      return results
    },
    enabled: !!currentEvent?.id,
  })

  // Fetch session if olympics has one
  const { data: session } = useQuery({
    queryKey: ['session', olympics?.session_id],
    queryFn: async () => {
      if (!olympics?.session_id) return null
      const { data } = await supabase
        .from('game_sessions')
        .select('*')
        .eq('id', olympics.session_id)
        .single()
      return data
    },
    enabled: !!olympics?.session_id,
  })

  // Subscribe to realtime updates (can be disabled to reduce WebSocket connections)
  useEffect(() => {
    if (!olympicsId || disableRealtime) return

    const newChannel = subscribeToOlympics(
      olympicsId,
      (updatedOlympics) => {
        queryClient.setQueryData(['olympics', olympicsId], (old: typeof olympicsData) => ({
          ...old,
          olympics: updatedOlympics,
        }))
        // When player2 joins, invalidate their profile query to trigger a fetch
        if (updatedOlympics.player2_id) {
          queryClient.invalidateQueries({ queryKey: ['profile', updatedOlympics.player2_id] })
        }
      },
      (updatedEvent) => {
        queryClient.setQueryData(['olympics', olympicsId], (old: typeof olympicsData) => {
          if (!old?.events) return old
          return {
            ...old,
            events: old.events.map((e) =>
              e.id === updatedEvent.id ? updatedEvent : e
            ),
          }
        })
      },
      (_newResult) => {
        // Refetch results when a new one is inserted
        queryClient.invalidateQueries({ queryKey: ['eventResults'] })
      }
    )

    setChannel(newChannel)

    return () => {
      if (newChannel) {
        unsubscribeFromOlympics(newChannel)
      }
    }
  }, [olympicsId, queryClient, disableRealtime])

  // Create Olympics mutation
  const createMutation = useMutation({
    mutationFn: async ({
      eventSequence,
      mode,
      eventOptions,
    }: {
      eventSequence: EventType[]
      mode: 'async' | 'realtime'
      eventOptions?: EventOptions
    }) => {
      console.log('createMutation called, user:', user)
      if (!user) throw new Error('Must be logged in')
      console.log('Calling createOlympics with:', user.id, eventSequence, mode, eventOptions)
      const result = await createOlympics(user.id, eventSequence, mode, eventOptions)
      console.log('createOlympics result:', result)
      if (result.error) throw result.error
      return result.olympics
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['olympics'] })
      }
    },
  })

  // Join Olympics mutation
  const joinMutation = useMutation({
    mutationFn: async (inviteCode: string) => {
      if (!user) throw new Error('Must be logged in')
      const result = await joinOlympics(inviteCode, user.id)
      if (result.error) throw result.error
      return result.olympics
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['olympics'] })
    },
  })

  // Start Olympics mutation
  const startMutation = useMutation({
    mutationFn: async () => {
      if (!olympicsId) throw new Error('No Olympics ID')
      const result = await startOlympics(olympicsId)
      if (result.error) throw result.error
      return result.success
    },
    onSuccess: () => {
      refetch()
    },
  })

  // Begin event mutation (assigns puzzle)
  const beginEventMutation = useMutation({
    mutationFn: async (eventId?: string) => {
      // Use provided eventId, or fall back to currentEvent
      const targetEventId = eventId || currentEvent?.id
      if (!targetEventId) throw new Error('No event ID provided')
      // Pass user ID for seen content tracking
      const result = await startEvent(targetEventId, user?.id)
      if (result.error) throw result.error
      return result.event
    },
    onSuccess: () => {
      refetch()
    },
  })

  // Submit result mutation
  const submitResultMutation = useMutation({
    mutationFn: async ({ result, eventId }: { result: MatchResult; eventId?: string }) => {
      // Use provided eventId, or fall back to currentEvent
      const targetEventId = eventId || currentEvent?.id
      if (!targetEventId || !user) throw new Error('Missing event ID or user')
      const submitRes = await submitEventResult(targetEventId, user.id, result)
      if (submitRes.error) throw submitRes.error
      return submitRes.success
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['eventResults'] })
      refetch()
    },
  })

  // Rematch mutation (session-aware)
  const rematchMutation = useMutation({
    mutationFn: async ({
      eventSequence,
      eventOptions,
    }: {
      eventSequence?: EventType[]
      eventOptions?: EventOptions
    }) => {
      if (!olympicsId || !olympics) throw new Error('No Olympics to rematch')
      // Use same events if not specified
      const events = eventSequence || (olympics.event_sequence as EventType[])
      const result = await rematchInSession(olympicsId, events, eventOptions)
      if (result.error) throw result.error
      return result.olympics
    },
    onSuccess: (data) => {
      if (data) {
        queryClient.invalidateQueries({ queryKey: ['olympics'] })
      }
    },
  })

  // Action wrappers
  const create = useCallback(
    async (eventSequence: EventType[], mode: 'async' | 'realtime' = 'async', eventOptions?: EventOptions) => {
      return createMutation.mutateAsync({ eventSequence, mode, eventOptions })
    },
    [createMutation]
  )

  const join = useCallback(
    async (inviteCode: string) => {
      return joinMutation.mutateAsync(inviteCode)
    },
    [joinMutation]
  )

  const start = useCallback(async () => {
    return startMutation.mutateAsync()
  }, [startMutation])

  const beginEvent = useCallback(async (eventId?: string) => {
    return beginEventMutation.mutateAsync(eventId)
  }, [beginEventMutation])

  const submitResult = useCallback(
    async (result: MatchResult, eventId?: string) => {
      return submitResultMutation.mutateAsync({ result, eventId })
    },
    [submitResultMutation]
  )

  const rematch = useCallback(
    async (eventSequence?: EventType[], eventOptions?: EventOptions) => {
      return rematchMutation.mutateAsync({ eventSequence, eventOptions })
    },
    [rematchMutation]
  )

  return {
    olympics,
    events,
    currentEvent,
    player1Profile: player1Profile ?? null,
    player2Profile: player2Profile ?? null,
    currentEventResults: currentEventResults ?? null,
    session: session ?? null,
    isLoading,
    isCreating: createMutation.isPending,
    isJoining: joinMutation.isPending,
    isStarting: startMutation.isPending,
    isSubmitting: submitResultMutation.isPending,
    isRematching: rematchMutation.isPending,
    create,
    join,
    start,
    beginEvent,
    submitResult,
    rematch,
    refetch,
    error: error as Error | null,
  }
}
