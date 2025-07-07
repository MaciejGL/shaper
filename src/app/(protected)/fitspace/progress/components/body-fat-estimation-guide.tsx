import { InfoIcon } from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'

import { EstimationMethodItem } from './estimation-method-item'

interface BodyFatEstimationGuideProps {
  estimatedBodyFat: {
    confidence: 'high' | 'medium' | 'low'
    method: string
    missingMeasurements?: string[]
  }
}

export function BodyFatEstimationGuide({
  estimatedBodyFat,
}: BodyFatEstimationGuideProps) {
  if (estimatedBodyFat.confidence === 'high') {
    return null
  }

  return (
    <Accordion
      type="single"
      collapsible
      defaultValue="body-fat-estimation-guide"
    >
      <AccordionItem value="body-fat-estimation-guide">
        <AccordionTrigger className="flex items-center justify-between w-full p-4 bg-card-on-card rounded-lg text-left hover:bg-card-on-card/80 dark:hover:bg-card-on-card/80 transition-colors">
          <div>
            <div className="flex items-center gap-2">
              <InfoIcon size={16} />
              <span className="text-sm font-medium ">
                Body Fat Estimation Guide
              </span>
            </div>
            <p className="text-xs mt-1 text-muted-foreground">
              Currently using{' '}
              <span className="font-bold text-foreground">
                {estimatedBodyFat.method}
              </span>
            </p>
          </div>
        </AccordionTrigger>

        <AccordionContent>
          <BodyFatEstimationGuideContent estimatedBodyFat={estimatedBodyFat} />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}

export function BodyFatEstimationGuideContent({
  estimatedBodyFat,
}: {
  estimatedBodyFat: BodyFatEstimationGuideProps['estimatedBodyFat']
}) {
  const missingMeasurements = estimatedBodyFat.missingMeasurements || []

  const estimationMethods = [
    {
      rank: 1,
      name: 'Navy Method',
      accuracy: 'Most Accurate' as const,
      requirements: 'Requires: Waist & Neck (+ Hips for women)',
      tip: "Measure waist at narrowest point, neck just below Adam's apple",
    },
    {
      rank: 2,
      name: 'Waist-to-Height Ratio',
      accuracy: 'Good' as const,
      requirements: 'Requires: Waist measurement (already have height)',
      tip: 'Simple and effective for general health assessment',
    },
    {
      rank: 3,
      name: 'BMI Method',
      accuracy: 'Least Accurate' as const,
      requirements:
        'Uses: Weight, Height, Age & Sex (no additional measurements needed)',
      tip: "Less accurate as it doesn't account for muscle mass",
    },
  ]

  const proTips = [
    'Measure consistently: Same time of day, same conditions',
    'Use a flexible tape measure: Snug but not tight',
    'Waist: Measure at the narrowest point of your torso',
    "Neck: Just below the Adam's apple, straight around",
    'Track over time: Single measurements can vary, trends matter more',
  ]
  return (
    <div className="mt-2 p-4 bg-card-on-card rounded-lg">
      <div className="space-y-4">
        {/* Method Hierarchy */}
        <div>
          <h4 className="text-sm font-semibold  mb-2">
            Estimation Method Hierarchy
          </h4>
          <div className="space-y-3">
            {estimationMethods.map((method) => (
              <EstimationMethodItem
                key={method.rank}
                rank={method.rank}
                name={method.name}
                accuracy={method.accuracy}
                requirements={method.requirements}
                tip={method.tip}
              />
            ))}
          </div>
        </div>

        {/* Pro Tips */}
        <div className="border-t border-card-on-card pt-3">
          <h4 className="text-md font-semibold  mb-2">
            Pro Tips for Better Accuracy
          </h4>
          <ul className="text-sm text-muted-foreground space-y-1 list-disc pl-4">
            {proTips.map((tip, index) => (
              <li key={index}>{tip}</li>
            ))}
          </ul>
        </div>

        {/* Next Steps */}
        {missingMeasurements.length > 0 && (
          <div className="border-t border-card-on-card pt-3">
            <h4 className="text-md font-semibold mb-2">
              Next Steps to Improve Accuracy
            </h4>
            <p className="text-sm text-muted-foreground mb-2">
              Add these measurements to upgrade to a more accurate method:
            </p>
            <div className="flex flex-wrap gap-2">
              {missingMeasurements.map((measurement) => (
                <Badge key={measurement} variant="outline">
                  {measurement}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
