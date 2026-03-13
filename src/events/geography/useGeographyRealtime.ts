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

  const channelRef = useRef<RealtimeChannel | null>(null)
  const gameCompletedRef = useRef(false)

  // Use refs for values needed in message handler to avoid stale closures
  const currentLocationIndexRef = useRef(currentLocationIndex)
  const myGuessesRef = useRef(myGuesses)
  const opponentGuessesRef = useRef(opponentGuesses)

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

  // Set up realtime channel
  useEffect(() => {
    const channelName = `geography:${eventId}`
    const channel = supabase.channel(channelName, {
      config: {
        presence: { key: playerId },
      },
    })

    channelRef.current = channel

    // Handle presence
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState()
      const players = Object.keys(state)
      console.log('[Geography] Presence sync - players:', players)

      setIsConnected(true)

      if (players.length >= 2) {
        setOpponentConnected(true)
      } else {
        setOpponentConnected(false)
      }
    })

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

        case 'SYNC_REQUEST':
          // Opponent is requesting state sync
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
              },
            },
          })
          break

        case 'SYNC_RESPONSE': {
          // We received state from opponent
          const syncPayload = message.payload as {
            currentLocationIndex: number
            guesses: GuessResult[]
          }
          setOpponentGuesses(syncPayload.guesses)
          break
        }
      }
    })

    // Subscribe to channel
    channel.subscribe(async (status, err) => {
      console.log('[Geography] Channel subscription status:', status, err || '')
      if (status === 'SUBSCRIBED') {
        console.log('[Geography] Tracking presence...')
        await channel.track({
          online_at: new Date().toISOString(),
        })
        console.log('[Geography] Presence tracked')
        setIsConnected(true)
      }
    })

    return () => {
      channel.unsubscribe()
    }
  }, [eventId, playerId])

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
    }
  }, [currentLocationIndex, locations.length, myGuesses, onGameComplete])

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
  }
}
