'use client'

import { motion } from 'framer-motion'

import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { GQLEquipment } from '@/generated/graphql-client'

import { EquipmentFilters } from '../../[trainingId]/components/equipment-filters'

import type { AiWorkoutInputData } from './ai-workout-input'

interface AiEquipmentStepProps {
  data: AiWorkoutInputData
  onDataChange: (data: AiWorkoutInputData) => void
}

export function AiEquipmentStep({ data, onDataChange }: AiEquipmentStepProps) {
  const allEquipment = EQUIPMENT_OPTIONS.map((equipment) => equipment.value)

  const handleEquipmentToggle = (equipment: GQLEquipment) => {
    const selectedEquipment = data.selectedEquipment.includes(equipment)
      ? data.selectedEquipment.filter((e) => e !== equipment)
      : [...data.selectedEquipment, equipment]

    onDataChange({ ...data, selectedEquipment })
  }

  return (
    <div className="space-y-6">
      {/* Selection count */}
      {data.selectedEquipment.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <span className="text-sm text-muted-foreground">
            {data.selectedEquipment.length} equipment type
            {data.selectedEquipment.length !== 1 ? 's' : ''} selected
          </span>
        </motion.div>
      )}

      {/* Equipment filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <EquipmentFilters
          selectedEquipment={data.selectedEquipment}
          onEquipmentToggle={handleEquipmentToggle}
          equipment={allEquipment}
          variant="cards"
        />
      </motion.div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
        className="text-center text-sm text-muted-foreground bg-card p-4 rounded-lg"
      >
        Select the equipment you have available. We will create a workout using
        only your selected equipment.
        {data.selectedEquipment.length === 0 && (
          <div className="mt-2 text-xs opacity-80">
            You can also skip this step to let us include bodyweight exercises
            and suggest equipment alternatives.
          </div>
        )}
      </motion.div>
    </div>
  )
}
