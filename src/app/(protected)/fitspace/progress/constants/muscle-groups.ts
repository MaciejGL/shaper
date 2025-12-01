// Muscle group mapping - maps individual muscle IDs to muscle groups for heatmap visualization
export const MUSCLE_GROUP_MAPPING_BY_MUSCLE_ID: Record<
  string,
  { name: string; id: string }[]
> = {
  // Front view muscle groups
  Neck: [
    { id: 'c39a156b-09eb-4b00-b306-0c2a4adfce30', name: 'Posterior' },
    { id: 'fe477e74-1bfb-4391-807e-6da86953074b', name: 'Anterior' },
  ],
  Shoulders: [
    { id: 'a4d9c7e8-1e3b-0a5d-ec2f-7b8d9e0a1f2c', name: 'Rotator Cuff' },
    { id: 'cmb6zrcud0010uhmhok7xvy58', name: 'Deltoid Anterior' },
    { id: 'cmb6zrczw0012uhmhkqlsew2g', name: 'Deltoid Lateral' },
    { id: 'cmb6zrd5l0014uhmh89wgphh8', name: 'Deltoid Posterior' },
  ],
  Chest: [
    { id: '7873d77a-4bf8-4f3d-b81b-3ece0f634831', name: 'Serratus Anterior' },
    { id: 'cmb6zr9kx0002uhmhqmgb01cy', name: 'Pectoralis Major' },
    { id: 'cmb6zr9v70004uhmhhanl6im1', name: 'Pectoralis Minor' },
  ],
  Forearms: [
    { id: 'cmb6zrbi8000muhmhjsghunak', name: 'Forearm Flexors' },
    { id: 'b9e4f2d3-6f8c-5b0e-9d7a-2c3f4e5d6b7c', name: 'Forearm Extensors' },
    { id: 'a8f3d1c2-5e7b-4a9d-8c6f-1b2e3d4c5a6b', name: 'Brachioradialis' },
  ],
  Quads: [{ id: 'cmb6zrbu9000puhmhryy90jiz', name: 'Quadriceps' }],
  Traps: [{ id: 'cmb6zracd0009uhmhjkmlbu5b', name: 'Trapezius' }],
  Biceps: [
    { id: 'cmb6zrb14000guhmhn1oykc26', name: 'Biceps Brachii' },
    { id: 'cmb6zrbch000kuhmhnz10504n', name: 'Brachialis' },
  ],
  Obliques: [{ id: 'cmb6zrdn50019uhmhr743v0jd', name: 'Obliques' }],
  Abs: [
    { id: 'cmb6zrdgy0017uhmhira269ib', name: 'Rectus Abdominis' },
    { id: 'cmb6zrdu5001buhmhwq3vjavd', name: 'Transverse Abdominis' },
  ],
  'Inner Thighs': [{ id: 'cmb6zrccn000vuhmhcrpcrkuo', name: 'Adductors' }],

  // Back view muscle groups
  'Upper Back': [{ id: 'cmb6zraic000buhmhbcsu9dux', name: 'Rhomboids' }],
  Lats: [{ id: 'cmb6zra6y0007uhmhbhffb2h4', name: 'Latissimus Dorsi' }],
  Hamstrings: [{ id: 'cmb6zrc1d000ruhmhk2vqyoxz', name: 'Hamstrings' }],
  Triceps: [{ id: 'cmb6zrb6n000iuhmhseibwmiy', name: 'Triceps Brachii' }],
  LowerBack: [{ id: 'cmb6zranq000duhmhxh7mcq2i', name: 'Erector Spinae' }],
  Glutes: [
    { id: 'cmb6zrc71000tuhmhqkgbwcrt', name: 'Gluteus Maximus' },
    { id: 'c0f5e3d4-7a9d-6c1f-ae8b-3d4f5a6e7c8d', name: 'Gluteus Medius' },
    { id: 'd1a6f4e5-8b0e-7d2a-bf9c-4e5a6b7f8d9e', name: 'Gluteus Minimus' },
    { id: '836f436f-38d6-469b-952b-34654af448e5', name: 'Hip Abductors' },
  ],
  Calves: [
    { id: 'cmb6zrcip000xuhmh38g2arcj', name: 'Gastrocnemius' },
    { id: 'e2b7a5f6-9c1f-8e3b-ca0d-5f6b7c8e9f0a', name: 'Soleus' },
  ],
}

// Map body view labels to muscle group names for heatmap visualization
// These aliases match the SVG path muscle group aliases in background.tsx files
export const LABEL_TO_GROUP_MAPPING: Record<string, string> = {
  // Neck
  neck: 'Neck',
  anterior: 'Neck',

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
  abs: 'Abs',
  obliques: 'Obliques',

  // Back
  traps: 'Traps',
  upper_back: 'Upper Back',
  rhomboids: 'Upper Back',
  lats: 'Lats',
  lower_back: 'LowerBack',
  'lower back': 'LowerBack',

  // Legs
  quads: 'Quads',
  hamstrings: 'Hamstrings',
  hams: 'Hamstrings',
  glutes: 'Glutes',
  adductors: 'Inner Thighs',
  'inner thigh': 'Inner Thighs',
  calves: 'Calves',
  shin: 'Calves',
}
