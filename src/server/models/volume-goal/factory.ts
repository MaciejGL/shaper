import type { VolumeGoalPeriodDTO, VolumeGoalPeriodRecord } from './types'

/**
 * Transform a VolumeGoalPeriod database record to a GraphQL-compatible DTO
 */
export function toVolumeGoalDTO(
  record: VolumeGoalPeriodRecord,
): VolumeGoalPeriodDTO {
  return {
    id: record.id,
    focusPreset: record.focusPreset,
    commitment: record.commitment,
    startedAt: record.startedAt.toISOString(),
    endedAt: record.endedAt?.toISOString() ?? null,
  }
}

/**
 * Transform multiple VolumeGoalPeriod records to DTOs
 */
export function toVolumeGoalDTOList(
  records: VolumeGoalPeriodRecord[],
): VolumeGoalPeriodDTO[] {
  return records.map(toVolumeGoalDTO)
}
