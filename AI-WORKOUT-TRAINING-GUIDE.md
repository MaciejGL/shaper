# AI Workout Fine-Tuning Guide

This guide walks you through improving your AI workout generation using OpenAI fine-tuning.

## Overview

You now have an interactive tool to:

1. Generate workouts with your current AI
2. Review and edit them to perfection
3. Save approved examples as training data
4. Export training data and fine-tune a model
5. Deploy the improved model

## Step 1: Access the Training Tool

1. Start your development server:

   ```bash
   npm run dev
   ```

2. Navigate to the admin training page:

   ```
   http://localhost:3000/admin/ai-training
   ```

3. You should see:
   - Progress tracker (0/50 examples)
   - Workout generation form
   - Space for generated workouts

## Step 2: Create Training Examples (Goal: 50 examples)

### Recommended Distribution

Create diverse examples covering different scenarios:

**Full-Body Workouts (10 examples)**

- 3-4 exercises: beginners
- 5-6 exercises: intermediate
- 7-8 exercises: advanced
- Mix of equipment options

**Push/Pull/Legs Splits (15 examples)**

- 5 push workouts (chest, shoulders, triceps)
- 5 pull workouts (back, biceps)
- 5 leg workouts (quads, hamstrings, glutes, calves)

**Single Muscle Focus (15 examples)**

- 3 chest-focused
- 3 back-focused
- 3 leg-focused
- 3 shoulder-focused
- 3 arm-focused (biceps/triceps)

**Equipment-Specific (10 examples)**

- 3 bodyweight-only
- 3 dumbbell-only
- 2 barbell-focused
- 2 machine-based

### For Each Example:

1. **Set Parameters**

   - Select muscle groups (or leave empty for full-body)
   - Select equipment (or leave empty for any)
   - Choose exercise count (3-8)
   - Set max sets per exercise (2-5)
   - Pick RPE range and training focus

2. **Generate Workout**

   - Click "Generate Workout"
   - Wait for AI to create the workout
   - Review the generated exercises

3. **Review Quality**
   Check each exercise for:

   - ✅ **Correct muscle targeting**: Does the exercise work the requested muscles?
   - ✅ **Appropriate order**: Compound movements first, isolation last?
   - ✅ **Proper rep ranges**: Match the training focus (strength/hypertrophy/endurance)?
   - ✅ **Realistic RPE**: Does the RPE make sense for this exercise?
   - ✅ **Equipment match**: Uses only the selected equipment?

4. **Edit if Needed**
   Use the Exercise Editor to:

   - Adjust sets, reps, or RPE
   - Reorder exercises (compound → isolation)
   - Remove inappropriate exercises
   - Update explanations to be more professional

5. **Improve Summary & Reasoning**

   - Make summary concise but informative
   - Ensure reasoning explains WHY these exercises were chosen
   - Use professional trainer language

6. **Save**
   - Add notes if needed (optional)
   - Click "Approve & Save" when perfect
   - Or "Save Draft" if still working on it

### Tips for Good Training Data

**Exercise Selection:**

- Prioritize compound movements for major muscle groups
- Use isolation exercises as accessories
- Match equipment availability precisely

**Exercise Order:**

- Compound → Isolation (e.g., Squat before Leg Extension)
- Larger → Smaller muscle groups (e.g., Chest before Triceps)
- Bilateral → Unilateral (e.g., Barbell before Single-arm)

**Rep Ranges:**

- Strength: 3-6 reps (heavy, fewer reps)
- Hypertrophy: 8-12 reps (moderate weight, moderate reps)
- Endurance: 15-20 reps (lighter weight, higher reps)
- Keep ranges narrow (2-4 rep difference max)

**RPE (Rate of Perceived Exertion):**

- 6-7: Moderate intensity, could do 3-4 more reps
- 7-8: Challenging, could do 2-3 more reps
- 8-10: Very hard, 0-2 reps left in tank

**Professional Language:**

- Use proper fitness terminology
- Be concise but informative
- Explain the "why" behind selections
- Focus on training benefits

## Step 3: Export Training Data

Once you have **at least 50 approved examples**:

1. Click "Export JSONL" button in the admin tool
2. A file named `workout-training-[timestamp].jsonl` will download
3. Save this file somewhere safe

## Step 4: Fine-Tune the Model

### Option A: Use the Script (Recommended)

1. Upload your training file using the provided script:

   ```bash
   npx tsx src/scripts/fine-tune-workout-model.ts ./workout-training-[timestamp].jsonl
   ```

2. The script will:

   - Upload the file to OpenAI
   - Create a fine-tuning job
   - Give you a job ID to track progress

3. Monitor progress:
   ```bash
   npx tsx src/scripts/check-fine-tune-status.ts ftjob-abc123
   ```

### Option B: Manual in OpenAI Dashboard

1. Go to: https://platform.openai.com/finetune

2. Click "Create fine-tuning job"

3. Upload your `workout-training-[timestamp].jsonl` file

4. Select settings:

   - **Base model**: `gpt-4o-mini-2024-07-18` (recommended, cost-effective)
   - **Epochs**: 3 (default is good)
   - **Suffix**: `hypertro-workout` (optional, helps identify the model)

5. Click "Start training"

6. Wait 20-60 minutes for completion

7. Copy the fine-tuned model ID (looks like: `ft:gpt-4o-mini-2024-07-18:org:hypertro-workout:abc123`)

## Step 5: Deploy the Fine-Tuned Model

1. Add the model ID to your environment variables:

   ```bash
   # .env or .env.local
   OPENAI_FINETUNED_WORKOUT_MODEL_ID=ft:gpt-4o-mini-2024-07-18:org:hypertro-workout:abc123
   ```

2. Update the workout generation code:

   Open: `src/server/models/training-exercise/factory.ts`

   Replace the `generateAiWorkout` export with:

   ```typescript
   // Old version (keep as backup)
   export const generateAiWorkoutOld = generateAiWorkout

   // New fine-tuned version
   export { generateAiWorkoutFineTuned as generateAiWorkout } from './generate-ai-workout-finetuned'
   ```

   Or directly in the resolver, change the import to use the fine-tuned version.

3. Restart your server:

   ```bash
   npm run dev
   ```

4. Test it:
   - Go to your workout generation page
   - Generate a few workouts with different parameters
   - Verify the quality improved

## Step 6: Test & Iterate

### Testing Checklist

- [ ] Generate full-body workout → exercises cover all major muscle groups
- [ ] Generate chest workout → only chest/triceps/shoulder exercises
- [ ] Generate bodyweight workout → no equipment-based exercises
- [ ] Generate strength workout → rep ranges 3-6, appropriate RPE
- [ ] Generate hypertrophy workout → rep ranges 8-12
- [ ] Verify exercise order: compound first, isolation last
- [ ] Check response time (should be faster than Assistant API)

### If Quality Isn't Good Enough

1. Review your training examples - look for patterns in mistakes
2. Add more examples targeting weak areas (e.g., more equipment-specific)
3. Re-export and fine-tune again
4. You can fine-tune multiple times - each iteration improves

## Benefits After Fine-Tuning

✅ **Better exercise selection** - Matches muscle groups more accurately
✅ **Professional workout structure** - Proper compound → isolation order
✅ **Appropriate rep ranges** - Matches training goals perfectly
✅ **Faster responses** - Direct model calls vs Assistant API
✅ **Lower costs** - Fine-tuned gpt-4o-mini cheaper than Assistant
✅ **More consistent** - Less variance in output quality

## Cost Estimates

**Fine-Tuning Costs (gpt-4o-mini):**

- Training: ~$3-5 for 50 examples
- Usage: ~$0.01 per workout generated

**Compared to Current:**

- Assistant API with vector search: ~$0.02-0.03 per workout

## Troubleshooting

**"No approved training examples found"**

- Make sure you clicked "Approve & Save" (not just "Save Draft")
- Check the progress tracker shows approved count > 0

**"AI response format invalid"**

- Your training examples might have inconsistent JSON format
- Re-check a few examples and ensure they match the expected structure

**Fine-tuning job failed**

- Check OpenAI dashboard for error details
- Usually means JSONL format is incorrect
- Verify each line is valid JSON with the correct structure

**Model not improving quality**

- Need more diverse training examples (aim for 100+ for best results)
- Ensure examples are high-quality and professional
- Add examples that specifically address the errors you're seeing

## Next Steps

1. Start creating training examples now
2. Aim for 50 minimum (100+ for best results)
3. Export and fine-tune when ready
4. Deploy and test
5. Iterate if needed

## Questions?

- Check OpenAI fine-tuning docs: https://platform.openai.com/docs/guides/fine-tuning
- Review training examples in: `src/lib/ai-training/training-data.json`
- Test exports before uploading to OpenAI

---

**Remember:** The quality of your fine-tuned model depends entirely on the quality of your training examples. Take time to make each one perfect!
