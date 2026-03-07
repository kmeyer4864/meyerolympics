// Card types
export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades'
export type Rank = 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 // 11=J, 12=Q, 13=K, 14=A

export interface Card {
  suit: Suit
  rank: Rank
}

// Hand rankings (higher = better)
export enum HandRank {
  HIGH_CARD = 1,
  PAIR = 2,
  TWO_PAIR = 3,
  THREE_OF_A_KIND = 4,
  STRAIGHT = 5,
  FLUSH = 6,
  FULL_HOUSE = 7,
  FOUR_OF_A_KIND = 8,
  STRAIGHT_FLUSH = 9,
  ROYAL_FLUSH = 10,
}

export interface EvaluatedHand {
  rank: HandRank
  rankName: string
  // For tiebreaking: highest relevant cards in order
  // e.g., for two pair: [higher pair rank, lower pair rank, kicker]
  tiebreakers: number[]
  // The 5 cards that make up the best hand
  bestCards: Card[]
}

// Betting rounds
export type BettingRound = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown'

// Player actions
export type ActionType = 'fold' | 'check' | 'call' | 'raise' | 'all_in'

export interface PlayerAction {
  type: ActionType
  amount?: number // For raise/all_in
}

// Player state within a hand
export interface PlayerHandState {
  holeCards: Card[]
  chips: number
  currentBet: number // Amount bet in current betting round
  totalBetThisHand: number // Total amount bet this hand
  hasFolded: boolean
  isAllIn: boolean
}

// Full game state
export interface GameState {
  // Game identification
  deckSeed: number
  handNumber: number

  // Players
  player1: PlayerHandState
  player2: PlayerHandState
  dealerIsPlayer1: boolean // Button position

  // Community cards
  communityCards: Card[]

  // Betting state
  currentRound: BettingRound
  pot: number
  currentBetToMatch: number // Highest bet to call
  lastRaiseAmount: number // For minimum raise calculation
  actingPlayer: 'player1' | 'player2' | null // null when hand is over
  lastAggressor: 'player1' | 'player2' | null // Who made the last bet/raise

  // Hand resolution
  isHandComplete: boolean
  handWinner: 'player1' | 'player2' | 'tie' | null
  winningHand?: EvaluatedHand
  showdown: boolean
}

// Chip constants
export const STARTING_CHIPS = 1000
export const SMALL_BLIND = 10
export const BIG_BLIND = 20
export const WIN_THRESHOLD = 1600 // 80% of 2000 total chips

// Realtime message types
export type RealtimeMessageType =
  | 'PLAYER_READY'
  | 'PLAYER_ACTION'
  | 'SYNC_REQUEST'
  | 'SYNC_RESPONSE'
  | 'GAME_START'

export interface RealtimeMessage {
  type: RealtimeMessageType
  playerId: string
  timestamp: number
  payload: unknown
}

export interface PlayerReadyPayload {
  ready: boolean
}

export interface PlayerActionPayload {
  handNumber: number
  action: PlayerAction
}

export interface SyncResponsePayload {
  gameState: GameState
  handHistory: HandHistoryEntry[]
}

export interface GameStartPayload {
  deckSeed: number
}

// Hand history for tracking results
export interface HandHistoryEntry {
  handNumber: number
  player1StartChips: number
  player2StartChips: number
  player1EndChips: number
  player2EndChips: number
  winner: 'player1' | 'player2' | 'tie'
  potSize: number
  showdownHands?: {
    player1?: EvaluatedHand
    player2?: EvaluatedHand
  }
}

// Helper type for UI state
export interface HoldemUIState {
  isConnected: boolean
  opponentConnected: boolean
  isMyTurn: boolean
  canCheck: boolean
  canCall: boolean
  callAmount: number
  minRaise: number
  maxRaise: number
  showRaiseSlider: boolean
  raiseAmount: number
}
