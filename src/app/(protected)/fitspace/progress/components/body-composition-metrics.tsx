'use client'

import { differenceInYears } from 'date-fns'
import { Calculator, Heart, Scale, TrendingUp } from 'lucide-react'
import { useMemo } from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { useProfileQuery } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { calculateBMR } from '@/lib/workout/calculate-calories-burned'

import { BodyFatEstimationGuide } from './body-fat-estimation-guide'
import { useBodyMeasurementsContext } from './body-measurements-context'

// BMI Categories based on WHO standards
const getBMICategory = (bmi: number) => {
  if (bmi < 18.5)
    return {
      category: 'Underweight',
      variant: 'info' as const,
      description: 'May need to gain weight',
    }
  if (bmi < 25)
    return {
      category: 'Normal weight',
      variant: 'primary' as const,
      description: 'Healthy weight range',
    }
  if (bmi < 30)
    return {
      category: 'Overweight',
      variant: 'warning' as const,
      description: 'May need to lose weight',
    }
  return {
    category: 'Obese',
    variant: 'destructive' as const,
    description: 'Health risks may be present',
  }
}

// BMR Categories based on activity level
const getBMRActivity = (bmr: number) => {
  const activities = [
    {
      level: 'Sedentary',
      multiplier: 1.2,
      description: 'Little to no exercise',
    },
    {
      level: 'Light',
      multiplier: 1.375,
      description: 'Light exercise 1-3 days/week',
    },
    {
      level: 'Moderate',
      multiplier: 1.55,
      description: 'Moderate exercise 3-5 days/week',
    },
    {
      level: 'Active',
      multiplier: 1.725,
      description: 'Hard exercise 6-7 days/week',
    },
    {
      level: 'Very Active',
      multiplier: 1.9,
      description: 'Very hard exercise, physical job',
    },
  ]

  return activities.map((activity) => ({
    ...activity,
    calories: Math.round(bmr * activity.multiplier),
  }))
}

export function BodyCompositionMetrics() {
  const { data: profileData } = useProfileQuery()
  const { getLatestMeasurement, getEstimatedBodyFat } =
    useBodyMeasurementsContext()

  const metrics = useMemo(() => {
    const profile = profileData?.profile
    if (!profile) return null

    const weight = getLatestMeasurement('weight') || profile.weight
    const height = profile.height
    const birthday = profile.birthday
    const sex = profile.sex

    if (!weight || !height || !birthday || !sex) return null

    const age = differenceInYears(new Date(), new Date(birthday))

    // Calculate BMI
    const bmi = weight / Math.pow(height / 100, 2)

    // Calculate BMR
    const bmr = calculateBMR({
      weightKg: weight,
      heightCm: height,
      age,
      gender: sex,
    })

    // Get estimated body fat if available
    const bodyFat = getEstimatedBodyFat()

    return {
      weight,
      height,
      age,
      sex,
      bmi,
      bmr,
      bodyFat,
      bmiCategory: getBMICategory(bmi),
      bmrActivities: getBMRActivity(bmr),
    }
  }, [profileData, getLatestMeasurement, getEstimatedBodyFat])

  if (!metrics) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Calculator className="size-12 text-muted-foreground mx-auto mb-4" />
          <p className="text-muted-foreground">
            Complete your profile to see BMI and BMR calculations
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* BMI Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Scale className="size-5 text-muted-foreground" />
                <CardTitle className="text-lg">Body Mass Index</CardTitle>
              </div>
              <Badge variant={metrics.bmiCategory.variant}>
                {metrics.bmiCategory.category}
              </Badge>
            </div>
            <CardDescription>BMI = Weight (kg) ÷ Height² (m)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {metrics.bmi.toFixed(1)}
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              {metrics.bmiCategory.description}
            </p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Weight:</span>
                <span className="font-medium">{metrics.weight} kg</span>
              </div>
              <div className="flex justify-between">
                <span>Height:</span>
                <span className="font-medium">{metrics.height} cm</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* BMR Card */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <Heart className="size-5 text-muted-foreground" />
              <CardTitle className="text-lg">Basal Metabolic Rate</CardTitle>
            </div>
            <CardDescription>Calories burned at rest per day</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold mb-2">
              {metrics.bmr.toLocaleString()}
            </div>
            <p className="text-sm text-muted-foreground mb-4">calories/day</p>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Age:</span>
                <span className="font-medium">{metrics.age} years</span>
              </div>
              <div className="flex justify-between">
                <span>Gender:</span>
                <span className="font-medium capitalize">{metrics.sex}</span>
              </div>
              {metrics.bodyFat && (
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Body Fat:</span>
                    <span className="font-medium">
                      {metrics.bodyFat.percentage.toFixed(1)}%
                      {metrics.bodyFat.isEstimated && (
                        <span className="text-xs text-muted-foreground ml-1">
                          (est.)
                        </span>
                      )}
                    </span>
                  </div>

                  {/* Show estimation details if it's estimated */}
                  {metrics.bodyFat.isEstimated && (
                    <div className="text-xs text-muted-foreground space-y-1">
                      <div className="flex justify-between">
                        <span>Method:</span>
                        <span>{metrics.bodyFat.method}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Confidence:</span>
                        <span
                          className={cn(
                            'first-letter:uppercase',
                            metrics.bodyFat.confidence === 'high'
                              ? 'text-green-600 dark:text-green-400'
                              : metrics.bodyFat.confidence === 'medium'
                                ? 'text-yellow-600 dark:text-yellow-400'
                                : 'text-red-600 dark:text-red-400',
                          )}
                        >
                          {metrics.bodyFat.confidence}
                        </span>
                      </div>

                      {metrics.bodyFat.missingMeasurements &&
                        metrics.bodyFat.missingMeasurements.length > 0 && (
                          <Alert variant="info" className="mt-2">
                            <AlertTitle>
                              For Navy Method (most accurate):
                            </AlertTitle>
                            <AlertDescription>
                              Add:{' '}
                              {metrics.bodyFat.missingMeasurements.join(', ')}
                            </AlertDescription>
                          </Alert>
                        )}
                    </div>
                  )}
                  {metrics.bodyFat?.isEstimated && (
                    <BodyFatEstimationGuide
                      estimatedBodyFat={metrics.bodyFat}
                    />
                  )}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Daily Calorie Needs */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <TrendingUp className="size-5 text-muted-foreground" />
            <CardTitle>Daily Calorie Needs</CardTitle>
          </div>
          <CardDescription>
            Based on your BMR and activity level
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {metrics.bmrActivities.map((activity, index) => (
              <div key={index} className="p-4 rounded-lg border bg-muted/50">
                <div className="font-semibold text-sm mb-1">
                  {activity.level}
                </div>
                <div className="text-2xl font-bold text-primary mb-1">
                  {activity.calories.toLocaleString()}
                </div>
                <div className="text-xs text-muted-foreground">
                  {activity.description}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
