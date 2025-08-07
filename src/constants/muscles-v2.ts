/**
 * Muscles V2 - Simplified Static Definition
 *
 * Benefits:
 * - Flat structure - no complex nesting
 * - Matches your app's actual usage (individual muscles)
 * - Fast lookup by ID or group
 * - Easy to filter for UI components
 * - Can replace database queries in resolvers
 */

export interface Muscle {
  id: string
  name: string
  alias: string
  group: string // simplified grouping for UI
  groupSlug: string
  isPrimary?: boolean
  description: string
  isEssential: boolean // for filtering UI complexity
}

export const MUSCLES_V2: Muscle[] = [
  // CHEST (3 muscles)
  {
    id: 'cmb6zr9kx0002uhmhqmgb01cy',
    name: 'Pectoralis Major',
    alias: 'Chest',
    group: 'Chest',
    groupSlug: 'chest',
    description: 'Primary chest muscle for pushing movements',
    isEssential: true,
  },
  {
    id: 'cmb6zr9v70004uhmhhanl6im1',
    name: 'Pectoralis Minor',
    alias: 'Pec Minor',
    group: 'Chest',
    groupSlug: 'chest',
    description: 'Deep chest muscle for scapular protraction',
    isEssential: true,
  },
  {
    id: '7873d77a-4bf8-4f3d-b81b-3ece0f634831',
    name: 'Serratus Anterior',
    alias: 'Serratus',
    group: 'Chest',
    groupSlug: 'chest',
    description: "Side chest muscle, boxer's muscle",
    isEssential: true,
  },

  // UPPER BACK (3 muscles)
  {
    id: 'cmb6zra6y0007uhmhbhffb2h4',
    name: 'Latissimus Dorsi',
    alias: 'Lats',
    group: 'Upper Back',
    groupSlug: 'upper-back',
    description: 'Primary pulling muscle, creates V-shape',
    isEssential: true,
  },
  {
    id: 'cmb6zracd0009uhmhjkmlbu5b',
    name: 'Trapezius',
    alias: 'Traps',
    group: 'Upper Back',
    groupSlug: 'upper-back',
    description: 'Upper back muscle for shoulder blade movement',
    isEssential: true,
  },
  {
    id: 'cmb6zraic000buhmhbcsu9dux',
    name: 'Rhomboids',
    alias: 'Rhomboids',
    group: 'Upper Back',
    groupSlug: 'upper-back',
    description: 'Between shoulder blades, scapular retraction',
    isEssential: true,
  },

  // LOWER BACK (1 muscle)
  {
    id: 'cmb6zranq000duhmhxh7mcq2i',
    name: 'Erector Spinae',
    alias: 'Lower Back',
    group: 'Lower Back',
    groupSlug: 'lower-back',
    description: 'Spinal extension and support muscles',
    isEssential: true,
  },

  // SHOULDERS (3 muscles)
  {
    id: 'cmb6zrcud0010uhmhok7xvy58',
    name: 'Deltoid Anterior',
    alias: 'Front Delts',
    group: 'Shoulders',
    groupSlug: 'shoulders',
    description: 'Front shoulder muscle for pressing',
    isEssential: true,
  },
  {
    id: 'cmb6zrczw0012uhmhkqlsew2g',
    name: 'Deltoid Lateral',
    alias: 'Side Delts',
    group: 'Shoulders',
    groupSlug: 'shoulders',
    description: 'Side shoulder muscle for width',
    isEssential: true,
  },
  {
    id: 'cmb6zrd5l0014uhmh89wgphh8',
    name: 'Deltoid Posterior',
    alias: 'Rear Delts',
    group: 'Shoulders',
    groupSlug: 'shoulders',
    description: 'Back shoulder muscle for posture',
    isEssential: true,
  },

  // BICEPS (3 muscles)
  {
    id: 'cmb6zrb14000guhmhn1oykc26',
    name: 'Biceps Brachii',
    alias: 'Biceps',
    group: 'Biceps',
    groupSlug: 'biceps',
    description: 'Main arm flexor muscle',
    isEssential: true,
  },
  {
    id: 'cmb6zrbch000kuhmhnz10504n',
    name: 'Brachialis',
    alias: 'Brachialis',
    group: 'Biceps',
    groupSlug: 'biceps',
    description: 'Deep arm flexor, works in all grips',
    isEssential: true,
  },
  {
    id: 'a8f3d1c2-5e7b-4a9d-8c6f-1b2e3d4c5a6b',
    name: 'Brachioradialis',
    alias: 'Brachioradialis',
    group: 'Biceps',
    groupSlug: 'biceps',
    description: 'Forearm muscle for neutral grip pulling',
    isEssential: true,
  },

  // TRICEPS (1 muscle)
  {
    id: 'cmb6zrb6n000iuhmhseibwmiy',
    name: 'Triceps Brachii',
    alias: 'Triceps',
    group: 'Triceps',
    groupSlug: 'triceps',
    description: 'Primary arm extensor muscle',
    isEssential: true,
  },

  // FOREARMS (2 muscles)
  {
    id: 'cmb6zrbi8000muhmhjsghunak',
    name: 'Forearm Flexors',
    alias: 'Forearms',
    group: 'Forearms',
    groupSlug: 'forearms',
    description: 'Wrist flexors and grip strength',
    isEssential: true,
  },
  {
    id: 'b9e4f2d3-6f8c-5b0e-9d7a-2c3f4e5d6b7c',
    name: 'Forearm Extensors',
    alias: 'Forearm Extensors',
    group: 'Forearms',
    groupSlug: 'forearms',
    description: 'Wrist extensors and finger extension',
    isEssential: true,
  },

  // QUADS (1 simplified muscle)
  {
    id: 'cmb6zrbu9000puhmhryy90jiz',
    name: 'Quadriceps',
    alias: 'Quads',
    group: 'Quads',
    groupSlug: 'quads',
    description: 'Front thigh muscles (all 4 heads combined)',
    isEssential: true,
  },

  // HAMSTRINGS (1 simplified muscle)
  {
    id: 'cmb6zrc1d000ruhmhk2vqyoxz',
    name: 'Hamstrings',
    alias: 'Hams',
    group: 'Hamstrings',
    groupSlug: 'hamstrings',
    description: 'Back thigh muscles (all 3 muscles combined)',
    isEssential: true,
  },

  // GLUTES (3 muscles)
  {
    id: 'cmb6zrc71000tuhmhqkgbwcrt',
    name: 'Gluteus Maximus',
    alias: 'Glutes',
    group: 'Glutes',
    groupSlug: 'glutes',
    description: 'Primary hip extensor and largest muscle',
    isEssential: true,
  },
  {
    id: 'c0f5e3d4-7a9d-6c1f-ae8b-3d4f5a6e7c8d',
    name: 'Gluteus Medius',
    alias: 'Glute Med',
    group: 'Glutes',
    groupSlug: 'glutes',
    description: 'Side glute for hip stability',
    isEssential: true,
  },

  {
    id: 'd1a6f4e5-8b0e-7d2a-bf9c-4e5a6b7f8d9e',
    name: 'Gluteus Minimus',
    alias: 'Glute Min',
    group: 'Glutes',
    groupSlug: 'glutes',
    description: 'Deep glute for hip stabilization',
    isEssential: true,
  },

  // CALVES (2 muscles)
  {
    id: 'cmb6zrcip000xuhmh38g2arcj',
    name: 'Gastrocnemius',
    alias: 'Calves',
    group: 'Calves',
    groupSlug: 'calves',
    description: 'Main calf muscle for plantar flexion',
    isEssential: true,
  },
  {
    id: 'e2b7a5f6-9c1f-8e3b-ca0d-5f6b7c8e9f0a',
    name: 'Soleus',
    alias: 'Soleus',
    group: 'Calves',
    groupSlug: 'calves',
    description: 'Deep calf muscle, single joint',
    isEssential: true,
  },

  // CORE (3 muscles)
  {
    id: 'cmb6zrdgy0017uhmhira269ib',
    name: 'Rectus Abdominis',
    alias: 'Abs',
    group: 'Core',
    groupSlug: 'core',
    description: 'Six-pack muscle for spinal flexion',
    isEssential: true,
  },
  {
    id: 'cmb6zrdn50019uhmhr743v0jd',
    name: 'Obliques',
    alias: 'Obliques',
    group: 'Core',
    groupSlug: 'core',
    description: 'Side abs for rotation and lateral flexion',
    isEssential: true,
  },
  {
    id: 'cmb6zrdu5001buhmhwq3vjavd',
    name: 'Transverse Abdominis',
    alias: 'Deep Core',
    group: 'Core',
    groupSlug: 'core',
    description: 'Deepest core muscle for stability',
    isEssential: true,
  },

  // ADVANCED/OPTIONAL MUSCLES (4 muscles)
  {
    id: 'cmb6zrccn000vuhmhcrpcrkuo',
    name: 'Adductors',
    alias: 'Inner Thigh',
    group: 'Hip Adductors',
    groupSlug: 'hip-adductors',
    description: 'Inner thigh muscles for leg adduction',
    isEssential: false,
  },
  {
    id: '836f436f-38d6-469b-952b-34654af448e5',
    name: 'Hip Abductors',
    alias: 'Hip Abductors',
    group: 'Hip Abductors',
    groupSlug: 'hip-abductors',
    description: 'Outer hip muscles for leg abduction',
    isEssential: false,
  },
  {
    id: 'f3c8b6d7-0d2a-9f4c-db1e-6a7c8d9f0e1b',
    name: 'Neck Muscles',
    alias: 'Neck',
    group: 'Neck',
    groupSlug: 'neck',
    description: 'Neck stabilization and movement muscles',
    isEssential: false,
  },
  {
    id: 'a4d9c7e8-1e3b-0a5d-ec2f-7b8d9e0a1f2c',
    name: 'Rotator Cuff',
    alias: 'Rotator Cuff',
    group: 'Stabilizers',
    groupSlug: 'stabilizers',
    description: 'Shoulder stability muscles',
    isEssential: false,
  },
]

/**
 * Utility functions that match your app's usage patterns
 */
const getEssentialMuscles = (): Muscle[] =>
  MUSCLES_V2.filter((m) => m.isEssential)
const getAdvancedMuscles = (): Muscle[] =>
  MUSCLES_V2.filter((m) => !m.isEssential)
const getAllGroups = (): string[] => [
  ...new Set(MUSCLES_V2.map((m) => m.group)),
]
const getByIds = (ids: string[]): Muscle[] =>
  MUSCLES_V2.filter((m) => ids.includes(m.id))

export const muscles = {
  // Basic getters
  getAll: (): Muscle[] => MUSCLES_V2,
  getById: (id: string): Muscle | undefined =>
    MUSCLES_V2.find((m) => m.id === id),
  getByIds,

  // Essential vs Advanced filtering (for UI complexity)
  getEssential: getEssentialMuscles,
  getAdvanced: getAdvancedMuscles,

  // Group-based queries (matches your resolver patterns)
  getByGroup: (group: string): Muscle[] =>
    MUSCLES_V2.filter((m) => m.group === group),
  getByGroupSlug: (groupSlug: string): Muscle[] =>
    MUSCLES_V2.filter((m) => m.groupSlug === groupSlug),
  getGroups: getAllGroups,
  getEssentialGroups: (): string[] => [
    ...new Set(getEssentialMuscles().map((m: Muscle) => m.group)),
  ],

  // Exercise-specific queries (for resolver replacement)
  getForExerciseFilter: (muscleIds: string[]): Muscle[] => getByIds(muscleIds),
  getPrimaryMuscles: (): Muscle[] =>
    MUSCLES_V2.filter((m) => m.isPrimary !== false),

  // UI helper functions
  groupByCategory: (): Record<string, Muscle[]> => {
    return MUSCLES_V2.reduce(
      (acc, muscle) => {
        if (!acc[muscle.group]) acc[muscle.group] = []
        acc[muscle.group].push(muscle)
        return acc
      },
      {} as Record<string, Muscle[]>,
    )
  },

  // Search functionality
  search: (query: string): Muscle[] => {
    const lowercaseQuery = query.toLowerCase()
    return MUSCLES_V2.filter(
      (muscle) =>
        muscle.name.toLowerCase().includes(lowercaseQuery) ||
        muscle.alias.toLowerCase().includes(lowercaseQuery) ||
        muscle.group.toLowerCase().includes(lowercaseQuery),
    )
  },

  // Statistics
  stats: {
    total: MUSCLES_V2.length,
    essential: getEssentialMuscles().length,
    advanced: getAdvancedMuscles().length,
    groups: getAllGroups().length,
  },
} as const

// For backwards compatibility with your current GraphQL schema
export const muscleGroupCategories = muscles.groupByCategory()

// Easy migration from database IDs to static IDs
export const MUSCLE_ID_MAPPING: Record<string, string> = {
  // Add your current database muscle IDs mapping to new static IDs
  // e.g., 'db-uuid-123': 'pectoralis-major'
  // You can populate this during migration
}
