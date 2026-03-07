import { useCallback, useState } from 'react'
import type { EventComponentProps, MatchResult } from '../types'
import { useHoldemRealtime } from './useHoldemRealtime'
import { PlayerArea } from './components/PlayerArea'
import { CommunityCards } from './components/CommunityCards'
import { ActionPanel } from './components/ActionPanel'
import { ChipProgressBar } from './components/ChipProgressBar'
import { WIN_THRESHOLD, STARTING_CHIPS } from './types'

export default function HoldemGame({
  eventId,
  playerId,
  puzzleMetadata,
  onComplete,
}: EventComponentProps) {
  const deckSeed = (puzzleMetadata?.deckSeed as number) || Math.floor(Math.random() * 1000000)
  const [gameCompleted, setGameCompleted] = useState(false)
  const [finalChips, setFinalChips] = useState<number | null>(null)

  const handleGameComplete = useCallback((chips: number) => {
    setFinalChips(chips)
    setGameCompleted(true)

    // Normalize score: 0-100 based on how many chips we have
    // 0 chips = 0, 1000 (starting) = 50, 2000 (all) = 100
    const totalChips = STARTING_CHIPS * 2
    const normalizedScore = Math.round((chips / totalChips) * 100)

    const result: MatchResult = {
      score: normalizedScore,
      rawValue: chips,
      completedAt: new Date().toISOString(),
      metadata: {
        deckSeed,
        won: chips >= WIN_THRESHOLD,
      },
    }

    onComplete(result)
  }, [deckSeed, onComplete])

  const {
    gameState,
    handHistory,
    isConnected,
    opponentConnected,
    bothReady,
    isMyTurn,
    amIPlayer1,
    performAction,
    setReady,
  } = useHoldemRealtime({
    eventId,
    playerId,
    deckSeed,
    onGameComplete: handleGameComplete,
  })

  // Connection status screen
  if (!isConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin h-12 w-12 border-4 border-gold border-t-transparent rounded-full" />
        <p className="text-gray-400">Connecting to game server...</p>
      </div>
    )
  }

  // Waiting for opponent screen
  if (!opponentConnected) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="text-6xl mb-4">🃏</div>
        <h2 className="text-2xl font-bold text-white">Texas Hold'em</h2>
        <p className="text-gray-400">Waiting for opponent to connect...</p>
        <div className="flex items-center gap-2 text-gold">
          <div className="animate-pulse">●</div>
          <span>Connected</span>
        </div>
      </div>
    )
  }

  // Ready up screen
  if (!bothReady) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="text-6xl mb-2">🃏</div>
        <h2 className="text-2xl font-bold text-white">Texas Hold'em</h2>
        <p className="text-gray-300 text-center max-w-md">
          First player to reach <span className="text-gold font-bold">{WIN_THRESHOLD} chips</span> (80% of the total) wins!
        </p>

        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <span className={opponentConnected ? 'text-green-400' : 'text-gray-500'}>●</span>
            <span className="text-gray-400">Opponent</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-green-400">●</span>
            <span className="text-gold">You</span>
          </div>
        </div>

        <button
          onClick={setReady}
          className="px-8 py-4 bg-gradient-to-r from-gold to-yellow-500 text-navy-900 font-bold text-xl rounded-xl hover:scale-105 transition-transform shadow-lg"
        >
          Ready to Play
        </button>

        <p className="text-gray-500 text-sm">
          Both players must be ready to start
        </p>
      </div>
    )
  }

  // Loading game state
  if (!gameState) {
    return (
      <div className="flex flex-col items-center justify-center h-96 gap-4">
        <div className="animate-spin h-12 w-12 border-4 border-gold border-t-transparent rounded-full" />
        <p className="text-gray-400">Shuffling cards...</p>
      </div>
    )
  }

  // Game completed screen
  if (gameCompleted && finalChips !== null) {
    const won = finalChips >= WIN_THRESHOLD
    const opponentChips = STARTING_CHIPS * 2 - finalChips

    return (
      <div className="flex flex-col items-center justify-center h-96 gap-6">
        <div className="text-7xl mb-2">
          {won ? '🏆' : '😔'}
        </div>
        <h2 className={`text-3xl font-bold ${won ? 'text-gold' : 'text-gray-400'}`}>
          {won ? 'Victory!' : 'Defeat'}
        </h2>
        <p className="text-gray-300 text-center">
          {won
            ? `You reached ${finalChips} chips!`
            : `Your opponent reached ${opponentChips} chips`
          }
        </p>
        <div className="flex items-center gap-2 text-lg">
          <span className="text-yellow-500">🪙</span>
          <span className="font-mono font-bold text-white">{finalChips}</span>
          <span className="text-gray-400">final chips</span>
        </div>
        <p className="text-gray-500 text-sm">
          Hands played: {handHistory.length}
        </p>
      </div>
    )
  }

  // Active game
  const myPlayer = amIPlayer1 ? 'player1' : 'player2'
  const opponentPlayer = amIPlayer1 ? 'player2' : 'player1'
  const myState = gameState[myPlayer]
  const opponentState = gameState[opponentPlayer]

  const showOpponentCards = gameState.showdown || gameState.isHandComplete

  return (
    <div className="flex flex-col gap-4 max-w-2xl mx-auto">
      {/* Hand number and progress */}
      <div className="text-center">
        <span className="text-sm text-gray-400">
          Hand #{gameState.handNumber}
        </span>
      </div>

      {/* Chip progress bar */}
      <ChipProgressBar
        player1Chips={gameState.player1.chips}
        player2Chips={gameState.player2.chips}
        amIPlayer1={amIPlayer1}
      />

      {/* Opponent area */}
      <PlayerArea
        playerState={opponentState}
        isOpponent={true}
        isDealer={amIPlayer1 ? !gameState.dealerIsPlayer1 : gameState.dealerIsPlayer1}
        isActing={gameState.actingPlayer === opponentPlayer}
        showCards={showOpponentCards}
      />

      {/* Community cards and pot */}
      <CommunityCards
        cards={gameState.communityCards}
        pot={gameState.pot}
        currentRound={gameState.currentRound}
      />

      {/* Hand result overlay */}
      {gameState.isHandComplete && (
        <div className="text-center py-4 bg-navy-800/80 rounded-xl border border-navy-600">
          <div className="text-lg font-bold text-white mb-1">
            {gameState.handWinner === myPlayer
              ? '🎉 You won the hand!'
              : gameState.handWinner === 'tie'
                ? '🤝 Split pot!'
                : '😞 Opponent wins'
            }
          </div>
          {gameState.winningHand && (
            <div className="text-gold">
              {gameState.winningHand.rankName}
            </div>
          )}
          <div className="text-sm text-gray-400 mt-2">
            Next hand starting soon...
          </div>
        </div>
      )}

      {/* My cards area */}
      <PlayerArea
        playerState={myState}
        isOpponent={false}
        isDealer={amIPlayer1 ? gameState.dealerIsPlayer1 : !gameState.dealerIsPlayer1}
        isActing={gameState.actingPlayer === myPlayer}
        showCards={true}
      />

      {/* Action panel */}
      {!gameState.isHandComplete && (
        <ActionPanel
          gameState={gameState}
          myPlayer={myPlayer}
          isMyTurn={isMyTurn}
          onAction={performAction}
        />
      )}
    </div>
  )
}
