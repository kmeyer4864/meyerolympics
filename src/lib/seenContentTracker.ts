/**
 * Seen Content Tracker
 *
 * Tracks which puzzles/locations a user has already seen using localStorage.
 * Ensures users don't see the same content repeatedly until they've seen everything.
 */

const STORAGE_KEY_PREFIX = 'meyerolympics_seen_'

/**
 * Get the localStorage key for a specific event type and user
 */
function getStorageKey(eventType: string, userId: string): string {
  return `${STORAGE_KEY_PREFIX}${eventType}_${userId}`
}

/**
 * Get the list of content IDs that the user has already seen
 */
export function getSeenIds(eventType: string, userId: string): string[] {
  try {
    const key = getStorageKey(eventType, userId)
    const stored = localStorage.getItem(key)
    if (!stored) return []
    return JSON.parse(stored) as string[]
  } catch {
    return []
  }
}

/**
 * Mark a content ID as seen by the user
 */
export function markAsSeen(eventType: string, userId: string, id: string): void {
  try {
    const key = getStorageKey(eventType, userId)
    const seen = getSeenIds(eventType, userId)
    if (!seen.includes(id)) {
      seen.push(id)
      localStorage.setItem(key, JSON.stringify(seen))
    }
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Get unseen content IDs, or reset if all have been seen
 * Returns the list of IDs that haven't been seen yet.
 * If all IDs have been seen, clears the seen list and returns all IDs.
 */
export function getUnseenOrReset(eventType: string, userId: string, allIds: string[]): string[] {
  const seen = getSeenIds(eventType, userId)
  const unseen = allIds.filter(id => !seen.includes(id))

  // If all content has been seen, reset and return all
  if (unseen.length === 0) {
    clearSeen(eventType, userId)
    return allIds
  }

  return unseen
}

/**
 * Select a random unseen content ID
 * If all have been seen, resets the tracking and picks from all.
 */
export function selectUnseenRandom(eventType: string, userId: string, allIds: string[]): string {
  const available = getUnseenOrReset(eventType, userId, allIds)
  const randomIndex = Math.floor(Math.random() * available.length)
  return available[randomIndex]
}

/**
 * Select multiple random unseen content IDs
 * If not enough unseen content available, resets and picks from all.
 */
export function selectMultipleUnseenRandom(
  eventType: string,
  userId: string,
  allIds: string[],
  count: number
): string[] {
  let available = getUnseenOrReset(eventType, userId, allIds)

  // If we need more than available, reset and use all
  if (available.length < count) {
    clearSeen(eventType, userId)
    available = [...allIds]
  }

  // Shuffle and take the first `count` items
  const shuffled = [...available].sort(() => Math.random() - 0.5)
  return shuffled.slice(0, count)
}

/**
 * Clear all seen content for a specific event type and user
 */
export function clearSeen(eventType: string, userId: string): void {
  try {
    const key = getStorageKey(eventType, userId)
    localStorage.removeItem(key)
  } catch {
    // Silently fail if localStorage is unavailable
  }
}

/**
 * Clear all seen content for all event types for a user
 */
export function clearAllSeenForUser(userId: string): void {
  try {
    const keysToRemove: string[] = []
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(STORAGE_KEY_PREFIX) && key.endsWith(`_${userId}`)) {
        keysToRemove.push(key)
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key))
  } catch {
    // Silently fail if localStorage is unavailable
  }
}
