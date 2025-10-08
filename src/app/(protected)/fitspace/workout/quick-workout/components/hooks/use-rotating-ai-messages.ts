import { useEffect, useState } from 'react'

const AI_GENERATION_MESSAGES = [
  'Analyzing your preferences and selecting optimal exercises...',
  'Balancing muscle groups for complete development...',
  'Optimizing exercise order for maximum performance...',
  'Calculating ideal set and rep ranges...',
  'Matching exercises to your available equipment...',
  'Finalizing your personalized workout plan...',
] as const

export function useRotatingAiMessages() {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % AI_GENERATION_MESSAGES.length)
    }, 8000) // Rotate every 8 seconds

    return () => clearInterval(interval)
  }, [])

  return AI_GENERATION_MESSAGES[currentIndex]
}
