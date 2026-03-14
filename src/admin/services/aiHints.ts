// AI hint generation service using Supabase Edge Function
// Falls back to manual hint entry if not configured

import { supabase } from '@/lib/supabase'

export interface AiHintResult {
  hints: string[]
  error: string | null
}

/**
 * Check if AI hint generation is available
 * Always enabled - uses Supabase Edge Function
 */
export function isAiHintsEnabled(): boolean {
  return true
}

/**
 * Generate hints for a country using Supabase Edge Function (which calls Claude API)
 * Returns 4 hints ordered from hardest to easiest
 */
export async function generateAiHints(countryName: string): Promise<AiHintResult> {
  try {
    const { data, error } = await supabase.functions.invoke('generate-hints', {
      body: { countryName },
    })

    if (error) {
      throw new Error(error.message)
    }

    if (data.error) {
      throw new Error(data.error)
    }

    const hints = data.hints || []

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
