'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon } from 'lucide-react'
import { CldImage } from 'next-cloudinary'

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
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {equipment.map((equipmentItem) => (
          <Card
            key={equipmentItem}
            className={cn(
              'aspect-square cursor-pointer transition-all bg-neutral-400 dark:bg-neutral-500 relative overflow-hidden rounded-lg shadow-xs',
            )}
            onClick={() => onEquipmentToggle(equipmentItem)}
          >
            <CardContent className="px-2 text-center space-y-2">
              <div className="mx-auto size-full max-w-24 max-h-24 aspect-square rounded-lg overflow-hidden">
                <CldImage
                  alt={equipmentItem}
                  src={equipmentImages[equipmentItem]}
                  fill
                  quality={75}
                  fetchPriority="high"
                  crop="auto"
                  placeholder="blur"
                  blurDataURL={equipmentImages[equipmentItem]}
                  className="object-fill size-full rounded-lg overflow-hidden"
                />
              </div>
              <div className="text-sm bg-muted/50 font-medium absolute bottom-0 left-0 right-0 p-1">
                {translateEquipment(equipmentItem)}
              </div>
            </CardContent>
            <AnimatePresence>
              {selectedEquipment.includes(equipmentItem) && (
                <motion.div
                  key={`${equipmentItem}-check`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.5 }}
                  transition={{ duration: 0.2 }}
                  className="absolute top-2 right-2 z-[10000] flex items-center justify-center size-6 bg-black text-white rounded-full shadow-lg"
                >
                  <CheckIcon className="w-4 h-4" />
                </motion.div>
              )}
            </AnimatePresence>
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
            <div>
              <CldImage
                alt={equipmentItem}
                src={equipmentImages[equipmentItem]}
                fill
                quality={75}
                fetchPriority="high"
                crop="fill"
                className="object-cover w-full h-full rounded-lg overflow-hidden"
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
          <CldImage
            alt={equipmentItem}
            src={equipmentImages[equipmentItem]}
            fill
            quality={75}
            fetchPriority="high"
            crop="fill"
            className="object-cover w-full h-full rounded-lg overflow-hidden"
          />
          {translateEquipment(equipmentItem)}
        </Button>
      ))}
    </div>
  )
}
