'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

interface WizardQuestionViewProps {
  stepNumber: number
  totalSteps: number
  progress: number
  question: {
    title: string
    subtitle: string
    options: { value: string; label: string; description?: string }[]
  }
  selectedValue: string | null
  onSelect: (value: string) => void
  onBack?: () => void
}

export function WizardQuestionView({
  stepNumber,
  totalSteps,
  progress,
  question,
  selectedValue,
  onSelect,
  onBack,
}: WizardQuestionViewProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 10 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -10 }}
      transition={{ duration: 0.2 }}
      className="space-y-6"
    >
      {/* Step indicator */}
      <div className="space-y-3">
        <div className="relative flex items-center justify-center">
          {onBack && (
            <div className="absolute left-0">
              <Button variant="ghost" iconOnly={<ArrowLeft />} onClick={onBack}>
                Back
              </Button>
            </div>
          )}
          <span className="text-base font-semibold text-muted-foreground tabular-nums">
            Step {stepNumber} of {totalSteps}
          </span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      {/* Question */}
      <Card className="border-none shadow-none bg-transparent py-0 gap-4">
        <CardHeader className="px-0 pt-0">
          <CardTitle className="text-2xl">{question.title}</CardTitle>
          <CardDescription>{question.subtitle}</CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-3">
          {question.options.map((option) => {
            const isSelected = selectedValue === option.value

            return (
              <Button
                key={option.value}
                variant={isSelected ? 'default' : 'outline'}
                size="xl"
                className="w-full justify-start h-auto py-4 active:scale-[0.98] transition-transform"
                onClick={() => onSelect(option.value)}
                iconEnd={isSelected ? <Check /> : undefined}
              >
                <div className="text-left flex-1">
                  <span>{option.label}</span>
                  {option.description && (
                    <span className="block text-xs font-normal opacity-70 mt-0.5">
                      {option.description}
                    </span>
                  )}
                </div>
              </Button>
            )
          })}
        </CardContent>
      </Card>
    </motion.div>
  )
}
