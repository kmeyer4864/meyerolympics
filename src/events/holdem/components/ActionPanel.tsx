import { useState, useEffect } from 'react'
import type { PlayerAction } from '../types'
import { getValidActions } from '../engine'
import type { GameState } from '../types'

interface ActionPanelProps {
  gameState: GameState
  myPlayer: 'player1' | 'player2'
  isMyTurn: boolean
  onAction: (action: PlayerAction) => void
}

export function ActionPanel({ gameState, myPlayer, isMyTurn, onAction }: ActionPanelProps) {
  const validActions = getValidActions(gameState, myPlayer)
  const [raiseAmount, setRaiseAmount] = useState(validActions.minRaise)
  const [showRaiseSlider, setShowRaiseSlider] = useState(false)

  // Update raise amount when min changes
  useEffect(() => {
    setRaiseAmount(validActions.minRaise)
  }, [validActions.minRaise])

  if (!isMyTurn) {
    return (
      <div className="flex items-center justify-center py-4">
        <div className="flex items-center gap-3 text-gray-400">
          <div className="animate-spin h-5 w-5 border-2 border-gold border-t-transparent rounded-full" />
          <span>Waiting for opponent...</span>
        </div>
      </div>
    )
  }

  const handleFold = () => {
    setShowRaiseSlider(false)
    onAction({ type: 'fold' })
  }

  const handleCheck = () => {
    setShowRaiseSlider(false)
    onAction({ type: 'check' })
  }

  const handleCall = () => {
    setShowRaiseSlider(false)
    onAction({ type: 'call' })
  }

  const handleRaise = () => {
    if (showRaiseSlider) {
      // Confirm the raise
      if (raiseAmount >= validActions.maxRaise) {
        onAction({ type: 'all_in' })
      } else {
        onAction({ type: 'raise', amount: raiseAmount })
      }
      setShowRaiseSlider(false)
    } else {
      // Show the slider
      setShowRaiseSlider(true)
    }
  }

  const handleAllIn = () => {
    setShowRaiseSlider(false)
    onAction({ type: 'all_in' })
  }

  const myChips = gameState[myPlayer].chips

  return (
    <div className="space-y-3">
      {/* Main action buttons */}
      <div className="flex gap-3 justify-center">
        {/* Fold button */}
        {validActions.canFold && (
          <button
            onClick={handleFold}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            Fold
          </button>
        )}

        {/* Check button */}
        {validActions.canCheck && (
          <button
            onClick={handleCheck}
            className="px-6 py-3 bg-navy-600 hover:bg-navy-500 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            Check
          </button>
        )}

        {/* Call button */}
        {validActions.canCall && (
          <button
            onClick={handleCall}
            className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg transition-colors shadow-lg"
          >
            Call {validActions.callAmount}
          </button>
        )}

        {/* Raise button */}
        {validActions.canRaise && (
          <button
            onClick={handleRaise}
            className={`
              px-6 py-3 font-semibold rounded-lg transition-colors shadow-lg
              ${showRaiseSlider
                ? 'bg-gold text-navy-900 hover:bg-yellow-400'
                : 'bg-orange-600 hover:bg-orange-700 text-white'
              }
            `}
          >
            {showRaiseSlider ? `Raise to ${raiseAmount}` : 'Raise'}
          </button>
        )}

        {/* All-In button (show when chips are low or raise is maxed) */}
        {validActions.canRaise && myChips <= validActions.callAmount * 3 && (
          <button
            onClick={handleAllIn}
            className="px-6 py-3 bg-gradient-to-r from-gold to-yellow-500 text-navy-900 font-bold rounded-lg transition-all shadow-lg hover:scale-105"
          >
            All In ({myChips})
          </button>
        )}
      </div>

      {/* Raise slider */}
      {showRaiseSlider && validActions.canRaise && (
        <div className="bg-navy-800 p-4 rounded-lg border border-navy-600">
          <div className="flex items-center gap-4">
            <span className="text-gray-400 text-sm">Raise:</span>
            <input
              type="range"
              min={validActions.minRaise}
              max={validActions.maxRaise}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(parseInt(e.target.value))}
              className="flex-1 h-2 bg-navy-600 rounded-lg appearance-none cursor-pointer accent-gold"
            />
            <div className="flex items-center gap-2">
              <input
                type="number"
                min={validActions.minRaise}
                max={validActions.maxRaise}
                value={raiseAmount}
                onChange={(e) => {
                  const val = parseInt(e.target.value)
                  if (!isNaN(val)) {
                    setRaiseAmount(Math.max(validActions.minRaise, Math.min(validActions.maxRaise, val)))
                  }
                }}
                className="w-20 px-2 py-1 bg-navy-700 border border-navy-500 rounded text-white text-center font-mono"
              />
              <span className="text-yellow-500">🪙</span>
            </div>
          </div>

          {/* Quick raise buttons */}
          <div className="flex gap-2 mt-3">
            <button
              onClick={() => setRaiseAmount(validActions.minRaise)}
              className="px-3 py-1 text-sm bg-navy-700 hover:bg-navy-600 text-gray-300 rounded"
            >
              Min
            </button>
            <button
              onClick={() => setRaiseAmount(Math.min(Math.floor(gameState.pot / 2), validActions.maxRaise))}
              className="px-3 py-1 text-sm bg-navy-700 hover:bg-navy-600 text-gray-300 rounded"
            >
              ½ Pot
            </button>
            <button
              onClick={() => setRaiseAmount(Math.min(gameState.pot, validActions.maxRaise))}
              className="px-3 py-1 text-sm bg-navy-700 hover:bg-navy-600 text-gray-300 rounded"
            >
              Pot
            </button>
            <button
              onClick={() => setRaiseAmount(validActions.maxRaise)}
              className="px-3 py-1 text-sm bg-gold/20 hover:bg-gold/30 text-gold rounded"
            >
              All In
            </button>
            <button
              onClick={() => setShowRaiseSlider(false)}
              className="ml-auto px-3 py-1 text-sm bg-navy-700 hover:bg-navy-600 text-gray-400 rounded"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
