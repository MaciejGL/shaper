/**
 * Muscles - Single Source of Truth
 *
 * This file is the ONLY place muscle data should be defined.
 * All other code should import from here.
 *
 * Display Groups (15 total - matches heatmap body view):
 * Shoulders, Chest, Biceps, Triceps, Forearms, Core, Quads, Hamstrings,
 * Glutes, Calves, Traps, Upper Back, Lats, Lower Back, Inner Thighs
 */

export interface Muscle {
  id: string
  name: string
  alias: string
  displayGroup: string
}

// 16 Display Groups for Heatmap
export const DISPLAY_GROUPS = [
  'Shoulders',
  'Chest',
  'Biceps',
  'Triceps',
  'Forearms',
  'Core',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Traps',
  'Upper Back',
  'Lats',
  'Lower Back',
  'Inner Thighs',
  'Neck',
] as const

export type DisplayGroup = (typeof DISPLAY_GROUPS)[number]

export const MUSCLES: Muscle[] = [
  // CHEST (3 muscles)
  {
    id: 'cmb6zr9kx0002uhmhqmgb01cy',
    name: 'Pectoralis Major',
    alias: 'Chest',
    displayGroup: 'Chest',
  },
  {
    id: 'cmb6zr9v70004uhmhhanl6im1',
    name: 'Pectoralis Minor',
    alias: 'Pec Minor',
    displayGroup: 'Chest',
  },
  {
    id: '7873d77a-4bf8-4f3d-b81b-3ece0f634831',
    name: 'Serratus Anterior',
    alias: 'Serratus',
    displayGroup: 'Chest',
  },

  // SHOULDERS (4 muscles - includes Rotator Cuff)
  {
    id: 'cmb6zrcud0010uhmhok7xvy58',
    name: 'Deltoid Anterior',
    alias: 'Front Delts',
    displayGroup: 'Shoulders',
  },
  {
    id: 'cmb6zrczw0012uhmhkqlsew2g',
    name: 'Deltoid Lateral',
    alias: 'Side Delts',
    displayGroup: 'Shoulders',
  },
  {
    id: 'cmb6zrd5l0014uhmh89wgphh8',
    name: 'Deltoid Posterior',
    alias: 'Rear Delts',
    displayGroup: 'Shoulders',
  },
  {
    id: 'a4d9c7e8-1e3b-0a5d-ec2f-7b8d9e0a1f2c',
    name: 'Rotator Cuff',
    alias: 'Rotator Cuff',
    displayGroup: 'Shoulders',
  },

  // TRAPS (1 muscle - separate display group)
  {
    id: 'cmb6zracd0009uhmhjkmlbu5b',
    name: 'Trapezius',
    alias: 'Traps',
    displayGroup: 'Traps',
  },

  // UPPER BACK (1 muscle - Rhomboids only, Lats/Traps are separate)
  {
    id: 'cmb6zraic000buhmhbcsu9dux',
    name: 'Rhomboids',
    alias: 'Rhomboids',
    displayGroup: 'Upper Back',
  },

  // LATS (1 muscle - separate display group)
  {
    id: 'cmb6zra6y0007uhmhbhffb2h4',
    name: 'Latissimus Dorsi',
    alias: 'Lats',
    displayGroup: 'Lats',
  },

  // LOWER BACK (1 muscle)
  {
    id: 'cmb6zranq000duhmhxh7mcq2i',
    name: 'Erector Spinae',
    alias: 'Lower Back',
    displayGroup: 'Lower Back',
  },

  // BICEPS (2 muscles - Brachioradialis moved to Forearms)
  {
    id: 'cmb6zrb14000guhmhn1oykc26',
    name: 'Biceps Brachii',
    alias: 'Biceps',
    displayGroup: 'Biceps',
  },
  {
    id: 'cmb6zrbch000kuhmhnz10504n',
    name: 'Brachialis',
    alias: 'Brachialis',
    displayGroup: 'Biceps',
  },

  // TRICEPS (1 muscle)
  {
    id: 'cmb6zrb6n000iuhmhseibwmiy',
    name: 'Triceps Brachii',
    alias: 'Triceps',
    displayGroup: 'Triceps',
  },

  // FOREARMS (3 muscles - includes Brachioradialis)
  {
    id: 'cmb6zrbi8000muhmhjsghunak',
    name: 'Forearm Flexors',
    alias: 'Forearms',
    displayGroup: 'Forearms',
  },
  {
    id: 'b9e4f2d3-6f8c-5b0e-9d7a-2c3f4e5d6b7c',
    name: 'Forearm Extensors',
    alias: 'Forearm Extensors',
    displayGroup: 'Forearms',
  },
  {
    id: 'a8f3d1c2-5e7b-4a9d-8c6f-1b2e3d4c5a6b',
    name: 'Brachioradialis',
    alias: 'Brachioradialis',
    displayGroup: 'Forearms',
  },

  // QUADS (1 muscle)
  {
    id: 'cmb6zrbu9000puhmhryy90jiz',
    name: 'Quadriceps',
    alias: 'Quads',
    displayGroup: 'Quads',
  },

  // HAMSTRINGS (1 muscle)
  {
    id: 'cmb6zrc1d000ruhmhk2vqyoxz',
    name: 'Hamstrings',
    alias: 'Hams',
    displayGroup: 'Hamstrings',
  },

  // GLUTES (4 muscles - includes Hip Abductors)
  {
    id: 'cmb6zrc71000tuhmhqkgbwcrt',
    name: 'Gluteus Maximus',
    alias: 'Glutes',
    displayGroup: 'Glutes',
  },
  {
    id: 'c0f5e3d4-7a9d-6c1f-ae8b-3d4f5a6e7c8d',
    name: 'Gluteus Medius',
    alias: 'Glute Med',
    displayGroup: 'Glutes',
  },
  {
    id: 'd1a6f4e5-8b0e-7d2a-bf9c-4e5a6b7f8d9e',
    name: 'Gluteus Minimus',
    alias: 'Glute Min',
    displayGroup: 'Glutes',
  },
  {
    id: '836f436f-38d6-469b-952b-34654af448e5',
    name: 'Hip Abductors',
    alias: 'Hip Abductors',
    displayGroup: 'Glutes',
  },

  // CALVES (2 muscles)
  {
    id: 'cmb6zrcip000xuhmh38g2arcj',
    name: 'Gastrocnemius',
    alias: 'Calves',
    displayGroup: 'Calves',
  },
  {
    id: 'e2b7a5f6-9c1f-8e3b-ca0d-5f6b7c8e9f0a',
    name: 'Soleus',
    alias: 'Soleus',
    displayGroup: 'Calves',
  },

  // CORE (3 muscles)
  {
    id: 'cmb6zrdgy0017uhmhira269ib',
    name: 'Rectus Abdominis',
    alias: 'Abs',
    displayGroup: 'Core',
  },
  {
    id: 'cmb6zrdn50019uhmhr743v0jd',
    name: 'Obliques',
    alias: 'Obliques',
    displayGroup: 'Core',
  },
  {
    id: 'cmb6zrdu5001buhmhwq3vjavd',
    name: 'Transverse Abdominis',
    alias: 'Deep Core',
    displayGroup: 'Core',
  },

  // INNER THIGHS (1 muscle)
  {
    id: 'cmb6zrccn000vuhmhcrpcrkuo',
    name: 'Adductors',
    alias: 'Inner Thigh',
    displayGroup: 'Inner Thighs',
  },

  // NECK (2 muscles)
  {
    id: 'fe477e74-1bfb-4391-807e-6da86953074b',
    name: 'Neck Flexors',
    alias: 'Neck Flexors',
    displayGroup: 'Neck',
  },
  {
    id: 'c39a156b-09eb-4b00-b306-0c2a4adfce30',
    name: 'Neck Extensors',
    alias: 'Neck Extensors',
    displayGroup: 'Neck',
  },
]

// Helper functions
export const getMuscleById = (id: string): Muscle | undefined =>
  MUSCLES.find((m) => m.id === id)

export const getMusclesByIds = (ids: string[]): Muscle[] =>
  MUSCLES.filter((m) => ids.includes(m.id))

export const getMusclesByDisplayGroup = (displayGroup: string): Muscle[] =>
  MUSCLES.filter((m) => m.displayGroup === displayGroup)

export const getAllDisplayGroups = (): string[] => [...DISPLAY_GROUPS]

export const groupMusclesByDisplayGroup = (): Record<string, Muscle[]> => {
  return MUSCLES.reduce(
    (acc, muscle) => {
      if (!acc[muscle.displayGroup]) acc[muscle.displayGroup] = []
      acc[muscle.displayGroup].push(muscle)
      return acc
    },
    {} as Record<string, Muscle[]>,
  )
}

// For heatmap: maps display group name to array of muscle IDs
export const DISPLAY_GROUP_MUSCLE_IDS: Record<string, string[]> =
  DISPLAY_GROUPS.reduce(
    (acc, group) => {
      acc[group] = getMusclesByDisplayGroup(group).map((m) => m.id)
      return acc
    },
    {} as Record<string, string[]>,
  )

// For heatmap body SVG: maps SVG path aliases to display group names
export const SVG_ALIAS_TO_DISPLAY_GROUP: Record<string, string> = {
  // Shoulders
  shoulders: 'Shoulders',
  'front delts': 'Shoulders',
  'side delts': 'Shoulders',
  'rear delts': 'Shoulders',

  // Chest
  chest: 'Chest',
  'inner chest': 'Chest',

  // Arms
  biceps: 'Biceps',
  triceps: 'Triceps',
  forearms: 'Forearms',

  // Core
  abs: 'Core',
  obliques: 'Core',

  // Back
  traps: 'Traps',
  upper_back: 'Upper Back',
  rhomboids: 'Upper Back',
  lats: 'Lats',
  lower_back: 'Lower Back',
  'lower back': 'Lower Back',

  // Legs
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  hams: 'Hamstrings',
  glutes: 'Glutes',
  adductors: 'Inner Thighs',
  'inner thigh': 'Inner Thighs',
  calves: 'Calves',
  shin: 'Calves',

  // Neck
  neck: 'Neck',
}

// For weekly progress resolver: tracked display groups in order
export const TRACKED_DISPLAY_GROUPS = [
  'Chest',
  'Upper Back',
  'Lower Back',
  'Lats',
  'Shoulders',
  'Biceps',
  'Triceps',
  'Quads',
  'Hamstrings',
  'Glutes',
  'Calves',
  'Core',
  'Forearms',
  'Traps',
  'Inner Thighs',
  'Neck',
] as const

// For GraphQL: format muscles for muscleGroupCategories query response
export const getMusclesGroupedForGraphQL = (): {
  id: string
  name: string
  slug: string
  muscles: Muscle[]
}[] => {
  return DISPLAY_GROUPS.map((displayGroup) => ({
    id: displayGroup.toLowerCase().replace(/\s+/g, '-'),
    name: displayGroup as string,
    slug: displayGroup.toLowerCase().replace(/\s+/g, '-'),
    muscles: getMusclesByDisplayGroup(displayGroup),
  }))
}
