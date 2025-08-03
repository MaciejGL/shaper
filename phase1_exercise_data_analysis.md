# Phase 1: Exercise Data Source Analysis & Mapping Strategy

## Data Source Evaluation Results

### 1. Exercemus/Exercises Database (Primary Recommendation)

**Source:** https://github.com/exercemus/exercises
**License:** MIT License (very permissive)
**Data Quality:** High - curated from multiple sources (wger.de, exercises.json)

#### Dataset Overview:

- **Total Exercises:** 872 exercises
- **Direct JSON Access:** https://raw.githubusercontent.com/exercemus/exercises/main/exercises.json
- **Size:** ~992KB
- **Data Quality:** Well-structured, comprehensive

#### Schema Structure:

```json
{
  "categories": ["strength", "stretching", "plyometrics", "strongman", "cardio", "olympic weightlifting", "crossfit", "calisthenics"],
  "equipment": ["none", "ez curl bar", "barbell", "dumbbell", "gym mat", "exercise ball", "medicine ball", "pull-up bar", "bench", "incline bench", "kettlebell", "machine", "cable", "bands", "foam roll", "other"],
  "muscles": ["forearms", "abductors", "adductors", "middle back", "neck", "biceps", "shoulders", "serratus anterior", "chest", "triceps", "abs", "calves", "glutes", "traps", "quads", "hamstrings", "lats", "brachialis", "obliques", "soleus", "lower back"],
  "muscle_groups": {
    "arms": ["forearms", "biceps", "triceps", "brachialis"],
    "back": ["neck", "traps", "lats", "lower back", "middle back"],
    "calves": ["calves", "soleus"],
    "chest": ["chest", "serratus anterior"],
    "core": ["abs", "obliques"],
    "legs": ["abductors", "adductors", "quads", "hamstrings", "glutes"],
    "shoulders": ["shoulders"]
  },
  "exercises": [...] // 872 exercises
}
```

#### Each Exercise Contains:

- `name`: Exercise name
- `category`: From categories above
- `description`: Text description
- `instructions`: Array of step-by-step instructions
- `tips`: Optional tips array
- `equipment`: Array of required equipment
- `primary_muscles`: Primary muscle targets
- `secondary_muscles`: Secondary muscle targets
- `tempo`: Optional tempo notation (e.g., "3-1-1-0")
- `images`: Optional image URLs
- `video`: Optional YouTube video URL
- `variations_on`: Array of exercises this is a variation of
- `license_author`: Attribution
- `license`: License information

### 2. Wger API Database (Secondary Option)

**Source:** https://wger.de/api/v2/
**License:** AGPL v3 (more restrictive - requires open source)
**Data Quality:** High - community-maintained

#### API Overview:

- **Total Exercises:** 697 exercises (from REST API)
- **Access:** REST API endpoints
- **Rate Limits:** Unknown, requires investigation
- **Data Quality:** Well-structured but more complex

#### Key API Endpoints:

- `/api/v2/exercise/` - Exercise list
- `/api/v2/muscle/` - Muscle list (15 muscles)
- `/api/v2/equipment/` - Equipment list
- `/api/v2/exercisecategory/` - Categories (8 categories)

#### Muscle Categories:

- Abs, Arms, Back, Calves, Cardio, Chest, Legs, Shoulders

### 3. ExerciseDB API (Commercial Option)

**Source:** https://exercisedb.dev/
**License:** AGPL v3 for V1, Commercial for V2
**Data Quality:** Very High - 5,000+ exercises with media

#### Dataset Features:

- **V2:** 5,000+ exercises with videos/images
- **Rich Data:** Instructions, tips, variations, keywords
- **Media:** High-quality images and videos
- **API:** RESTful with rate limits

## Data Source Comparison

| Criteria                   | Exercemus     | Wger API                 | ExerciseDB                    |
| -------------------------- | ------------- | ------------------------ | ----------------------------- |
| **License**                | MIT (✅ Best) | AGPL v3 (⚠️ Restrictive) | AGPL v3/Commercial (⚠️ Mixed) |
| **Exercise Count**         | 872           | 697                      | 5,000+                        |
| **Data Quality**           | High          | High                     | Very High                     |
| **Access Method**          | Direct JSON   | REST API                 | REST API                      |
| **Cost**                   | Free          | Free                     | Free/Paid                     |
| **Media Support**          | URLs only     | Limited                  | Extensive                     |
| **Maintenance**            | Community     | Active                   | Commercial                    |
| **Integration Complexity** | Low           | Medium                   | Medium                        |

## Recommended Approach: Exercemus as Primary Source

**Rationale:**

1. **Licensing:** MIT license is most permissive for commercial use
2. **Data Quality:** Well-curated from multiple sources
3. **Accessibility:** Direct JSON download, no API rate limits
4. **Completeness:** 872 exercises with comprehensive data
5. **Maintenance:** Community-driven, regularly updated

## Data Mapping Strategy

### Current Shaper Schema vs Exercemus Data

#### Your Current BaseExercise Model:

```sql
model BaseExercise {
  id                     String
  name                   String
  description            String?
  videoUrl               String?
  equipment              String?
  createdById            String?
  isPublic               Boolean @default(false)
  additionalInstructions String?
  type                   String?
  muscleGroups           MuscleGroup[] @relation("ExerciseMuscleGroups")
  images                 Image[] @relation("ExerciseImages")
}
```

#### Your Current Equipment Enum:

```
BARBELL, DUMBBELL, MACHINE, CABLE, BODYWEIGHT, BAND, KETTLEBELL, SMITH_MACHINE, OTHER
```

#### Your Current Muscle Groups:

```
Chest: [Pectoralis Major, Pectoralis Minor]
Back: [Latissimus Dorsi, Trapezius, Rhomboids, Erector Spinae]
Arms: [Biceps Brachii, Triceps Brachii, Brachialis, Forearms]
Legs: [Quadriceps, Hamstrings, Gluteus Maximus, Adductors, Calves, Shin]
Shoulders: [Deltoid Anterior, Deltoid Lateral, Deltoid Posterior]
Core: [Rectus Abdominis, Obliques, Transverse Abdominis]
Neck: [Anterior, Posterior]
```

### Equipment Mapping Strategy

| Exercemus Equipment | Your Equipment Enum | Action Required      |
| ------------------- | ------------------- | -------------------- |
| "barbell"           | BARBELL             | ✅ Direct match      |
| "dumbbell"          | DUMBBELL            | ✅ Direct match      |
| "machine"           | MACHINE             | ✅ Direct match      |
| "cable"             | CABLE               | ✅ Direct match      |
| "none"              | BODYWEIGHT          | ✅ Map to BODYWEIGHT |
| "bands"             | BAND                | ✅ Direct match      |
| "kettlebell"        | KETTLEBELL          | ✅ Direct match      |
| "ez curl bar"       | BARBELL             | ✅ Map to BARBELL    |
| "pull-up bar"       | BODYWEIGHT          | ✅ Map to BODYWEIGHT |
| "bench"             | OTHER               | ✅ Map to OTHER      |
| "incline bench"     | OTHER               | ✅ Map to OTHER      |
| "gym mat"           | BODYWEIGHT          | ✅ Map to BODYWEIGHT |
| "exercise ball"     | OTHER               | ✅ Map to OTHER      |
| "medicine ball"     | OTHER               | ✅ Map to OTHER      |
| "foam roll"         | OTHER               | ✅ Map to OTHER      |
| "other"             | OTHER               | ✅ Direct match      |

### Muscle Group Mapping Strategy

| Exercemus Muscle    | Your Muscle Group                  | Mapping Logic                 |
| ------------------- | ---------------------------------- | ----------------------------- |
| "chest"             | Pectoralis Major                   | Direct match                  |
| "abs"               | Rectus Abdominis                   | Direct match                  |
| "obliques"          | Obliques                           | Direct match                  |
| "biceps"            | Biceps Brachii                     | Direct match                  |
| "triceps"           | Triceps Brachii                    | Direct match                  |
| "forearms"          | Forearms                           | Direct match                  |
| "brachialis"        | Brachialis                         | Direct match                  |
| "shoulders"         | Deltoid Anterior/Lateral/Posterior | Map to all deltoids           |
| "quads"             | Quadriceps                         | Direct match                  |
| "hamstrings"        | Hamstrings                         | Direct match                  |
| "glutes"            | Gluteus Maximus                    | Direct match                  |
| "calves"            | Calves                             | Direct match                  |
| "lats"              | Latissimus Dorsi                   | Direct match                  |
| "traps"             | Trapezius                          | Direct match                  |
| "middle back"       | Rhomboids                          | Map to Rhomboids              |
| "lower back"        | Erector Spinae                     | Direct match                  |
| "neck"              | Anterior/Posterior                 | Map to both                   |
| "adductors"         | Adductors                          | Direct match                  |
| "abductors"         | **MISSING**                        | ❌ Need to add to schema      |
| "serratus anterior" | **MISSING**                        | ❌ Need to add to schema      |
| "soleus"            | **MISSING**                        | ❌ Consider mapping to Calves |

### Schema Enhancement Recommendations

#### 1. Add Missing Muscle Groups

```sql
-- Add these to your muscle groups seed:
{ name: 'Abductors', alias: 'Hip Abductors', groupSlug: 'legs' }
{ name: 'Serratus Anterior', alias: 'Serratus', groupSlug: 'chest' }
```

#### 2. Add Difficulty Field

```sql
-- Add to BaseExercise model:
difficulty String? // "beginner", "intermediate", "advanced"
```

#### 3. Add Source Metadata

```sql
-- Add to BaseExercise model:
dataSource String? // "exercemus", "manual", etc.
sourceId String? // Original ID from source
importedAt DateTime?
```

#### 4. Enhanced Instructions Storage

```sql
-- Modify BaseExercise model:
instructions String? // JSON array of step-by-step instructions
tips String? // JSON array of tips
```

### Difficulty Classification Strategy

Since exercemus doesn't include difficulty, we'll classify based on:

1. **Equipment Complexity:**
   - Bodyweight exercises → Beginner
   - Barbell/Dumbbell → Intermediate
   - Advanced equipment → Advanced

2. **Movement Patterns:**
   - Basic movements (push-ups, squats) → Beginner
   - Compound movements → Intermediate
   - Olympic lifts, complex movements → Advanced

3. **Exercise Categories:**
   - "strength" → Mixed (analyze further)
   - "stretching" → Beginner
   - "olympic weightlifting" → Advanced
   - "strongman" → Advanced
   - "plyometrics" → Intermediate/Advanced

## Next Steps for Phase 2

1. **Schema Migration:** Add missing muscle groups and new fields
2. **Import Script:** Create TypeScript script to process exercemus data
3. **Data Validation:** Implement validation rules for imported exercises
4. **Duplicate Detection:** Check against existing exercises
5. **Quality Control:** Manual review process for high-impact exercises

## Licensing Compliance

- ✅ MIT License from exercemus allows commercial use
- ✅ Attribution required: Display author and license info
- ✅ No restrictions on modification or redistribution
- ✅ Perfect for your commercial fitness application

---

**Phase 1 Status: COMPLETED ✅**
**Recommendation: Proceed with exercemus as primary data source**
