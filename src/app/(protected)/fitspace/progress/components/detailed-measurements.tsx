import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Card, CardContent } from '@/components/ui/card'
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
  const { getLatestMeasurement, getTrend } = useBodyMeasurements(bodyMeasures)

  if (bodyMeasures.length === 0) {
    return null
  }

  return (
    <Section title="Detailed Measurements">
      <Card>
        <CardContent>
          <Accordion type="multiple" className="w-full">
            {measurementCategories.map((category) => {
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
                        {category.fields.map((field) => {
                          // Get all measurements that have data for this specific field
                          const fieldMeasurements = bodyMeasures.filter(
                            (measurement) =>
                              measurement[field.key] !== null &&
                              measurement[field.key] !== undefined,
                          )

                          // Only make clickable if there are actual measurements for this field
                          const hasFieldData = fieldMeasurements.length > 0

                          // If field has data, make it clickable with drawer
                          if (hasFieldData) {
                            return (
                              <MeasurementCategoryDrawer
                                key={field.key}
                                category={category}
                                measurements={fieldMeasurements} // Pass only measurements with this field's data
                                onUpdate={onMeasurementAdded}
                                focusField={field.key}
                              >
                                <button className="text-left">
                                  <StatCard
                                    label={field.label}
                                    value={getLatestMeasurement(field.key)}
                                    unit={field.unit}
                                    trend={getTrend(field.key)}
                                    isOnCard={true}
                                  />
                                </button>
                              </MeasurementCategoryDrawer>
                            )
                          }

                          // If no data for this field, show non-clickable StatCard
                          return (
                            <StatCard
                              key={field.key}
                              label={field.label}
                              value={getLatestMeasurement(field.key)}
                              unit={field.unit}
                              trend={getTrend(field.key)}
                              isOnCard={true}
                            />
                          )
                        })}
                      </div>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              )
            })}
          </Accordion>
        </CardContent>
      </Card>
    </Section>
  )
}
