'use client'

import { motion } from 'framer-motion'

import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { GQLEquipment } from '@/generated/graphql-client'

import { EquipmentFilters } from '../../training/components/equipment-filters'
import type { AiWorkoutInputData } from '../hooks/use-ai-workout-generation'

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
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <EquipmentFilters
          selectedEquipment={data.selectedEquipment}
          onEquipmentToggle={handleEquipmentToggle}
          equipment={allEquipment}
          variant="grid"
        />
      </motion.div>
    </div>
  )
}
