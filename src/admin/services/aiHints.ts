// AI hint generation service using Claude API
// Falls back to manual hint entry if API key not configured

const ANTHROPIC_API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY

export interface AiHintResult {
  hints: string[]
  error: string | null
}

/**
 * Check if AI hint generation is available
 */
export function isAiHintsEnabled(): boolean {
  return Boolean(ANTHROPIC_API_KEY)
}

/**
 * Generate hints for a country using Claude API
 * Returns 4 hints ordered from hardest to easiest
 */
export async function generateAiHints(countryName: string): Promise<AiHintResult> {
  if (!ANTHROPIC_API_KEY) {
    return {
      hints: [],
      error: 'AI hints not configured. Set VITE_ANTHROPIC_API_KEY to enable.',
    }
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: `Generate 4 geographic trivia hints for ${countryName} for a guessing game.

Rules:
- DO NOT include the country name or any part of it in the hints
- DO NOT use demonyms (like "French" for France, "Brazilian" for Brazil)
- Order hints from HARDEST (most obscure) to EASIEST (most well-known)
- Each hint should be a single, factual statement
- Hints should be diverse (geography, culture, history, demographics, etc.)

Format your response as exactly 4 lines, one hint per line, no numbering:

[Hardest hint - obscure fact most people wouldn't know]
[Medium-hard hint - interesting but less known fact]
[Medium hint - moderately well-known fact]
[Easiest hint - famous fact or obvious clue like capital or language]`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`)
    }

    const data = await response.json()
    const content = data.content?.[0]?.text || ''

    // Parse the response into 4 hints
    const hints = content
      .split('\n')
      .map((line: string) => line.trim())
      .filter((line: string) => line.length > 0)
      .slice(0, 4)

    if (hints.length < 4) {
      return {
        hints: [],
        error: 'AI returned fewer than 4 hints. Please try again.',
      }
    }

    return { hints, error: null }
  } catch (err) {
    return {
      hints: [],
      error: err instanceof Error ? err.message : 'Unknown error generating hints',
    }
  }
}

/**
 * Generate a single hint of a specific type for a country
 */
export async function generateAiHint(
  countryName: string,
  hintType: string
): Promise<{ hint: string; error: string | null }> {
  if (!ANTHROPIC_API_KEY) {
    return {
      hint: '',
      error: 'AI hints not configured. Set VITE_ANTHROPIC_API_KEY to enable.',
    }
  }

  const typeDescriptions: Record<string, string> = {
    obscure: 'a very obscure, little-known fact',
    historical: 'a historical fact or event',
    geographic: 'a geographic feature or location detail',
    cultural: 'a cultural tradition, food, or custom',
    demographic: 'a population or demographic fact',
    economic: 'an economic or industry fact',
    easy: 'an obvious, well-known fact like capital city or official language',
  }

  const typeDesc = typeDescriptions[hintType] || 'an interesting fact'

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: 'claude-3-haiku-20240307',
        max_tokens: 150,
        messages: [
          {
            role: 'user',
            content: `Generate ${typeDesc} about ${countryName} for a geographic guessing game.

Rules:
- DO NOT include the country name or any part of it
- DO NOT use demonyms (like "French" for France)
- Be factual and concise

Respond with just the hint, nothing else:`,
          },
        ],
      }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.error?.message || `API request failed: ${response.status}`)
    }

    const data = await response.json()
    const hint = data.content?.[0]?.text?.trim() || ''

    return { hint, error: null }
  } catch (err) {
    return {
      hint: '',
      error: err instanceof Error ? err.message : 'Unknown error generating hint',
    }
  }
}
