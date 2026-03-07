import type {
  Card,
  Suit,
  Rank,
  GameState,
  PlayerHandState,
  PlayerAction,
  BettingRound,
  EvaluatedHand,
} from './types'
import { HandRank } from './types'
import {
  STARTING_CHIPS,
  SMALL_BLIND,
  BIG_BLIND,
} from './types'

// ============================================================================
// SEEDED RANDOM NUMBER GENERATOR (Mulberry32)
// ============================================================================

export function mulberry32(seed: number): () => number {
  return function () {
    let t = (seed += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

// ============================================================================
// DECK CREATION AND SHUFFLING
// ============================================================================

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades']
const RANKS: Rank[] = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14]

export function createDeck(): Card[] {
  const deck: Card[] = []
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank })
    }
  }
  return deck
}

// Fisher-Yates shuffle with seeded RNG
export function shuffleDeck(deck: Card[], rng: () => number): Card[] {
  const shuffled = [...deck]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

// Get a deterministic deck for a specific hand
export function getDeckForHand(deckSeed: number, handNumber: number): Card[] {
  // Combine seed and hand number for unique shuffle per hand
  const combinedSeed = deckSeed * 1000 + handNumber
  const rng = mulberry32(combinedSeed)
  return shuffleDeck(createDeck(), rng)
}

// ============================================================================
// CARD DISPLAY HELPERS
// ============================================================================

export function rankToString(rank: Rank): string {
  switch (rank) {
    case 14: return 'A'
    case 13: return 'K'
    case 12: return 'Q'
    case 11: return 'J'
    default: return rank.toString()
  }
}

export function suitToSymbol(suit: Suit): string {
  switch (suit) {
    case 'hearts': return '♥'
    case 'diamonds': return '♦'
    case 'clubs': return '♣'
    case 'spades': return '♠'
  }
}

export function cardToString(card: Card): string {
  return `${rankToString(card.rank)}${suitToSymbol(card.suit)}`
}

// ============================================================================
// HAND EVALUATION
// ============================================================================

function getCombinations<T>(arr: T[], k: number): T[][] {
  if (k === 0) return [[]]
  if (arr.length < k) return []

  const [first, ...rest] = arr
  const withFirst = getCombinations(rest, k - 1).map(combo => [first, ...combo])
  const withoutFirst = getCombinations(rest, k)

  return [...withFirst, ...withoutFirst]
}

function isFlush(cards: Card[]): boolean {
  return cards.every(c => c.suit === cards[0].suit)
}

function isStraight(cards: Card[]): boolean {
  const ranks = cards.map(c => c.rank).sort((a, b) => b - a)

  // Check for regular straight
  for (let i = 0; i < ranks.length - 1; i++) {
    if (ranks[i] - ranks[i + 1] !== 1) {
      // Check for wheel (A-2-3-4-5)
      if (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2) {
        return true
      }
      return false
    }
  }
  return true
}

function getStraightHighCard(cards: Card[]): number {
  const ranks = cards.map(c => c.rank).sort((a, b) => b - a)
  // Wheel straight (A-2-3-4-5) has 5 as high card
  if (ranks[0] === 14 && ranks[1] === 5) {
    return 5
  }
  return ranks[0]
}

function getRankCounts(cards: Card[]): Map<number, number> {
  const counts = new Map<number, number>()
  for (const card of cards) {
    counts.set(card.rank, (counts.get(card.rank) || 0) + 1)
  }
  return counts
}

function evaluateFiveCards(cards: Card[]): EvaluatedHand {
  const flush = isFlush(cards)
  const straight = isStraight(cards)
  const ranks = cards.map(c => c.rank).sort((a, b) => b - a)
  const rankCounts = getRankCounts(cards)

  // Count occurrences
  const counts = Array.from(rankCounts.values()).sort((a, b) => b - a)

  // Royal Flush
  if (flush && straight && ranks[0] === 14 && ranks[4] === 10) {
    return {
      rank: HandRank.ROYAL_FLUSH,
      rankName: 'Royal Flush',
      tiebreakers: [14],
      bestCards: cards,
    }
  }

  // Straight Flush
  if (flush && straight) {
    const highCard = getStraightHighCard(cards)
    return {
      rank: HandRank.STRAIGHT_FLUSH,
      rankName: 'Straight Flush',
      tiebreakers: [highCard],
      bestCards: cards,
    }
  }

  // Four of a Kind
  if (counts[0] === 4) {
    const quadRank = [...rankCounts.entries()].find(([, c]) => c === 4)![0]
    const kicker = [...rankCounts.entries()].find(([, c]) => c === 1)![0]
    return {
      rank: HandRank.FOUR_OF_A_KIND,
      rankName: 'Four of a Kind',
      tiebreakers: [quadRank, kicker],
      bestCards: cards,
    }
  }

  // Full House
  if (counts[0] === 3 && counts[1] === 2) {
    const tripRank = [...rankCounts.entries()].find(([, c]) => c === 3)![0]
    const pairRank = [...rankCounts.entries()].find(([, c]) => c === 2)![0]
    return {
      rank: HandRank.FULL_HOUSE,
      rankName: 'Full House',
      tiebreakers: [tripRank, pairRank],
      bestCards: cards,
    }
  }

  // Flush
  if (flush) {
    return {
      rank: HandRank.FLUSH,
      rankName: 'Flush',
      tiebreakers: ranks,
      bestCards: cards,
    }
  }

  // Straight
  if (straight) {
    const highCard = getStraightHighCard(cards)
    return {
      rank: HandRank.STRAIGHT,
      rankName: 'Straight',
      tiebreakers: [highCard],
      bestCards: cards,
    }
  }

  // Three of a Kind
  if (counts[0] === 3) {
    const tripRank = [...rankCounts.entries()].find(([, c]) => c === 3)![0]
    const kickers = [...rankCounts.entries()]
      .filter(([, c]) => c === 1)
      .map(([r]) => r)
      .sort((a, b) => b - a)
    return {
      rank: HandRank.THREE_OF_A_KIND,
      rankName: 'Three of a Kind',
      tiebreakers: [tripRank, ...kickers],
      bestCards: cards,
    }
  }

  // Two Pair
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = [...rankCounts.entries()]
      .filter(([, c]) => c === 2)
      .map(([r]) => r)
      .sort((a, b) => b - a)
    const kicker = [...rankCounts.entries()].find(([, c]) => c === 1)![0]
    return {
      rank: HandRank.TWO_PAIR,
      rankName: 'Two Pair',
      tiebreakers: [...pairs, kicker],
      bestCards: cards,
    }
  }

  // Pair
  if (counts[0] === 2) {
    const pairRank = [...rankCounts.entries()].find(([, c]) => c === 2)![0]
    const kickers = [...rankCounts.entries()]
      .filter(([, c]) => c === 1)
      .map(([r]) => r)
      .sort((a, b) => b - a)
    return {
      rank: HandRank.PAIR,
      rankName: 'Pair',
      tiebreakers: [pairRank, ...kickers],
      bestCards: cards,
    }
  }

  // High Card
  return {
    rank: HandRank.HIGH_CARD,
    rankName: 'High Card',
    tiebreakers: ranks,
    bestCards: cards,
  }
}

export function evaluateHand(holeCards: Card[], communityCards: Card[]): EvaluatedHand {
  const allCards = [...holeCards, ...communityCards]

  // Need at least 5 cards to evaluate
  if (allCards.length < 5) {
    return {
      rank: HandRank.HIGH_CARD,
      rankName: 'High Card',
      tiebreakers: holeCards.map(c => c.rank).sort((a, b) => b - a),
      bestCards: holeCards,
    }
  }

  // Get all 5-card combinations and find the best
  const combinations = getCombinations(allCards, 5)
  let bestHand: EvaluatedHand | null = null

  for (const combo of combinations) {
    const evaluated = evaluateFiveCards(combo)
    if (!bestHand || compareHands(evaluated, bestHand) > 0) {
      bestHand = evaluated
    }
  }

  return bestHand!
}

// Compare two evaluated hands. Returns positive if hand1 wins, negative if hand2 wins, 0 for tie
export function compareHands(hand1: EvaluatedHand, hand2: EvaluatedHand): number {
  if (hand1.rank !== hand2.rank) {
    return hand1.rank - hand2.rank
  }

  // Same rank, compare tiebreakers
  for (let i = 0; i < hand1.tiebreakers.length; i++) {
    if (hand1.tiebreakers[i] !== hand2.tiebreakers[i]) {
      return hand1.tiebreakers[i] - hand2.tiebreakers[i]
    }
  }

  return 0 // Exact tie
}

// ============================================================================
// GAME STATE MANAGEMENT
// ============================================================================

export function createInitialPlayerState(chips: number = STARTING_CHIPS): PlayerHandState {
  return {
    holeCards: [],
    chips,
    currentBet: 0,
    totalBetThisHand: 0,
    hasFolded: false,
    isAllIn: false,
  }
}

export function createInitialGameState(deckSeed: number): GameState {
  return {
    deckSeed,
    handNumber: 1,
    player1: createInitialPlayerState(),
    player2: createInitialPlayerState(),
    dealerIsPlayer1: true,
    communityCards: [],
    currentRound: 'preflop',
    pot: 0,
    currentBetToMatch: 0,
    lastRaiseAmount: BIG_BLIND,
    actingPlayer: null,
    lastAggressor: null,
    isHandComplete: false,
    handWinner: null,
    showdown: false,
  }
}

export function startNewHand(state: GameState): GameState {
  const deck = getDeckForHand(state.deckSeed, state.handNumber)

  // Reset hand state but keep chip counts
  const newState: GameState = {
    ...state,
    player1: {
      ...createInitialPlayerState(state.player1.chips),
      holeCards: [deck[0], deck[2]], // Deal alternating cards
    },
    player2: {
      ...createInitialPlayerState(state.player2.chips),
      holeCards: [deck[1], deck[3]],
    },
    communityCards: [],
    currentRound: 'preflop',
    pot: 0,
    currentBetToMatch: BIG_BLIND,
    lastRaiseAmount: BIG_BLIND,
    actingPlayer: null,
    lastAggressor: null,
    isHandComplete: false,
    handWinner: null,
    winningHand: undefined,
    showdown: false,
  }

  // Post blinds
  // Small blind is dealer (button), big blind is non-dealer in heads-up
  const smallBlindPlayer = newState.dealerIsPlayer1 ? 'player1' : 'player2'
  const bigBlindPlayer = newState.dealerIsPlayer1 ? 'player2' : 'player1'

  // Post small blind
  const sbAmount = Math.min(SMALL_BLIND, newState[smallBlindPlayer].chips)
  newState[smallBlindPlayer].chips -= sbAmount
  newState[smallBlindPlayer].currentBet = sbAmount
  newState[smallBlindPlayer].totalBetThisHand = sbAmount
  if (newState[smallBlindPlayer].chips === 0) {
    newState[smallBlindPlayer].isAllIn = true
  }

  // Post big blind
  const bbAmount = Math.min(BIG_BLIND, newState[bigBlindPlayer].chips)
  newState[bigBlindPlayer].chips -= bbAmount
  newState[bigBlindPlayer].currentBet = bbAmount
  newState[bigBlindPlayer].totalBetThisHand = bbAmount
  if (newState[bigBlindPlayer].chips === 0) {
    newState[bigBlindPlayer].isAllIn = true
  }

  newState.pot = sbAmount + bbAmount
  newState.currentBetToMatch = bbAmount

  // Pre-flop: small blind (dealer/button) acts first in heads-up
  newState.actingPlayer = smallBlindPlayer

  return newState
}

export function dealCommunityCards(state: GameState): GameState {
  const deck = getDeckForHand(state.deckSeed, state.handNumber)
  // Cards 0-3 are hole cards, community cards start at index 4
  // (with burn cards at 4, 8, 11)

  const newState = { ...state }

  switch (state.currentRound) {
    case 'preflop':
      // Deal flop (burn 1, deal 3)
      newState.communityCards = [deck[5], deck[6], deck[7]]
      newState.currentRound = 'flop'
      break
    case 'flop':
      // Deal turn (burn 1, deal 1)
      newState.communityCards = [...state.communityCards, deck[9]]
      newState.currentRound = 'turn'
      break
    case 'turn':
      // Deal river (burn 1, deal 1)
      newState.communityCards = [...state.communityCards, deck[11]]
      newState.currentRound = 'river'
      break
    default:
      return state
  }

  // Reset betting for new round
  newState.player1.currentBet = 0
  newState.player2.currentBet = 0
  newState.currentBetToMatch = 0
  newState.lastRaiseAmount = BIG_BLIND
  newState.lastAggressor = null

  // Non-dealer acts first post-flop in heads-up
  if (!newState.player1.hasFolded && !newState.player1.isAllIn &&
      !newState.player2.hasFolded && !newState.player2.isAllIn) {
    newState.actingPlayer = newState.dealerIsPlayer1 ? 'player2' : 'player1'
  } else {
    // If one player is all-in, skip to showdown
    newState.actingPlayer = null
  }

  return newState
}

// ============================================================================
// ACTION VALIDATION AND APPLICATION
// ============================================================================

export function getValidActions(state: GameState, player: 'player1' | 'player2'): {
  canFold: boolean
  canCheck: boolean
  canCall: boolean
  callAmount: number
  canRaise: boolean
  minRaise: number
  maxRaise: number
} {
  const playerState = state[player]
  const amountToCall = state.currentBetToMatch - playerState.currentBet

  const canFold = !playerState.hasFolded && !playerState.isAllIn
  const canCheck = amountToCall === 0 && !playerState.hasFolded && !playerState.isAllIn
  const canCall = amountToCall > 0 && !playerState.hasFolded && !playerState.isAllIn
  const callAmount = Math.min(amountToCall, playerState.chips)

  // Minimum raise is the last raise amount (or big blind if no raise yet)
  const minRaiseTotal = state.currentBetToMatch + state.lastRaiseAmount
  const minRaise = Math.min(minRaiseTotal - playerState.currentBet, playerState.chips)
  const maxRaise = playerState.chips
  const canRaise = !playerState.hasFolded && !playerState.isAllIn && playerState.chips > callAmount

  return {
    canFold,
    canCheck,
    canCall,
    callAmount,
    canRaise,
    minRaise: Math.max(minRaise, BIG_BLIND), // At minimum, raise by big blind
    maxRaise,
  }
}

export function applyAction(
  state: GameState,
  player: 'player1' | 'player2',
  action: PlayerAction
): GameState {
  const newState = {
    ...state,
    player1: { ...state.player1 },
    player2: { ...state.player2 },
  }
  const playerState = newState[player]
  const otherPlayer = player === 'player1' ? 'player2' : 'player1'
  const otherState = newState[otherPlayer]

  switch (action.type) {
    case 'fold':
      playerState.hasFolded = true
      newState.handWinner = otherPlayer
      newState.isHandComplete = true
      newState.actingPlayer = null
      // Award pot
      otherState.chips += newState.pot
      break

    case 'check':
      // Just pass action to other player or end round
      break

    case 'call': {
      const amountToCall = Math.min(
        newState.currentBetToMatch - playerState.currentBet,
        playerState.chips
      )
      playerState.chips -= amountToCall
      playerState.currentBet += amountToCall
      playerState.totalBetThisHand += amountToCall
      newState.pot += amountToCall
      if (playerState.chips === 0) {
        playerState.isAllIn = true
      }
      break
    }

    case 'raise':
    case 'all_in': {
      const raiseAmount = action.type === 'all_in' ? playerState.chips : action.amount!
      const actualRaise = raiseAmount - (newState.currentBetToMatch - playerState.currentBet)

      playerState.chips -= raiseAmount
      playerState.currentBet += raiseAmount
      playerState.totalBetThisHand += raiseAmount
      newState.pot += raiseAmount
      newState.currentBetToMatch = playerState.currentBet
      newState.lastRaiseAmount = Math.max(actualRaise, newState.lastRaiseAmount)
      newState.lastAggressor = player

      if (playerState.chips === 0) {
        playerState.isAllIn = true
      }
      break
    }
  }

  // Determine next action
  if (!newState.isHandComplete) {
    newState.actingPlayer = determineNextActor(newState, player, action)
  }

  return newState
}

function determineNextActor(
  state: GameState,
  actedPlayer: 'player1' | 'player2',
  action: PlayerAction
): 'player1' | 'player2' | null {
  const otherPlayer = actedPlayer === 'player1' ? 'player2' : 'player1'
  const otherState = state[otherPlayer]
  const actedState = state[actedPlayer]

  // If other player folded, hand is over
  if (otherState.hasFolded) {
    return null
  }

  // If both players are all-in, skip to showdown
  if (actedState.isAllIn && otherState.isAllIn) {
    return null
  }

  // If one player is all-in and the other has matched, skip to showdown
  if ((actedState.isAllIn || otherState.isAllIn) &&
      actedState.currentBet === otherState.currentBet) {
    return null
  }

  // If action was raise/all-in, other player needs to respond
  if (action.type === 'raise' || action.type === 'all_in') {
    if (!otherState.hasFolded && !otherState.isAllIn) {
      return otherPlayer
    }
    return null
  }

  // If action was check or call, check if round is complete
  if (action.type === 'check' || action.type === 'call') {
    // Round is complete if bets are equal
    if (actedState.currentBet === otherState.currentBet) {
      // But we need to make sure everyone has acted
      // In preflop, big blind gets option to raise if just called
      if (state.currentRound === 'preflop') {
        // Big blind is non-dealer in heads-up
        const bigBlindPlayer = state.dealerIsPlayer1 ? 'player2' : 'player1'
        const smallBlindPlayer = state.dealerIsPlayer1 ? 'player1' : 'player2'

        // If small blind just called and big blind hasn't raised
        if (actedPlayer === smallBlindPlayer &&
            state.lastAggressor === null &&
            !state[bigBlindPlayer].isAllIn) {
          return bigBlindPlayer // Big blind option
        }
      }

      return null // Round complete
    }

    // Bets not equal, other player needs to act
    if (!otherState.hasFolded && !otherState.isAllIn) {
      return otherPlayer
    }
  }

  return null
}

// ============================================================================
// ROUND AND HAND COMPLETION
// ============================================================================

export function isBettingRoundComplete(state: GameState): boolean {
  return state.actingPlayer === null && !state.isHandComplete
}

export function isHandComplete(state: GameState): boolean {
  return state.isHandComplete
}

export function resolveShowdown(state: GameState): GameState {
  const newState = {
    ...state,
    player1: { ...state.player1 },
    player2: { ...state.player2 },
    showdown: true,
    currentRound: 'showdown' as BettingRound,
  }

  const hand1 = evaluateHand(state.player1.holeCards, state.communityCards)
  const hand2 = evaluateHand(state.player2.holeCards, state.communityCards)

  const comparison = compareHands(hand1, hand2)

  if (comparison > 0) {
    newState.handWinner = 'player1'
    newState.winningHand = hand1
    newState.player1.chips += newState.pot
  } else if (comparison < 0) {
    newState.handWinner = 'player2'
    newState.winningHand = hand2
    newState.player2.chips += newState.pot
  } else {
    // Tie - split pot
    newState.handWinner = 'tie'
    const halfPot = Math.floor(newState.pot / 2)
    newState.player1.chips += halfPot
    newState.player2.chips += newState.pot - halfPot
  }

  newState.isHandComplete = true
  newState.actingPlayer = null

  return newState
}

export function advanceToNextRoundOrShowdown(state: GameState): GameState {
  // Check if one player folded
  if (state.player1.hasFolded || state.player2.hasFolded) {
    return state // Already resolved in fold action
  }

  // If both players are all-in, run out the board and resolve
  if (state.player1.isAllIn || state.player2.isAllIn) {
    let currentState = { ...state }
    while (currentState.currentRound !== 'river' && currentState.currentRound !== 'showdown') {
      currentState = dealCommunityCards(currentState)
    }
    if (currentState.currentRound === 'river') {
      return resolveShowdown(currentState)
    }
    return currentState
  }

  // Normal progression
  if (state.currentRound === 'river') {
    return resolveShowdown(state)
  }

  return dealCommunityCards(state)
}

export function prepareNextHand(state: GameState): GameState {
  return {
    ...createInitialGameState(state.deckSeed),
    deckSeed: state.deckSeed,
    handNumber: state.handNumber + 1,
    player1: createInitialPlayerState(state.player1.chips),
    player2: createInitialPlayerState(state.player2.chips),
    dealerIsPlayer1: !state.dealerIsPlayer1, // Alternate dealer
  }
}
