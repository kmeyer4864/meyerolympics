import { useState } from 'react'
import { generateAiHints, isAiHintsEnabled } from '../services/aiHints'

interface AiHintSuggestionsProps {
  countryName: string
  onApplyHints: (hints: [string, string, string, string]) => void
}

export function AiHintSuggestions({ countryName, onApplyHints }: AiHintSuggestionsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [suggestedHints, setSuggestedHints] = useState<string[]>([])
  const [manualPaste, setManualPaste] = useState('')

  const aiEnabled = isAiHintsEnabled()

  const handleGenerateAi = async () => {
    setIsLoading(true)
    setError(null)
    setSuggestedHints([])

    const result = await generateAiHints(countryName)

    setIsLoading(false)

    if (result.error) {
      setError(result.error)
    } else {
      setSuggestedHints(result.hints)
    }
  }

  const handleApplySuggested = () => {
    if (suggestedHints.length === 4) {
      onApplyHints(suggestedHints as [string, string, string, string])
      setSuggestedHints([])
    }
  }

  const handleApplyManual = () => {
    const lines = manualPaste
      .split('\n')
      .map((line) => line.replace(/^\d+[\.\)]\s*/, '').trim()) // Remove numbering
      .filter((line) => line.length > 0)

    if (lines.length >= 4) {
      onApplyHints([lines[0], lines[1], lines[2], lines[3]])
      setManualPaste('')
    } else {
      setError(`Need 4 hints, got ${lines.length}. Paste 4 lines of hints.`)
    }
  }

  return (
    <div className="bg-[#0d1d33] border border-gray-700 rounded-lg p-4 space-y-4">
      <div className="flex items-center gap-2">
        <span className="text-lg">🤖</span>
        <h3 className="text-sm font-semibold text-white">AI Hint Suggestions</h3>
        <span className="text-xs text-gray-500">for {countryName}</span>
      </div>

      {/* AI generation button */}
      {aiEnabled && (
        <div>
          <button
            onClick={handleGenerateAi}
            disabled={isLoading}
            className="w-full px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-500 disabled:opacity-50 transition flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white" />
                Generating...
              </>
            ) : (
              <>
                <span>✨</span>
                Generate with AI
              </>
            )}
          </button>
        </div>
      )}

      {/* Manual paste area */}
      <div className="space-y-2">
        <label className="block text-xs font-medium text-gray-400">
          {aiEnabled ? 'Or paste hints manually:' : 'Paste hints (4 lines):'}
        </label>
        <textarea
          value={manualPaste}
          onChange={(e) => {
            setManualPaste(e.target.value)
            setError(null)
          }}
          placeholder={`1. Obscure fact about the country
2. Less known historical fact
3. Cultural or geographic hint
4. Easy hint (capital, language, etc.)`}
          rows={5}
          className="w-full px-3 py-2 bg-[#0a1628] border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-[#FFD700] text-sm resize-none"
        />
        <button
          onClick={handleApplyManual}
          disabled={!manualPaste.trim()}
          className="w-full px-3 py-1 text-sm bg-gray-700 text-white rounded hover:bg-gray-600 disabled:opacity-50 transition"
        >
          Apply Pasted Hints
        </button>
      </div>

      {/* Error display */}
      {error && (
        <div className="p-3 bg-red-900/50 border border-red-700 rounded-lg text-red-200 text-sm">
          {error}
        </div>
      )}

      {/* Suggested hints preview */}
      {suggestedHints.length === 4 && (
        <div className="space-y-2">
          <p className="text-xs text-gray-400">Suggested hints (review before applying):</p>
          <div className="space-y-1">
            {suggestedHints.map((hint, index) => (
              <div
                key={index}
                className="p-2 bg-[#0a1628] rounded text-sm text-gray-200 border border-gray-700"
              >
                <span className="text-[#FFD700] font-bold mr-2">{index + 1}.</span>
                {hint}
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleApplySuggested}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-500 transition"
            >
              Apply These Hints
            </button>
            <button
              onClick={() => setSuggestedHints([])}
              className="px-4 py-2 text-gray-400 hover:text-white transition"
            >
              Discard
            </button>
          </div>
        </div>
      )}

      {/* API status indicator */}
      <div className="flex items-center gap-2 text-xs text-gray-500">
        <div
          className={`w-2 h-2 rounded-full ${aiEnabled ? 'bg-green-500' : 'bg-yellow-500'}`}
        />
        {aiEnabled ? 'AI hints enabled' : 'AI hints disabled (set VITE_ANTHROPIC_API_KEY)'}
      </div>
    </div>
  )
}
