'use client'

import { motion } from 'framer-motion'

import { EQUIPMENT_OPTIONS } from '@/constants/equipment'
import { GQLEquipment } from '@/generated/graphql-client'

import { EquipmentFilters } from '../../[trainingId]/components/equipment-filters'

interface ManualEquipmentStepProps {
  selectedEquipment: GQLEquipment[]
  onEquipmentToggle: (equipment: GQLEquipment) => void
}

export function ManualEquipmentStep({
  selectedEquipment,
  onEquipmentToggle,
}: ManualEquipmentStepProps) {
  const allEquipment = EQUIPMENT_OPTIONS.map((equipment) => equipment.value)

  return (
    <div className="space-y-6">
      {/* Selection count */}
      {selectedEquipment.length > 0 && (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2 }}
          className="text-center"
        >
          <span className="text-sm text-muted-foreground">
            {selectedEquipment.length} equipment type
            {selectedEquipment.length !== 1 ? 's' : ''} selected
          </span>
        </motion.div>
      )}

      {/* Equipment filters */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <EquipmentFilters
          selectedEquipment={selectedEquipment}
          onEquipmentToggle={onEquipmentToggle}
          equipment={allEquipment}
          variant="cards"
        />
      </motion.div>

      {/* Help text */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="text-center text-sm text-muted-foreground bg-card p-4 rounded-lg"
      >
        {selectedEquipment.length === 0 ? (
          <>
            Select your available equipment, or skip to see bodyweight exercises
            and all equipment options.
          </>
        ) : (
          <>
            {selectedEquipment.length} equipment type
            {selectedEquipment.length !== 1 ? 's' : ''} selected. Exercises will
            be filtered to match your selection.
          </>
        )}
      </motion.div>
    </div>
  )
}
