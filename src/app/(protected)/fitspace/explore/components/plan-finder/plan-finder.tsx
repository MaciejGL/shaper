'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Check, Sparkles } from 'lucide-react'
import Image from 'next/image'
import { useState } from 'react'

import { Loader } from '@/components/loader'
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

import { PublicTrainingPlan } from '../explore.client'

import { PlanFinderAnswers, scorePlans } from './utils'

interface PlanFinderProps {
  plans: PublicTrainingPlan[]
  onSelectPlan: (plan: PublicTrainingPlan) => void
  onClose: () => void
}

const QUESTIONS = [
  {
    id: 'goal',
    title: 'What is your main goal?',
    options: ['Build muscle', 'Get stronger', 'Lose fat', 'General fitness'],
  },
  {
    id: 'experience',
    title: 'How experienced are you?',
    options: ['Beginner', 'Intermediate', 'Experienced'],
  },
  {
    id: 'daysPerWeek',
    title: 'Days per week to train?',
    options: ['2', '3', '4', '5+'],
  },
  {
    id: 'duration',
    title: 'Time per workout?',
    options: ['≤ 20 min', '20–40 min', '40–60 min', '60+'],
  },
] as const

export function PlanFinder({ plans, onSelectPlan, onClose }: PlanFinderProps) {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Partial<PlanFinderAnswers>>({})
  const [isCalculating, setIsCalculating] = useState(false)
  const [results, setResults] = useState<ReturnType<typeof scorePlans>>([])

  const currentQuestion = QUESTIONS[step]
  const isLastQuestion = step === QUESTIONS.length - 1
  const progress = ((step + 1) / QUESTIONS.length) * 100

  const handleOptionSelect = (option: string) => {
    const newAnswers = { ...answers }

    if (currentQuestion.id === 'daysPerWeek') {
      newAnswers.daysPerWeek = parseInt(option)
    } else if (currentQuestion.id === 'duration') {
      if (option.includes('20')) newAnswers.duration = 20
      else if (option.includes('40')) newAnswers.duration = 30
      else if (option.includes('60')) newAnswers.duration = 50
      else newAnswers.duration = 70
    } else if (currentQuestion.id === 'goal') {
      newAnswers.goal = option
    } else {
      newAnswers.experience = option
    }

    setAnswers(newAnswers)

    if (isLastQuestion) {
      calculateResults(newAnswers as PlanFinderAnswers)
    } else {
      setTimeout(() => setStep((s) => s + 1), 250)
    }
  }

  const calculateResults = (finalAnswers: PlanFinderAnswers) => {
    setIsCalculating(true)
    // Simulate calculation time for UX
    setTimeout(() => {
      const scored = scorePlans(plans, finalAnswers)
      setResults(scored)
      setIsCalculating(false)
      setStep(step + 1) // Move to results
    }, 800)
  }

  const handleBack = () => {
    if (step > 0) setStep((s) => s - 1)
  }

  const selectedDaysOption =
    typeof answers.daysPerWeek === 'number'
      ? answers.daysPerWeek >= 5
        ? '5+'
        : String(answers.daysPerWeek)
      : null

  const selectedDurationOption =
    answers.duration === 20
      ? '≤ 20 min'
      : answers.duration === 30
        ? '20–40 min'
        : answers.duration === 50
          ? '40–60 min'
          : answers.duration === 70
            ? '60+'
            : null

  if (step === QUESTIONS.length) {
    // Results View
    const topMatch = results[0]
    const otherMatches = results.slice(1, 4)

    return (
      <div className="space-y-6 pt-4">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold">Your Best Matches</h2>
          <p className="text-muted-foreground">
            Based on your goal to{' '}
            <span className="text-foreground font-medium">
              {answers.goal?.toLowerCase()}
            </span>
          </p>
        </div>

        {topMatch ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="relative"
          >
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3 py-1 rounded-full text-xs font-bold z-10 flex items-center gap-1">
              <Sparkles className="h-3 w-3" /> Top Match
            </div>
            <Card
              className="border-primary/50 overflow-hidden cursor-pointer hover:border-primary transition-colors"
              onClick={() => onSelectPlan(topMatch.plan)}
            >
              <div className="h-44 relative">
                {topMatch.plan.heroImageUrl ? (
                  <Image
                    src={topMatch.plan.heroImageUrl}
                    alt={`${topMatch.plan.title} cover`}
                    fill
                    className="object-cover"
                    quality={100}
                    sizes="100vw"
                  />
                ) : null}
                <div className="absolute inset-0 bg-linear-to-t from-black/80 to-transparent" />
                <div className="absolute bottom-3 left-4 right-4">
                  <h3 className="text-xl font-bold text-white">
                    {topMatch.plan.title}
                  </h3>
                  <div className="flex gap-2 text-white/80 text-xs mt-1">
                    <span>{topMatch.plan.sessionsPerWeek} days/week</span>
                    <span>•</span>
                    <span>{topMatch.plan.difficulty?.toLowerCase()}</span>
                  </div>
                </div>
              </div>
              <CardContent className="p-4 bg-card">
                <div className="space-y-3">
                  <div className="text-sm text-muted-foreground">
                    <span className="font-medium text-primary block mb-1">
                      Why this plan:
                    </span>
                    <ul className="list-disc list-inside space-y-1">
                      {topMatch.matchReasons.map((reason, i) => (
                        <li key={i}>{reason}</li>
                      ))}
                    </ul>
                  </div>
                  <Button className="w-full" size="lg">
                    Start this plan
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ) : (
          <div className="text-center py-8">
            <p>No perfect matches found. Try adjusting your preferences.</p>
            <Button
              onClick={() => setStep(0)}
              variant="outline"
              className="mt-4"
            >
              Restart Quiz
            </Button>
          </div>
        )}

        {otherMatches.length > 0 && (
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
              Other Great Options
            </h4>
            {otherMatches.map((match, i) => (
              <motion.div
                key={match.plan.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 * (i + 1) }}
              >
                <Card
                  className="flex items-center p-4 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={() => onSelectPlan(match.plan)}
                >
                  <div className="h-32 aspect-5/4 rounded-md mr-4 shrink-0 overflow-hidden relative">
                    {match.plan.heroImageUrl ? (
                      <Image
                        src={match.plan.heroImageUrl}
                        alt={`${match.plan.title} cover`}
                        fill
                        className="object-cover"
                        quality={100}
                        sizes="160px"
                      />
                    ) : null}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-center">
                      {match.plan.title}
                    </h4>
                    <p className="text-xs text-muted-foreground text-center">
                      {match.matchReasons[0]}
                    </p>
                  </div>
                  <Button
                    variant="default"
                    size="icon-md"
                    className="shrink-0 ml-2"
                    iconOnly={<ArrowRight className="h-4 w-4" />}
                  >
                    Open
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <div className="pt-4 flex justify-between">
          <Button variant="ghost" onClick={() => setStep(0)}>
            Restart
          </Button>
          <Button variant="outline" onClick={onClose}>
            See all plans
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="relative flex items-center justify-center">
          {step > 0 && (
            <div className="absolute left-0">
              <Button
                variant="ghost"
                iconOnly={<ArrowLeft />}
                onClick={handleBack}
              >
                Back
              </Button>
            </div>
          )}
          <span className="text-base font-semibold text-muted-foreground tabular-nums">
            Step {step + 1} of {QUESTIONS.length}
          </span>
        </div>
        <Progress value={progress} className="h-1" />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          transition={{ duration: 0.2 }}
        >
          {isCalculating ? (
            <div className="min-h-[320px] flex flex-col items-center justify-center gap-2">
              <Loader size="lg" />
              <p className="text-xs text-muted-foreground leading-snug">
                Finding your perfect plan...
              </p>
            </div>
          ) : (
            <Card className="border-none shadow-none bg-transparent">
              <CardHeader className="px-0 pt-0">
                <CardTitle className="text-2xl">
                  {currentQuestion.title}
                </CardTitle>
                <CardDescription>
                  Select the option that matches best
                </CardDescription>
              </CardHeader>
              <CardContent className="px-0 space-y-3">
                {currentQuestion.options.map((option) => {
                  const isSelected =
                    currentQuestion.id === 'goal'
                      ? answers.goal === option
                      : currentQuestion.id === 'experience'
                        ? answers.experience === option
                        : currentQuestion.id === 'daysPerWeek'
                          ? selectedDaysOption === option
                          : selectedDurationOption === option

                  return (
                    <Button
                      key={option}
                      variant={isSelected ? 'default' : 'outline'}
                      size="xl"
                      className="w-full justify-between"
                      onClick={() => handleOptionSelect(option)}
                      iconEnd={isSelected ? <Check /> : undefined}
                    >
                      {option}
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
