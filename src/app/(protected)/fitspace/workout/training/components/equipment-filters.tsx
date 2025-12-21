'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { CheckIcon } from 'lucide-react'
import Image from 'next/image'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { equipmentImages } from '@/config/equipment'
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
  variant = 'grid',
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
                  width={100}
                  height={100}
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

  return (
    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
      {equipment.map((equipmentItem) => (
        <Button
          key={equipmentItem}
          onClick={() => onEquipmentToggle(equipmentItem)}
          variant={
            selectedEquipment.includes(equipmentItem) ? 'outline' : 'outline'
          }
          className="size-full flex flex-col gap-0 p-0 overflow-hidden relative"
        >
          <div className="relative size-full">
            <Image
              alt={equipmentItem}
              src={equipmentImages[equipmentItem]}
              width={200}
              height={200}
              className="object-cover overflow-hidden size-full"
            />
          </div>
          <span className="text-xs leading-tight py-1">
            {translateEquipment(equipmentItem)?.split(' ')[0]}
          </span>

          <AnimatePresence>
            {selectedEquipment.includes(equipmentItem) && (
              <motion.div
                key={`${equipmentItem}-check`}
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.5 }}
                transition={{ duration: 0.1 }}
                className="absolute top-1 right-1 z-[10000] flex items-center justify-center size-5 bg-black/80 text-white rounded-full shadow-lg"
              >
                <CheckIcon className="!size-3" />
              </motion.div>
            )}
          </AnimatePresence>
        </Button>
      ))}
    </div>
  )
}
