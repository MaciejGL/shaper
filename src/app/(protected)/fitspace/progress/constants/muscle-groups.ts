// Re-export muscle constants from single source of truth
export {
  DISPLAY_GROUP_MUSCLE_IDS as MUSCLE_GROUP_MAPPING_BY_MUSCLE_ID,
  SVG_ALIAS_TO_DISPLAY_GROUP as LABEL_TO_GROUP_MAPPING,
  groupMusclesByDisplayGroup,
  getMusclesByDisplayGroup,
} from '@/constants/muscles'
