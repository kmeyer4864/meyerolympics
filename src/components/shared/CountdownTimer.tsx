import { useEffect, useState, useCallback } from 'react'

interface CountdownTimerProps {
  startTime: Date | string | number
  onComplete?: () => void
  className?: string
  showMilliseconds?: boolean
}

interface ElapsedTimerProps {
  startTime: Date | string | number
  className?: string
  showMilliseconds?: boolean
}

// Formats time as HH:MM:SS or MM:SS
function formatTime(ms: number, showMs = false): string {
  const totalSeconds = Math.floor(ms / 1000)
  const hours = Math.floor(totalSeconds / 3600)
  const minutes = Math.floor((totalSeconds % 3600) / 60)
  const seconds = totalSeconds % 60
  const milliseconds = Math.floor((ms % 1000) / 10)

  let timeStr = ''
  if (hours > 0) {
    timeStr = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  } else {
    timeStr = `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  if (showMs) {
    timeStr += `.${milliseconds.toString().padStart(2, '0')}`
  }

  return timeStr
}

// Countdown timer (counts down from a duration)
export function CountdownTimer({
  startTime,
  onComplete,
  className = '',
  showMilliseconds = false,
}: CountdownTimerProps) {
  const [remaining, setRemaining] = useState(0)

  useEffect(() => {
    const start = new Date(startTime).getTime()
    const duration = 24 * 60 * 60 * 1000 // 24 hours default

    const updateTimer = () => {
      const now = Date.now()
      const elapsed = now - start
      const left = Math.max(0, duration - elapsed)
      setRemaining(left)

      if (left === 0 && onComplete) {
        onComplete()
      }
    }

    updateTimer()
    const interval = setInterval(updateTimer, showMilliseconds ? 10 : 1000)

    return () => clearInterval(interval)
  }, [startTime, onComplete, showMilliseconds])

  const isWarning = remaining < 60 * 60 * 1000 // Less than 1 hour

  return (
    <div
      className={`font-mono font-bold ${
        isWarning ? 'text-red-400' : 'text-white'
      } ${className}`}
    >
      {formatTime(remaining, showMilliseconds)}
    </div>
  )
}

// Elapsed timer (counts up from start)
export function ElapsedTimer({
  startTime,
  className = '',
  showMilliseconds = false,
}: ElapsedTimerProps) {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    const start = new Date(startTime).getTime()

    const updateTimer = () => {
      const now = Date.now()
      setElapsed(now - start)
    }

    updateTimer()
    const interval = setInterval(updateTimer, showMilliseconds ? 10 : 1000)

    return () => clearInterval(interval)
  }, [startTime, showMilliseconds])

  return (
    <div className={`font-mono font-bold text-white ${className}`}>
      {formatTime(elapsed, showMilliseconds)}
    </div>
  )
}

// Hook to get elapsed time in milliseconds
export function useElapsedTime(startTime: Date | string | number | null): number {
  const [elapsed, setElapsed] = useState(0)

  useEffect(() => {
    if (!startTime) {
      setElapsed(0)
      return
    }

    const start = new Date(startTime).getTime()

    const updateTimer = () => {
      setElapsed(Date.now() - start)
    }

    updateTimer()
    const interval = setInterval(updateTimer, 100)

    return () => clearInterval(interval)
  }, [startTime])

  return elapsed
}

// Hook to get a stable "now" timestamp for completing events
export function useStableNow() {
  const [now, setNow] = useState<string | null>(null)

  const captureNow = useCallback(() => {
    setNow(new Date().toISOString())
  }, [])

  const resetNow = useCallback(() => {
    setNow(null)
  }, [])

  return { now, captureNow, resetNow }
}

export default CountdownTimer
