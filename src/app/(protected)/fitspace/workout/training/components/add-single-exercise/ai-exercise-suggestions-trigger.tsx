'use client'

import { ChevronRight, SparklesIcon } from 'lucide-react'

import { PremiumButtonWrapper } from '@/components/premium-button-wrapper'
import { Button } from '@/components/ui/button'

import { useAiExerciseSuggestionsContext } from './ai-exercise-suggestions-context'

export function AiExerciseSuggestionsTrigger() {
  const {
    workoutType,
    hasPremium,
    isLoading,
    error,
    fetchSuggestions,
  } = useAiExerciseSuggestionsContext()

  return (
    <PremiumButtonWrapper
      hasPremium={hasPremium}
      showIndicator={true}
      tooltipText="We analyze your recent muscle fatigue and exercises to suggest what's missing for complete weekly muscle coverage."
    >
      <Button
        variant="secondary"
        size="sm"
        onClick={() => fetchSuggestions({ workoutType })}
        loading={isLoading}
        disabled={!hasPremium || isLoading}
        iconStart={
          <SparklesIcon className="size-4 shrink-0 text-amber-500 animate-pulse" />
        }
        iconEnd={<ChevronRight className="size-4" />}
      >
        {error ? 'Retry smart suggestions' : 'Smart suggestions'}
      </Button>
    </PremiumButtonWrapper>
  )
}

