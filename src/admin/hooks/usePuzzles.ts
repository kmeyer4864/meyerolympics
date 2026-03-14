import { useState, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { GeodleDailyPuzzle, GeodlePuzzleCountry } from '@/lib/database.types'

export interface CreatePuzzleInput {
  title?: string
  countries: GeodlePuzzleCountry[]
  difficulty?: 'easy' | 'medium' | 'hard'
  playDate?: string
}

export interface UpdatePuzzleInput {
  id: string
  title?: string
  countries?: GeodlePuzzleCountry[]
  difficulty?: 'easy' | 'medium' | 'hard'
  playDate?: string | null
  status?: 'draft' | 'scheduled' | 'published' | 'archived'
}

export function usePuzzles() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch all puzzles
  const fetchPuzzles = useCallback(async (): Promise<GeodleDailyPuzzle[]> => {
    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('geodle_daily_puzzles')
      .select('*')
      .order('created_at', { ascending: false })

    setIsLoading(false)

    if (fetchError) {
      setError(fetchError.message)
      return []
    }

    return (data || []) as GeodleDailyPuzzle[]
  }, [])

  // Fetch a single puzzle by ID
  const fetchPuzzle = useCallback(async (id: string): Promise<GeodleDailyPuzzle | null> => {
    setIsLoading(true)
    setError(null)

    const { data, error: fetchError } = await supabase
      .from('geodle_daily_puzzles')
      .select('*')
      .eq('id', id)
      .single()

    setIsLoading(false)

    if (fetchError) {
      setError(fetchError.message)
      return null
    }

    return data as GeodleDailyPuzzle
  }, [])

  // Create a new puzzle (as draft)
  const createPuzzle = useCallback(async (input: CreatePuzzleInput): Promise<GeodleDailyPuzzle | null> => {
    setIsLoading(true)
    setError(null)

    const { data: userData } = await supabase.auth.getUser()

    const insertData = {
      title: input.title || null,
      countries: input.countries,
      difficulty: input.difficulty || 'medium',
      play_date: input.playDate || null,
      status: input.playDate ? 'scheduled' : 'draft',
      created_by: userData.user?.id || null,
    }

    const { data, error: insertError } = await supabase
      .from('geodle_daily_puzzles')
      .insert(insertData)
      .select()
      .single()

    setIsLoading(false)

    if (insertError) {
      setError(insertError.message)
      return null
    }

    return data as GeodleDailyPuzzle
  }, [])

  // Update an existing puzzle
  const updatePuzzle = useCallback(async (input: UpdatePuzzleInput): Promise<GeodleDailyPuzzle | null> => {
    setIsLoading(true)
    setError(null)

    const updateData: Record<string, unknown> = {}

    if (input.title !== undefined) updateData.title = input.title
    if (input.countries !== undefined) updateData.countries = input.countries
    if (input.difficulty !== undefined) updateData.difficulty = input.difficulty
    if (input.playDate !== undefined) updateData.play_date = input.playDate
    if (input.status !== undefined) updateData.status = input.status

    const { data, error: updateError } = await supabase
      .from('geodle_daily_puzzles')
      .update(updateData)
      .eq('id', input.id)
      .select()
      .single()

    setIsLoading(false)

    if (updateError) {
      setError(updateError.message)
      return null
    }

    return data as GeodleDailyPuzzle
  }, [])

  // Delete a puzzle
  const deletePuzzle = useCallback(async (id: string): Promise<boolean> => {
    setIsLoading(true)
    setError(null)

    const { error: deleteError } = await supabase
      .from('geodle_daily_puzzles')
      .delete()
      .eq('id', id)

    setIsLoading(false)

    if (deleteError) {
      setError(deleteError.message)
      return false
    }

    return true
  }, [])

  // Schedule a puzzle for a specific date
  const schedulePuzzle = useCallback(async (id: string, playDate: string): Promise<GeodleDailyPuzzle | null> => {
    return updatePuzzle({
      id,
      playDate,
      status: 'scheduled',
    })
  }, [updatePuzzle])

  // Publish a puzzle immediately
  const publishPuzzle = useCallback(async (id: string): Promise<GeodleDailyPuzzle | null> => {
    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0]

    return updatePuzzle({
      id,
      playDate: today,
      status: 'published',
    })
  }, [updatePuzzle])

  // Archive a puzzle
  const archivePuzzle = useCallback(async (id: string): Promise<GeodleDailyPuzzle | null> => {
    return updatePuzzle({
      id,
      status: 'archived',
    })
  }, [updatePuzzle])

  // Duplicate a puzzle (creates a new draft)
  const duplicatePuzzle = useCallback(async (id: string): Promise<GeodleDailyPuzzle | null> => {
    const original = await fetchPuzzle(id)
    if (!original) return null

    return createPuzzle({
      title: original.title ? `${original.title} (Copy)` : 'Copy',
      countries: original.countries,
      difficulty: original.difficulty,
    })
  }, [fetchPuzzle, createPuzzle])

  return {
    isLoading,
    error,
    fetchPuzzles,
    fetchPuzzle,
    createPuzzle,
    updatePuzzle,
    deletePuzzle,
    schedulePuzzle,
    publishPuzzle,
    archivePuzzle,
    duplicatePuzzle,
  }
}
