import { useState } from 'react'

import type { GenerateExerciseAIResponse } from '@/app/api/exercises/generate-ai/route'

interface UseGenerateExerciseAIOptions {
  onSuccess?: (data: GenerateExerciseAIResponse) => void
  onError?: (error: string) => void
}

export function useGenerateExerciseAI(options?: UseGenerateExerciseAIOptions) {
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generate = async (name: string) => {
    if (!name.trim()) {
      const errorMsg = 'Exercise name is required'
      setError(errorMsg)
      options?.onError?.(errorMsg)
      return null
    }

    setIsGenerating(true)
    setError(null)

    try {
      const response = await fetch('/api/exercises/generate-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Failed to generate exercise content')
      }

      const data = (await response.json()) as GenerateExerciseAIResponse
      options?.onSuccess?.(data)
      return data
    } catch (err) {
      const errorMsg =
        err instanceof Error ? err.message : 'Failed to generate exercise'
      setError(errorMsg)
      options?.onError?.(errorMsg)
      return null
    } finally {
      setIsGenerating(false)
    }
  }

  return { generate, isGenerating, error }
}
