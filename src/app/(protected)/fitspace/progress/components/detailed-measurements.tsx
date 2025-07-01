import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { GQLBodyMeasuresQuery } from '@/generated/graphql-client'

import { MeasurementCategoryDrawer } from './measurement-category-drawer'
import { measurementCategories } from './measurement-constants'
import { Section } from './section'
import { StatCard } from './stat-card'
import { useBodyMeasurements } from './use-body-measurements'

interface DetailedMeasurementsProps {
  bodyMeasures: GQLBodyMeasuresQuery['bodyMeasures']
  onMeasurementAdded: () => void
}

export function DetailedMeasurements({
  bodyMeasures,
  onMeasurementAdded,
}: DetailedMeasurementsProps) {
  const { getLatestMeasurement, getTrend, categoryHasData } =
    useBodyMeasurements(bodyMeasures)

  if (bodyMeasures.length === 0) {
    return null
  }

  return (
    <Section title="Detailed Measurements">
      <Accordion type="multiple" className="w-full">
        {measurementCategories.map((category) => {
          const hasData = categoryHasData(category.fields)

          return (
            <AccordionItem key={category.id} value={category.id}>
              <AccordionTrigger className="hover:no-underline">
                <div className="text-left">
                  <div className="font-semibold">{category.title}</div>
                  {category.description && (
                    <div className="text-sm text-muted-foreground">
                      {category.description}
                    </div>
                  )}
                </div>
              </AccordionTrigger>
              <AccordionContent>
                <div className="pt-4 space-y-4">
                  {/* Category Stats Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {category.fields.map((field) => (
                      <StatCard
                        key={field.key}
                        label={field.label}
                        value={getLatestMeasurement(field.key)}
                        unit={field.unit}
                        trend={getTrend(field.key)}
                      />
                    ))}
                  </div>

                  {/* View Details Button */}
                  {hasData && (
                    <MeasurementCategoryDrawer
                      category={category}
                      measurements={bodyMeasures}
                      onUpdate={onMeasurementAdded}
                    >
                      <Button variant="secondary" className="w-full">
                        View Details & Charts
                      </Button>
                    </MeasurementCategoryDrawer>
                  )}
                </div>
              </AccordionContent>
            </AccordionItem>
          )
        })}
      </Accordion>
    </Section>
  )
}
