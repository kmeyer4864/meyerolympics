import { sudokuEvent } from './sudoku'
import { flashbackEvent } from './flashback'
import { holdemEvent } from './holdem'
import { cribbageEvent } from './cribbage'
import { geographyEvent } from './geography'
import type { OlympicsEvent, EventType } from './types'

export const EVENT_REGISTRY: Record<EventType, OlympicsEvent> = {
  sudoku: sudokuEvent,
  flashback: flashbackEvent,
  holdem: holdemEvent,
  cribbage: cribbageEvent,
  geography: geographyEvent,
}

export const getAllEvents = (): OlympicsEvent[] => Object.values(EVENT_REGISTRY)

export const getEvent = (type: EventType): OlympicsEvent => EVENT_REGISTRY[type]

export const getAsyncEvents = (): OlympicsEvent[] =>
  getAllEvents().filter((event) => event.supportsAsync)

export const getRealtimeEvents = (): OlympicsEvent[] =>
  getAllEvents().filter((event) => event.supportsRealtime)

export const isValidEventType = (type: string): type is EventType =>
  type in EVENT_REGISTRY
