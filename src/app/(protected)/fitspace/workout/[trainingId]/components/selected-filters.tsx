import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, FunnelX, XIcon } from 'lucide-react'
import { useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { GQLEquipment } from '@/generated/graphql-client'
import { cn } from '@/lib/utils'
import { translateEquipment } from '@/utils/translate-equipment'

export function SelectedFilters({
  selectedMuscleGroups,
  selectedEquipment,
  onClearFilters,
  onEquipmentToggle,
  onMuscleGroupToggle,
}: {
  selectedMuscleGroups: string[]
  selectedEquipment: GQLEquipment[]
  onClearFilters: () => void
  onEquipmentToggle: (equipment: GQLEquipment) => void
  onMuscleGroupToggle: (muscleGroup: string) => void
}) {
  const [showFilters, setShowFilters] = useState(false)
  if (selectedMuscleGroups.length === 0 && selectedEquipment.length === 0) {
    return null
  }

  return (
    <motion.div
      key="selected-filters-container"
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      transition={{ duration: 0.2 }}
      className="overflow-hidden"
    >
      <div className="flex justify-between items-baseline">
        <Button
          variant="variantless"
          size="variantless"
          className="text-sm text-muted-foreground"
          onClick={() => setShowFilters(!showFilters)}
          iconEnd={
            <ChevronDown
              className={cn(
                'transition-transform duration-200',
                showFilters && 'rotate-180',
              )}
            />
          }
        >
          Selected filters (
          {selectedMuscleGroups.length + selectedEquipment.length})
        </Button>
        <Button
          variant="secondary"
          size="icon-sm"
          iconOnly={<FunnelX />}
          onClick={onClearFilters}
        />
      </div>
      <AnimatePresence mode="wait">
        {showFilters && (
          <motion.div
            key="selected-filters"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="flex flex-wrap gap-2 mt-2">
              {selectedEquipment.map((equipment) => (
                <Badge
                  key={equipment}
                  variant="primary"
                  onClick={() => onEquipmentToggle(equipment)}
                >
                  {translateEquipment(equipment)} <XIcon />
                </Badge>
              ))}
              {selectedMuscleGroups.map((muscleGroup) => (
                <Badge
                  key={muscleGroup}
                  variant="primary"
                  onClick={() => onMuscleGroupToggle(muscleGroup)}
                >
                  {muscleGroup} <XIcon />
                </Badge>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
