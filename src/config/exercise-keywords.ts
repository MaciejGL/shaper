/**
 * Semantic keyword mapping for exercise search
 * Maps common search terms to exercise-related keywords
 */

export const EXERCISE_KEYWORD_MAPPING: Record<string, string[]> = {
  // Body parts - general
  chest: ['pectoral', 'pecs', 'chest', 'breast'],
  back: [
    'lats',
    'latissimus',
    'rhomboids',
    'traps',
    'trapezius',
    'back',
    'dorsal',
  ],
  shoulders: ['deltoid', 'delts', 'shoulder', 'shoulders'],
  arms: ['biceps', 'triceps', 'forearms', 'arms', 'upper arm'],
  legs: ['quadriceps', 'hamstrings', 'glutes', 'calves', 'legs', 'lower body'],
  core: ['abs', 'abdominals', 'core', 'stomach', 'obliques'],

  // Body parts - specific
  biceps: ['bicep', 'biceps', 'bi', 'front arm'],
  triceps: ['tricep', 'triceps', 'tri', 'back arm'],
  quadriceps: ['quads', 'quadriceps', 'front thigh'],
  hamstrings: ['hams', 'hamstrings', 'back thigh'],
  glutes: ['glutes', 'butt', 'glute', 'buttocks'],
  calves: ['calves', 'calf', 'lower leg'],

  // Exercise types
  push: ['push', 'press', 'pressing', 'pushup', 'push-up', 'push up'],
  pull: ['pull', 'pulling', 'pullup', 'pull-up', 'pull up', 'row'],
  squat: ['squat', 'squats', 'squatting'],
  deadlift: ['deadlift', 'dead lift', 'deadlifts'],
  bench: ['bench', 'bench press', 'benching'],
  curl: ['curl', 'curls', 'curling'],

  // Exercise categories
  cardio: ['cardio', 'cardiovascular', 'aerobic', 'endurance'],
  strength: ['strength', 'resistance', 'weights', 'lifting'],
  flexibility: ['flexibility', 'stretching', 'mobility', 'yoga'],

  // Equipment variations
  dumbbell: ['dumbbell', 'db', 'dumbell', 'dumb bell'],
  barbell: ['barbell', 'bb', 'bar', 'olympic bar'],
  cable: ['cable', 'cables', 'pulley'],
  machine: ['machine', 'machines', 'apparatus'],
  bodyweight: ['bodyweight', 'body weight', 'bw', 'no equipment'],

  // Movement patterns
  isolation: ['isolation', 'single joint', 'targeted'],
  compound: ['compound', 'multi joint', 'functional'],
  unilateral: ['unilateral', 'single arm', 'single leg', 'one arm', 'one leg'],
  bilateral: ['bilateral', 'both arms', 'both legs', 'two arm', 'two leg'],

  // Difficulty/Experience
  beginner: ['beginner', 'easy', 'basic', 'starter', 'novice'],
  intermediate: ['intermediate', 'medium', 'moderate'],
  advanced: ['advanced', 'hard', 'difficult', 'expert'],

  // Body regions
  'upper body': ['upper body', 'upper', 'arms', 'chest', 'back', 'shoulders'],
  'lower body': [
    'lower body',
    'lower',
    'legs',
    'glutes',
    'quadriceps',
    'hamstrings',
  ],

  // Common exercise name variations
  'bench press': ['bench press', 'bench', 'press', 'chest press'],
  'pull up': ['pull up', 'pullup', 'pull-up', 'chin up', 'chinup'],
  'push up': ['push up', 'pushup', 'push-up', 'press up'],
  'lat pulldown': [
    'lat pulldown',
    'pulldown',
    'lat pull',
    'latissimus pulldown',
  ],
  'shoulder press': ['shoulder press', 'overhead press', 'military press'],

  // Common abbreviations
  ohp: ['ohp', 'overhead press', 'shoulder press', 'military press'],
  rdl: ['rdl', 'romanian deadlift', 'romanian dead lift', 'stiff leg deadlift'],
  sldl: ['sldl', 'stiff leg deadlift', 'straight leg deadlift'],

  // Fly variations
  fly: ['fly', 'flye', 'flies', 'flyes', 'chest fly', 'pec fly'],

  // Lateral raise variations
  'lateral raise': [
    'lateral raise',
    'lat raise',
    'side raise',
    'side lateral',
    'shoulder lateral',
  ],

  // Row variations
  row: ['row', 'rows', 'rowing', 'bent over row', 'cable row', 'seated row'],
}

/**
 * Expands a search term using keyword mapping
 */
export function expandSearchTerm(term: string): string[] {
  const normalizedTerm = term.toLowerCase().trim()

  // Check for exact matches first
  if (EXERCISE_KEYWORD_MAPPING[normalizedTerm]) {
    return EXERCISE_KEYWORD_MAPPING[normalizedTerm]
  }

  // Check for partial matches
  const expandedTerms: string[] = [normalizedTerm]

  Object.entries(EXERCISE_KEYWORD_MAPPING).forEach(([, synonyms]) => {
    if (
      synonyms.some(
        (synonym) =>
          synonym.includes(normalizedTerm) || normalizedTerm.includes(synonym),
      )
    ) {
      expandedTerms.push(...synonyms)
    }
  })

  return [...new Set(expandedTerms)] // Remove duplicates
}

/**
 * Common equipment name variations
 */
export const EQUIPMENT_SYNONYMS: Record<string, string[]> = {
  BARBELL: ['barbell', 'bb', 'bar', 'olympic bar', 'straight bar'],
  DUMBBELL: ['dumbbell', 'db', 'dumbell', 'dumb bell', 'hand weights'],
  CABLE: ['cable', 'cables', 'pulley', 'cable machine'],
  MACHINE: ['machine', 'machines', 'apparatus', 'equipment'],
  BODYWEIGHT: [
    'bodyweight',
    'body weight',
    'bw',
    'no equipment',
    'calisthenics',
  ],
  KETTLEBELL: ['kettlebell', 'kb', 'kettle bell', 'bell'],
  BAND: ['band', 'bands', 'resistance band', 'elastic band'],
}
