# Exercemus Exercise Import Guide

## Overview

This guide helps you import 872+ exercises from the Exercemus database into your Shaper fitness application as **Version 2 exercises**.

## What's Been Implemented

### ✅ Database Schema Updates

- Added `version` field (1 = manual, 2 = imported)
- Added `dataSource`, `sourceId`, `importedAt` for tracking
- Added `difficulty` field (beginner/intermediate/advanced)
- Added `instructions` and `tips` fields (JSON arrays)
- Added missing muscle groups: **Serratus Anterior**, **Abductors**

### ✅ Import Script Features

- **Smart Equipment Mapping**: Maps 16 equipment types to your existing enums
- **Comprehensive Muscle Mapping**: Maps 21 muscle types to your muscle groups
- **Automatic Difficulty Classification**: Based on category and equipment complexity
- **Duplicate Detection**: Skips exercises that already exist
- **Batch Processing**: Processes in batches of 10 to avoid overwhelming database
- **Progress Tracking**: Real-time progress with detailed statistics
- **Error Handling**: Graceful handling of mapping failures

## How to Run the Import

### Option 1: Direct Script Execution

```bash
# From your project root
npx ts-node src/scripts/import-exercemus-exercises.ts
```

### Option 2: Add NPM Script (Recommended)

Add to your `package.json`:

```json
{
  "scripts": {
    "import-exercises": "ts-node src/scripts/import-exercemus-exercises.ts"
  }
}
```

Then run:

```bash
npm run import-exercises
```

## What to Expect

### Import Process

1. **Downloads** latest data from GitHub (992KB JSON file)
2. **Validates** data structure using Zod schemas
3. **Maps** equipment and muscles to your existing schema
4. **Classifies** difficulty automatically
5. **Processes** in batches with progress updates
6. **Reports** final statistics

### Sample Output

```
🚀 Starting Exercemus Exercise Import (V2)
📡 Downloading exercise data...
📊 Found 872 exercises to process
📋 Categories: strength, stretching, plyometrics, strongman, cardio, olympic weightlifting, crossfit, calisthenics
🏋️  Equipment types: 16
💪 Muscle types: 21

🔄 Processing batch 1/88 (0%)
✅ Imported: 3/4 Sit-Up (beginner, BODYWEIGHT)
✅ Imported: 90/90 Hamstring (beginner, BODYWEIGHT)
⏭️  Skipping duplicate: Bench Press

🎉 Import Complete!
📈 Statistics:
   Total exercises: 872
   Successfully imported: 785
   Skipped (duplicates): 87
   Failed: 0
   Success rate: 90%
```

## Equipment Mapping

| Exercemus Equipment | Your System   | Notes                   |
| ------------------- | ------------- | ----------------------- |
| "barbell"           | BARBELL       | Direct match            |
| "ez curl bar"       | EZ_BAR        | **New equipment added** |
| "dumbbell"          | DUMBBELL      | Direct match            |
| "machine"           | MACHINE       | Direct match            |
| "cable"             | CABLE         | Direct match            |
| "none"              | BODYWEIGHT    | Bodyweight exercises    |
| "bands"             | BAND          | Direct match            |
| "kettlebell"        | KETTLEBELL    | Direct match            |
| "pull-up bar"       | PULL_UP_BAR   | **New equipment added** |
| "bench"             | BENCH         | **New equipment added** |
| "incline bench"     | INCLINE_BENCH | **New equipment added** |
| "gym mat"           | MAT           | **New equipment added** |
| "exercise ball"     | EXERCISE_BALL | **New equipment added** |
| "medicine ball"     | MEDICINE_BALL | **New equipment added** |
| "foam roll"         | FOAM_ROLLER   | **New equipment added** |
| "other"             | OTHER         | Catch-all category      |

## Muscle Group Mapping

| Exercemus           | Your System       | Notes                   |
| ------------------- | ----------------- | ----------------------- |
| "chest"             | Pectoralis Major  | Direct match            |
| "shoulders"         | All 3 deltoids    | Maps to front/side/rear |
| "abs"               | Rectus Abdominis  | Direct match            |
| "serratus anterior" | Serratus Anterior | **New muscle added**    |
| "abductors"         | Abductors         | **New muscle added**    |

## Difficulty Classification Logic

- **Beginner**: Stretching, bodyweight-only exercises
- **Intermediate**: Strength exercises with barbells/machines, plyometrics
- **Advanced**: Olympic weightlifting, strongman exercises

## Post-Import Verification

### Check Import Results

```sql
-- Count V2 exercises
SELECT COUNT(*) FROM "BaseExercise" WHERE version = 2;

-- Check by data source
SELECT "dataSource", COUNT(*) FROM "BaseExercise"
WHERE version = 2 GROUP BY "dataSource";

-- Check difficulty distribution
SELECT difficulty, COUNT(*) FROM "BaseExercise"
WHERE version = 2 GROUP BY difficulty;
```

### GraphQL Query Example

```graphql
query GetV2Exercises {
  publicExercises {
    name
    version
    dataSource
    difficulty
    instructions
    tips
    muscleGroups {
      name
      alias
    }
  }
}
```

## Troubleshooting

### Common Issues

1. **TypeScript Errors**: Run `npx prisma generate` if you see type errors
2. **Database Connection**: Ensure your `.env` file has correct `DATABASE_URL`
3. **Network Issues**: Script will retry failed downloads automatically
4. **Memory Issues**: Large imports are processed in small batches

### Rollback V2 Exercises (if needed)

```sql
-- Remove all V2 exercises (BE CAREFUL!)
DELETE FROM "BaseExercise" WHERE version = 2;
```

## Next Steps After Import

1. **Test GraphQL Queries**: Verify new fields work in your API
2. **Update UI Components**: Display difficulty, instructions, tips
3. **Add Filtering**: Filter by version, difficulty, data source
4. **Attribution**: Display exercise attribution per MIT license requirements

---

**Ready to import?** Just run the script and you'll have 872+ professionally curated exercises in your database! 🚀
