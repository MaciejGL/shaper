'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { equipmentImages } from '@/constants/equipment'
import { GQLEquipment } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

type EquipmentFiltersProps = {
  selectedEquipment: GQLEquipment[]
  onEquipmentToggle: (equipment: GQLEquipment) => void
  equipment: GQLEquipment[]
  variant?: 'compact' | 'cards' | 'grid'
}

export function EquipmentFilters({
  selectedEquipment,
  onEquipmentToggle,
  equipment,
  variant = 'compact',
}: EquipmentFiltersProps) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-1">
        {equipment.map((equipmentItem) => (
          <Card
            key={equipmentItem}
            className={cn(
              'cursor-pointer transition-all relative overflow-hidden p-0 rounded-none first:rounded-t-md last:rounded-b-md not-first:border-t-0',
            )}
            onClick={() => onEquipmentToggle(equipmentItem)}
          >
            <CardContent className="flex flex-row items-center gap-2 h-20 p-0">
              <div className="h-20 w-20 overflow-hidden relative">
                <Image
                  alt={equipmentItem}
                  src={equipmentImages[equipmentItem]}
                  width={80}
                  height={80}
                  priority
                  className="object-contain size-full overflow-hidden"
                />
              </div>
              <div className="text-lg font-medium p-1">
                {translateEquipment(equipmentItem)}
              </div>
              <AnimatePresence>
                {selectedEquipment.includes(equipmentItem) && (
                  <motion.div
                    key={`${equipmentItem}-check`}
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.5 }}
                    transition={{ duration: 0.1 }}
                    className="absolute top-1/2 right-2 -translate-y-1/2 z-[10000] flex items-center justify-center size-6 bg-primary text-primary-foreground rounded-full shadow-lg"
                  >
                    <CheckIcon className="w-4 h-4" />
                  </motion.div>
                )}
              </AnimatePresence>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (variant === 'grid') {
    return (
      <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
        {equipment.map((equipmentItem) => (
          <Button
            key={equipmentItem}
            onClick={() => onEquipmentToggle(equipmentItem)}
            variant={
              selectedEquipment.includes(equipmentItem) ? 'default' : 'outline'
            }
            className="h-16 flex flex-col gap-1 p-2"
          >
            <div className="relative h-8 w-8">
              <Image
                alt={equipmentItem}
                src={equipmentImages[equipmentItem]}
                fill
                sizes="(max-width: 640px) 25vw, 16.67vw"
                priority
                className="object-cover rounded-lg overflow-hidden"
              />
            </div>
            <span className="text-xs leading-tight">
              {translateEquipment(equipmentItem)?.split(' ')[0]}
            </span>
          </Button>
        ))}
      </div>
    )
  }

  // Default compact variant
  return (
    <div className="flex flex-wrap gap-2">
      {equipment.map((equipmentItem) => (
        <Button
          key={equipmentItem}
          onClick={() => onEquipmentToggle(equipmentItem)}
          variant={
            selectedEquipment.includes(equipmentItem) ? 'default' : 'outline'
          }
          size="sm"
          className="gap-2"
        >
          <div className="relative h-6 w-6">
            <Image
              alt={equipmentItem}
              src={equipmentImages[equipmentItem]}
              fill
              sizes="32px"
              priority
              className="object-cover rounded-lg overflow-hidden"
            />
          </div>
          {translateEquipment(equipmentItem)}
        </Button>
      ))}
    </div>
  )
}
