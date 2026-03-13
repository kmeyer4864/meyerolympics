import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type { Location } from './locations'
import { calculateDistance } from './locations'

export interface GuessResult {
  locationIndex: number
  guess: { lat: number; lng: number }
  distance: number
}

type RealtimeMessageType =
  | 'PLAYER_READY'
  | 'PLAYER_GUESS'
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE'
  | 'LOCATION_ADVANCE'

interface RealtimeMessage {
  type: RealtimeMessageType
  playerId: string
  timestamp: number
  payload: Record<string, unknown>
}

interface PlayerGuessPayload {
  locationIndex: number
  guess: { lat: number; lng: number }
  distance: number
}

interface UseGeographyRealtimeProps {
  eventId: string
  playerId: string
  locations: Location[]
  onGameComplete: (guessResults: GuessResult[]) => void
}

interface UseGeographyRealtimeReturn {
  currentLocationIndex: number
  isConnected: boolean
  opponentConnected: boolean
  bothReady: boolean
  myGuess: GuessResult | null
  opponentGuess: GuessResult | null
  waitingForOpponent: boolean
  allMyGuesses: GuessResult[]
  allOpponentGuesses: GuessResult[]
  submitGuess: (lat: number, lng: number) => void
  advanceToNextLocation: () => void
  setReady: () => void
  isComplete: boolean
  // Error handling
  connectionError: string | null
  retryConnection: () => void
}

export function useGeographyRealtime({
  eventId,
  playerId,
  locations,
  onGameComplete,
}: UseGeographyRealtimeProps): UseGeographyRealtimeReturn {
  const [isConnected, setIsConnected] = useState(false)
  const [opponentConnected, setOpponentConnected] = useState(false)
  const [myReady, setMyReady] = useState(false)
  const [opponentReady, setOpponentReady] = useState(false)
  const [currentLocationIndex, setCurrentLocationIndex] = useState(0)
  const [myGuesses, setMyGuesses] = useState<GuessResult[]>([])
  const [opponentGuesses, setOpponentGuesses] = useState<GuessResult[]>([])
  const [waitingForOpponent, setWaitingForOpponent] = useState(false)
  const [isComplete, setIsComplete] = useState(false)
  const [connectionError, setConnectionError] = useState<string | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const gameCompletedRef = useRef(false)

  // Use refs for values needed in message handler to avoid stale closures
  const currentLocationIndexRef = useRef(currentLocationIndex)
  const myGuessesRef = useRef(myGuesses)
  const opponentGuessesRef = useRef(opponentGuesses)
  const myReadyRef = useRef(myReady)

  // Keep refs in sync with state
  useEffect(() => {
    currentLocationIndexRef.current = currentLocationIndex
  }, [currentLocationIndex])

  useEffect(() => {
    myGuessesRef.current = myGuesses
  }, [myGuesses])

  useEffect(() => {
    opponentGuessesRef.current = opponentGuesses
  }, [opponentGuesses])

  useEffect(() => {
    myReadyRef.current = myReady
  }, [myReady])

  // Get current guesses for the current location
  const myCurrentGuess = myGuesses.find(g => g.locationIndex === currentLocationIndex) ?? null
  const opponentCurrentGuess = opponentGuesses.find(g => g.locationIndex === currentLocationIndex) ?? null

  // Broadcast a message to opponent
  const broadcastMessage = useCallback((message: RealtimeMessage) => {
    if (channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: message,
      })
    }
  }, [])

  // Set up realtime channel (following Hold'em pattern)
  useEffect(() => {
    const channelName = `geography:${eventId}`
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: playerId },
      },
    })

    channelRef.current = channel

    // Handle presence sync
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const players = Object.keys(state)

      setIsConnected(true)

      if (players.length >= 2) {
        setOpponentConnected(true)
      } else {
        setOpponentConnected(false)
      }
    })

    // Handle player leave events
    channel.on('presence', { event: 'leave' }, () => {
      const state = channel.presenceState()
      const players = Object.keys(state)
      setOpponentConnected(players.length >= 2)
    })

    // Handle broadcast messages
    channel.on('broadcast', { event: 'message' }, ({ payload }) => {
      const message = payload as RealtimeMessage

      // Ignore our own messages
      if (message.playerId === playerId) return

      switch (message.type) {
        case 'PLAYER_READY':
          setOpponentReady(true)
          break

        case 'PLAYER_GUESS': {
          const guessPayload = message.payload as unknown as PlayerGuessPayload

          setOpponentGuesses(prev => {
            // Check if we already have a guess for this location
            const exists = prev.some(g => g.locationIndex === guessPayload.locationIndex)
            if (exists) return prev

            return [...prev, {
              locationIndex: guessPayload.locationIndex,
              guess: guessPayload.guess,
              distance: guessPayload.distance,
            }]
          })

          // If we were waiting for opponent, we're no longer waiting
          setWaitingForOpponent(false)
          break
        }

        case 'LOCATION_ADVANCE':
          // Opponent is advancing - handled for sync awareness
          break

        case 'SYNC_REQUEST':
          // Opponent is requesting state sync - send our state
          channelRef.current?.send({
            type: 'broadcast',
            event: 'message',
            payload: {
              type: 'SYNC_RESPONSE',
              playerId,
              timestamp: Date.now(),
              payload: {
                currentLocationIndex: currentLocationIndexRef.current,
                guesses: myGuessesRef.current,
                ready: myReadyRef.current,
              },
            },
          })
          break

        case 'SYNC_RESPONSE': {
          // We received state from opponent
          const syncPayload = message.payload as {
            currentLocationIndex: number
            guesses: GuessResult[]
            ready: boolean
          }

          // Update opponent guesses
          setOpponentGuesses(syncPayload.guesses)

          // Update opponent ready state
          if (syncPayload.ready) {
            setOpponentReady(true)
          }
          break
        }
      }
    })

    // Subscribe to channel with detailed error logging
    channel.subscribe(async (status, err) => {
      console.log('[Geography] Subscription status:', status, err?.message || '')

      if (status === 'SUBSCRIBED') {
        try {
          await channel.track({
            online_at: new Date().toISOString(),
          })
          setIsConnected(true)
          setConnectionError(null)
        } catch (trackErr) {
          console.error('[Geography] Failed to track presence:', trackErr)
          setConnectionError('Failed to join game session')
        }
      } else if (status === 'CHANNEL_ERROR') {
        console.error('[Geography] Channel error:', err)
        setConnectionError(`Connection error: ${err?.message || 'Unknown error'}`)
      } else if (status === 'TIMED_OUT') {
        console.error('[Geography] Connection timed out')
        setConnectionError('Connection timed out. Please check your network.')
      } else if (status === 'CLOSED') {
        console.log('[Geography] Channel closed')
        setIsConnected(false)
      }
    })

    return () => {
      console.log('[Geography] Cleaning up channel')
      supabase.removeChannel(channel)
    }
  }, [eventId, playerId])

  // Retry connection handler
  const retryConnection = useCallback(() => {
    // Force a re-render by clearing state and redirecting
    window.location.reload()
  }, [])

  // Set ready status
  const setReady = useCallback(() => {
    setMyReady(true)
    broadcastMessage({
      type: 'PLAYER_READY',
      playerId,
      timestamp: Date.now(),
      payload: { ready: true },
    })
  }, [playerId, broadcastMessage])

  // Submit a guess
  const submitGuess = useCallback((lat: number, lng: number) => {
    const currentLocation = locations[currentLocationIndex]
    if (!currentLocation) return

    // Check if we already guessed for this location
    const existingGuess = myGuesses.find(g => g.locationIndex === currentLocationIndex)
    if (existingGuess) return

    const distance = calculateDistance(lat, lng, currentLocation.lat, currentLocation.lng)

    const guessResult: GuessResult = {
      locationIndex: currentLocationIndex,
      guess: { lat, lng },
      distance,
    }

    setMyGuesses(prev => [...prev, guessResult])

    // Broadcast to opponent
    broadcastMessage({
      type: 'PLAYER_GUESS',
      playerId,
      timestamp: Date.now(),
      payload: {
        locationIndex: currentLocationIndex,
        guess: { lat, lng },
        distance,
      },
    })

    // Check if opponent has already guessed
    const opponentGuessForThisLocation = opponentGuesses.find(
      g => g.locationIndex === currentLocationIndex
    )
    if (!opponentGuessForThisLocation) {
      setWaitingForOpponent(true)
    }
  }, [currentLocationIndex, locations, myGuesses, opponentGuesses, playerId, broadcastMessage])

  // Advance to next location
  const advanceToNextLocation = useCallback(() => {
    const nextIndex = currentLocationIndex + 1

    if (nextIndex >= locations.length) {
      // Game complete
      if (!gameCompletedRef.current) {
        gameCompletedRef.current = true
        setIsComplete(true)
        onGameComplete(myGuesses)
      }
    } else {
      setCurrentLocationIndex(nextIndex)
      setWaitingForOpponent(false)

      // Broadcast advance to keep in sync
      broadcastMessage({
        type: 'LOCATION_ADVANCE',
        playerId,
        timestamp: Date.now(),
        payload: { locationIndex: nextIndex },
      })
    }
  }, [currentLocationIndex, locations.length, myGuesses, onGameComplete, playerId, broadcastMessage])

  return {
    currentLocationIndex,
    isConnected,
    opponentConnected,
    bothReady: myReady && opponentReady,
    myGuess: myCurrentGuess,
    opponentGuess: opponentCurrentGuess,
    waitingForOpponent,
    allMyGuesses: myGuesses,
    allOpponentGuesses: opponentGuesses,
    submitGuess,
    advanceToNextLocation,
    setReady,
    isComplete,
    connectionError,
    retryConnection,
  }
}
