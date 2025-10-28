'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { Notebook, Sparkles, Users, Utensils } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { DISCOUNT_CONFIG } from '@/lib/stripe/discount-config'
import { cn } from '@/lib/utils'

interface ServiceOption {
  id: string
  label: string
  icon: React.ElementType
  description: string
}

const serviceOptions: ServiceOption[] = [
  {
    id: 'coaching_complete',
    label: 'Premium Coaching',
    icon: Sparkles,
    description:
      'Premium coaching with training and meal plans + bi-weekly check-ins and premium platform access',
  },
  {
    id: 'workout_plan',
    label: 'Training Plan',
    icon: Notebook,
    description: 'Personalized workout program',
  },
  {
    id: 'meal_plan',
    label: 'Meal Plan',
    icon: Utensils,
    description: 'Custom nutrition & meal planning',
  },
  {
    id: 'in_person_meeting',
    label: 'In-Person Training',
    icon: Users,
    description: 'Face-to-face training sessions',
  },
]

interface ServiceInterestSelectorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: (interests: string[], message: string) => void
  trainerName: string
  isLoading?: boolean
}

export function ServiceInterestSelector({
  open,
  onOpenChange,
  onConfirm,
  trainerName,
  isLoading = false,
}: ServiceInterestSelectorProps) {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [message, setMessage] = useState(
    `Hi ${trainerName}, I'm interested in your coaching services.`,
  )

  const toggleService = (serviceId: string) => {
    setSelectedServices((prev) =>
      prev.includes(serviceId)
        ? prev.filter((id) => id !== serviceId)
        : [...prev, serviceId],
    )
  }

  const handleConfirm = () => {
    onConfirm(selectedServices, message)
  }

  // Check if coaching+in-person bundle selected (50% off in-person sessions)
  const hasCoachingInPersonBundle =
    selectedServices.includes('coaching_complete') &&
    selectedServices.includes('in_person_meeting')

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        dialogTitle={`Request Coaching from ${trainerName}`}
        fullScreen
      >
        <div className="space-y-6">
          <div>
            <h3 className="text-lg font-semibold mb-2">
              What are you interested in?
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Select the services you'd like to discuss (optional)
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {serviceOptions.map((service) => {
                const Icon = service.icon
                const isSelected = selectedServices.includes(service.id)

                return (
                  <Card
                    key={service.id}
                    className={cn(
                      'cursor-pointer transition-colors',
                      isSelected
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50',
                    )}
                    onClick={() => toggleService(service.id)}
                  >
                    <CardHeader className="flex flex-row items-start gap-3 space-y-0">
                      <Checkbox
                        checked={isSelected}
                        onCheckedChange={() => toggleService(service.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <div className="flex-1">
                        <CardTitle className="text-base flex items-center gap-2">
                          <Icon className="size-4" />
                          {service.label}
                        </CardTitle>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0 pl-11">
                      <p className="text-sm text-muted-foreground">
                        {service.description}
                      </p>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <AnimatePresence>
              {hasCoachingInPersonBundle && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{
                    duration: 0.2,
                    type: 'spring',
                    stiffness: 200,
                    damping: 25,
                  }}
                >
                  <div className="pt-3" />

                  <div className="p-3 bg-green-50 dark:bg-green-950/20 border border-green-200 dark:border-green-800 rounded-md">
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-600">
                        Save {DISCOUNT_CONFIG.IN_PERSON_COACHING_COMBO}%
                      </Badge>
                      <span className="text-sm font-medium text-green-900 dark:text-green-100">
                        Coaching + In-Person Bundle eligible!
                      </span>
                    </div>
                    <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                      Get {DISCOUNT_CONFIG.IN_PERSON_COACHING_COMBO}% off
                      in-person training sessions with Premium Coaching
                    </p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          <div className="space-y-2">
            <Label htmlFor="message">Message to {trainerName} (optional)</Label>
            <Textarea
              id="message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Let the trainer know about your goals..."
              rows={3}
            />
          </div>

          <div className="flex gap-3">
            <Button
              variant="tertiary"
              onClick={() => onOpenChange(false)}
              className="flex-1"
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1"
              loading={isLoading}
              disabled={isLoading}
            >
              Send Request
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
