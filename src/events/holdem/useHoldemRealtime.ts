import { useEffect, useRef, useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { RealtimeChannel } from '@supabase/supabase-js'
import type {
  GameState,
  PlayerAction,
  RealtimeMessage,
  PlayerActionPayload,
  HandHistoryEntry,
} from './types'
import { WIN_THRESHOLD } from './types'
import {
  createInitialGameState,
  startNewHand,
  applyAction,
  isBettingRoundComplete,
  advanceToNextRoundOrShowdown,
  prepareNextHand,
} from './engine'

interface UseHoldemRealtimeProps {
  eventId: string
  playerId: string
  deckSeed: number
  onGameComplete: (finalChips: number) => void
}

interface UseHoldemRealtimeReturn {
  gameState: GameState | null
  handHistory: HandHistoryEntry[]
  isConnected: boolean
  opponentConnected: boolean
  bothReady: boolean
  isMyTurn: boolean
  amIPlayer1: boolean
  performAction: (action: PlayerAction) => void
  setReady: () => void
}

export function useHoldemRealtime({
  eventId,
  playerId,
  deckSeed,
  onGameComplete,
}: UseHoldemRealtimeProps): UseHoldemRealtimeReturn {
  const [gameState, setGameState] = useState<GameState | null>(null)
  const [handHistory, setHandHistory] = useState<HandHistoryEntry[]>([])
  const [isConnected, setIsConnected] = useState(false)
  const [opponentConnected, setOpponentConnected] = useState(false)
  const [myReady, setMyReady] = useState(false)
  const [opponentReady, setOpponentReady] = useState(false)
  const [amIPlayer1, setAmIPlayer1] = useState<boolean | null>(null)

  const channelRef = useRef<RealtimeChannel | null>(null)
  const gameCompletedRef = useRef(false)
  // Use refs for values needed in message handler to avoid stale closures
  const amIPlayer1Ref = useRef<boolean | null>(null)
  const gameStateRef = useRef<GameState | null>(null)
  const handHistoryRef = useRef<HandHistoryEntry[]>([])

  // Keep refs in sync with state
  useEffect(() => {
    amIPlayer1Ref.current = amIPlayer1
  }, [amIPlayer1])

  useEffect(() => {
    gameStateRef.current = gameState
  }, [gameState])

  useEffect(() => {
    handHistoryRef.current = handHistory
  }, [handHistory])

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
    const channelName = `holdem:${eventId}`
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
      console.log('[Holdem] Presence sync - players:', players)

      setIsConnected(true)

      if (players.length >= 2) {
        setOpponentConnected(true)

        // Determine player order - lowest ID alphabetically is player1
        const sortedPlayers = players.sort()
        setAmIPlayer1(sortedPlayers[0] === playerId)
      } else {
        setOpponentConnected(false)
      }
    })

    channel.on('presence', { event: 'leave' }, () => {
      const state = channel.presenceState()
      const players = Object.keys(state)
      setOpponentConnected(players.length >= 2)
    })

    // Handle broadcast messages inline to avoid dependency issues
    channel.on('broadcast', { event: 'message' }, ({ payload }) => {
      const message = payload as RealtimeMessage

      // Ignore our own messages
      if (message.playerId === playerId) return

      switch (message.type) {
        case 'PLAYER_READY':
          setOpponentReady(true)
          break

        case 'PLAYER_ACTION': {
          const actionPayload = message.payload as PlayerActionPayload

          setGameState((currentState) => {
            if (!currentState) return null
            if (actionPayload.handNumber !== currentState.handNumber) return currentState

            // Use ref for player identification
            const opponentPlayer = amIPlayer1Ref.current ? 'player2' : 'player1'

            // Apply the action
            let newState = applyAction(currentState, opponentPlayer, actionPayload.action)

            // Check if betting round is complete
            if (isBettingRoundComplete(newState)) {
              newState = advanceToNextRoundOrShowdown(newState)
            }

            return newState
          })
          break
        }

        case 'SYNC_REQUEST':
          // Opponent is requesting state sync - use refs for current values
          if (gameStateRef.current) {
            channelRef.current?.send({
              type: 'broadcast',
              event: 'message',
              payload: {
                type: 'SYNC_RESPONSE',
                playerId,
                timestamp: Date.now(),
                payload: { gameState: gameStateRef.current, handHistory: handHistoryRef.current },
              },
            })
          }
          break

        case 'SYNC_RESPONSE': {
          // We received state from opponent
          const syncPayload = message.payload as { gameState: GameState; handHistory: HandHistoryEntry[] }
          setGameState(syncPayload.gameState)
          setHandHistory(syncPayload.handHistory)
          break
        }
      }
    })

    // Subscribe to channel
    channel.subscribe(async (status, err) => {
      console.log('[Holdem] Channel subscription status:', status, err || '')
      if (status === 'SUBSCRIBED') {
        console.log('[Holdem] Tracking presence...')
        await channel.track({
          online_at: new Date().toISOString(),
        })
        console.log('[Holdem] Presence tracked')
        // Set connected immediately after successful track
        setIsConnected(true)
      }
    })

    return () => {
      console.log('[Holdem] Cleaning up channel')
      supabase.removeChannel(channel)
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

  // Initialize game when both ready
  useEffect(() => {
    if (myReady && opponentReady && amIPlayer1 !== null && !gameState) {
      const initialState = createInitialGameState(deckSeed)
      const withHand = startNewHand(initialState)
      setGameState(withHand)
    }
  }, [myReady, opponentReady, amIPlayer1, gameState, deckSeed])

  // Check for game completion
  useEffect(() => {
    if (!gameState || gameCompletedRef.current) return

    const myPlayer = amIPlayer1 ? 'player1' : 'player2'
    const myChips = gameState[myPlayer].chips
    const opponentChips = gameState[amIPlayer1 ? 'player2' : 'player1'].chips

    // Check win conditions
    if (myChips >= WIN_THRESHOLD || opponentChips === 0) {
      gameCompletedRef.current = true
      onGameComplete(myChips)
    } else if (opponentChips >= WIN_THRESHOLD || myChips === 0) {
      gameCompletedRef.current = true
      onGameComplete(myChips)
    }
  }, [gameState, amIPlayer1, onGameComplete])

  // Handle hand completion and start next hand
  useEffect(() => {
    if (!gameState || !gameState.isHandComplete) return

    // Record hand history
    const entry: HandHistoryEntry = {
      handNumber: gameState.handNumber,
      player1StartChips: 1000, // We'd need to track this better
      player2StartChips: 1000,
      player1EndChips: gameState.player1.chips,
      player2EndChips: gameState.player2.chips,
      winner: gameState.handWinner || 'tie',
      potSize: gameState.pot,
      showdownHands: gameState.showdown ? {
        player1: gameState.handWinner === 'player1' ? gameState.winningHand : undefined,
        player2: gameState.handWinner === 'player2' ? gameState.winningHand : undefined,
      } : undefined,
    }
    setHandHistory(prev => [...prev, entry])

    // Check if game should continue
    const myChips = amIPlayer1 ? gameState.player1.chips : gameState.player2.chips
    const opponentChips = amIPlayer1 ? gameState.player2.chips : gameState.player1.chips

    if (myChips >= WIN_THRESHOLD || opponentChips >= WIN_THRESHOLD ||
        myChips === 0 || opponentChips === 0) {
      // Game over - handled by previous effect
      return
    }

    // Start next hand after a delay
    const timer = setTimeout(() => {
      setGameState((currentState) => {
        if (!currentState) return null
        const nextHandState = prepareNextHand(currentState)
        return startNewHand(nextHandState)
      })
    }, 2000) // 2 second delay between hands

    return () => clearTimeout(timer)
  }, [gameState, amIPlayer1])

  // Perform an action
  const performAction = useCallback((action: PlayerAction) => {
    setGameState((currentState) => {
      if (!currentState || amIPlayer1Ref.current === null) return currentState

      const myPlayer = amIPlayer1Ref.current ? 'player1' : 'player2'

      // Check if it's our turn
      if (currentState.actingPlayer !== myPlayer) return currentState

      // Apply action locally
      let newState = applyAction(currentState, myPlayer, action)

      // Check if betting round is complete
      if (isBettingRoundComplete(newState)) {
        newState = advanceToNextRoundOrShowdown(newState)
      }

      // Broadcast action to opponent
      broadcastMessage({
        type: 'PLAYER_ACTION',
        playerId,
        timestamp: Date.now(),
        payload: {
          handNumber: currentState.handNumber,
          action,
        },
      })

      return newState
    })
  }, [playerId, broadcastMessage])

  // Determine if it's my turn
  const isMyTurn = gameState
    ? gameState.actingPlayer === (amIPlayer1 ? 'player1' : 'player2')
    : false

  return {
    gameState,
    handHistory,
    isConnected,
    opponentConnected,
    bothReady: myReady && opponentReady,
    isMyTurn,
    amIPlayer1: amIPlayer1 ?? false,
    performAction,
    setReady,
  }
}
