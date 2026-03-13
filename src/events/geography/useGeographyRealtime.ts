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

const CONNECTION_TIMEOUT_MS = 15000 // 15 seconds

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
  const [retryCount, setRetryCount] = useState(0)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const gameCompletedRef = useRef(false)
  const connectionTimeoutRef = useRef<NodeJS.Timeout | null>(null)

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
      console.log('[Geography] Broadcasting:', message.type)
      channelRef.current.send({
        type: 'broadcast',
        event: 'message',
        payload: message,
      })
    }
  }, [])

  // Request sync from other players
  const requestSync = useCallback(() => {
    console.log('[Geography] Requesting sync from other players')
    broadcastMessage({
      type: 'SYNC_REQUEST',
      playerId,
      timestamp: Date.now(),
      payload: {},
    })
  }, [playerId, broadcastMessage])

  // Clean up connection timeout
  const clearConnectionTimeout = useCallback(() => {
    if (connectionTimeoutRef.current) {
      clearTimeout(connectionTimeoutRef.current)
      connectionTimeoutRef.current = null
    }
  }, [])

  // Setup connection
  const setupConnection = useCallback(() => {
    const channelName = `geography:${eventId}`
    console.log('[Geography] Setting up connection to channel:', channelName)

    setConnectionError(null)

    // Set connection timeout
    clearConnectionTimeout()
    connectionTimeoutRef.current = setTimeout(() => {
      console.error('[Geography] Connection timeout')
      setConnectionError('Connection timed out. Please try again.')
    }, CONNECTION_TIMEOUT_MS)

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
      console.log('[Geography] Presence sync - players:', players, 'my id:', playerId)

      if (players.length >= 2) {
        console.log('[Geography] Both players detected via sync')
        setOpponentConnected(true)
        // Request sync when we detect opponent
        setTimeout(() => requestSync(), 500)
      } else {
        setOpponentConnected(false)
      }
    })

    // Handle player join events
    channel.on('presence', { event: 'join' }, ({ key, newPresences }) => {
      console.log('[Geography] Player joined:', key, newPresences)
      if (key !== playerId) {
        console.log('[Geography] Opponent joined!')
        setOpponentConnected(true)
        // Send our ready state if we're already ready
        if (myReadyRef.current) {
          setTimeout(() => {
            broadcastMessage({
              type: 'PLAYER_READY',
              playerId,
              timestamp: Date.now(),
              payload: { ready: true },
            })
          }, 300)
        }
      }
    })

    // Handle player leave events
    channel.on('presence', { event: 'leave' }, ({ key }) => {
      console.log('[Geography] Player left:', key)
      if (key !== playerId) {
        setOpponentConnected(false)
      }
    })

    // Handle broadcast messages
    channel.on('broadcast', { event: 'message' }, ({ payload }) => {
      const message = payload as RealtimeMessage

      // Ignore our own messages
      if (message.playerId === playerId) return

      console.log('[Geography] Received message:', message.type)

      switch (message.type) {
        case 'PLAYER_READY':
          console.log('[Geography] Opponent is ready')
          setOpponentReady(true)
          break

        case 'PLAYER_GUESS': {
          const guessPayload = message.payload as unknown as PlayerGuessPayload
          console.log('[Geography] Opponent guess for location:', guessPayload.locationIndex)

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

        case 'LOCATION_ADVANCE': {
          // Opponent is advancing - make sure we're in sync
          const advancePayload = message.payload as { locationIndex: number }
          console.log('[Geography] Opponent advanced to location:', advancePayload.locationIndex)
          break
        }

        case 'SYNC_REQUEST':
          // Opponent is requesting state sync - send our state
          console.log('[Geography] Responding to sync request')
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
          console.log('[Geography] Received sync response:', syncPayload)

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

    // Subscribe to channel
    channel.subscribe(async (status, err) => {
      console.log('[Geography] Channel subscription status:', status, err ? `Error: ${err.message}` : '')

      if (status === 'SUBSCRIBED') {
        clearConnectionTimeout()
        console.log('[Geography] Successfully subscribed, tracking presence...')

        try {
          await channel.track({
            online_at: new Date().toISOString(),
          })
          console.log('[Geography] Presence tracked successfully')
          setIsConnected(true)
          setConnectionError(null)
        } catch (trackError) {
          console.error('[Geography] Error tracking presence:', trackError)
          setConnectionError('Failed to join game session. Please try again.')
        }
      } else if (status === 'CHANNEL_ERROR') {
        clearConnectionTimeout()
        console.error('[Geography] Channel error:', err)
        setConnectionError('Connection error. Please try again.')
      } else if (status === 'TIMED_OUT') {
        clearConnectionTimeout()
        console.error('[Geography] Channel timed out')
        setConnectionError('Connection timed out. Please try again.')
      } else if (status === 'CLOSED') {
        console.log('[Geography] Channel closed')
        setIsConnected(false)
      }
    })

    return () => {
      clearConnectionTimeout()
      console.log('[Geography] Cleaning up channel')
      channel.unsubscribe()
    }
  }, [eventId, playerId, broadcastMessage, requestSync, clearConnectionTimeout])

  // Set up realtime channel
  useEffect(() => {
    const cleanup = setupConnection()
    return cleanup
  }, [setupConnection, retryCount])

  // Retry connection handler
  const retryConnection = useCallback(() => {
    console.log('[Geography] Retrying connection...')
    setConnectionError(null)
    setIsConnected(false)
    setRetryCount(c => c + 1)
  }, [])

  // Set ready status
  const setReady = useCallback(() => {
    console.log('[Geography] Setting myself as ready')
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

    console.log('[Geography] Submitting guess for location:', currentLocationIndex, 'distance:', distance)

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
    console.log('[Geography] Advancing to location:', nextIndex)

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
