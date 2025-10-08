# AI Workout Training - Quick Start

## ✅ What's Been Built

Your interactive AI training tool is ready! Here's what you have:

### 1. Admin Interface

- **Location**: `http://localhost:3000/admin/ai-training`
- **Features**:
  - Generate workouts with current AI
  - Review and edit exercises
  - Approve and save training examples
  - Export to JSONL for OpenAI
  - Track progress (0/50)

### 2. Storage System

- Saves training examples to: `src/lib/ai-training/training-data.json`
- Automatically converts to OpenAI format
- Exports as downloadable JSONL file

### 3. Fine-Tuning Scripts

- `src/scripts/fine-tune-workout-model.ts` - Upload and start training
- `src/scripts/check-fine-tune-status.ts` - Check training progress
- Handles OpenAI API calls automatically

### 4. Integration Code

- `src/server/models/training-exercise/generate-ai-workout-finetuned.ts`
- Drop-in replacement for current Assistant API
- Ready to use once you have a fine-tuned model

## 🚀 What You Need to Do

### Step 1: Start the Server

```bash
npm run dev
```

### Step 2: Create Training Examples

1. Go to: `http://localhost:3000/admin/ai-training`
2. Use the form to set workout parameters
3. Click "Generate Workout"
4. Review and edit the workout
5. Click "Approve & Save" when it's perfect
6. Repeat 50 times (aim for diversity - see guide)

**Goal: 50 approved examples**

### Step 3: Export Training Data

1. Click "Export JSONL" button
2. Save the downloaded file

### Step 4: Fine-Tune in OpenAI

**Option A: Use the script** (easier)

```bash
npx tsx src/scripts/fine-tune-workout-model.ts ./workout-training-[timestamp].jsonl
```

**Option B: Manual** (if you prefer)

1. Go to: https://platform.openai.com/finetune
2. Upload the JSONL file
3. Select `gpt-4o-mini-2024-07-18`
4. Start training

### Step 5: Get the Model ID

After training completes (~20-60 minutes):

**Using script:**

```bash
npx tsx src/scripts/check-fine-tune-status.ts ftjob-abc123
```

**Or from dashboard:**

- Copy the fine-tuned model ID (e.g., `ft:gpt-4o-mini:org:suffix:abc123`)

### Step 6: Deploy

1. Add to `.env`:

   ```
   OPENAI_FINETUNED_WORKOUT_MODEL_ID=ft:gpt-4o-mini:...
   ```

2. Update `src/server/models/training-exercise/factory.ts`:

   ```typescript
   // Add at the top
   import { generateAiWorkoutFineTuned } from './generate-ai-workout-finetuned'

   // Replace the export
   export { generateAiWorkoutFineTuned as generateAiWorkout }
   ```

3. Restart server and test!

## 📊 Quality Guidelines

**Good Training Example:**

- ✅ Exercises match muscle groups requested
- ✅ Compound movements before isolation
- ✅ Rep ranges match training focus
- ✅ RPE values are realistic
- ✅ Equipment availability respected
- ✅ Professional explanations

**Bad Training Example:**

- ❌ Random exercise order
- ❌ Wrong muscle groups
- ❌ Wide rep ranges (e.g., 3-15)
- ❌ Equipment doesn't match selection
- ❌ Generic or missing explanations

## 💡 Tips

1. **Diversity matters**: Create examples for all scenarios (full-body, single muscle, different equipment)
2. **Quality over quantity**: 50 perfect examples > 100 mediocre ones
3. **Be the trainer**: Edit the AI output to match how a professional trainer would program
4. **Test iteratively**: You can fine-tune multiple times to improve
5. **Use notes**: Add notes to remember why you made specific edits

## 📁 Key Files

```
src/
  lib/ai-training/
    types.ts                      # Type definitions
    storage.ts                    # Save/load/export logic
    training-data.json            # Your training examples (will grow)

  app/(protected)/admin/ai-training/
    page.tsx                      # Main admin UI
    components/                   # UI components
    hooks/                        # Stats fetching

  app/api/admin/ai-training/
    save/route.ts                 # Save examples API
    export/route.ts               # Export JSONL API
    stats/route.ts                # Progress stats API

  server/models/training-exercise/
    generate-ai-workout-finetuned.ts  # New fine-tuned version

  scripts/
    fine-tune-workout-model.ts    # Upload & start training
    check-fine-tune-status.ts     # Check progress
```

## 🎯 Expected Results

**Before Fine-Tuning:**

- Occasional wrong muscle group selections
- Sometimes poor exercise order
- Inconsistent rep ranges
- Generic explanations

**After Fine-Tuning:**

- 95%+ accurate muscle group targeting
- Always proper compound → isolation order
- Consistent, appropriate rep ranges
- Professional trainer-quality explanations
- Faster response times
- Lower costs

## ❓ Common Questions

**Q: How many examples do I really need?**
A: Minimum 50, ideal 100+. More = better quality.

**Q: Can I fine-tune multiple times?**
A: Yes! Each iteration improves. Start with 50, see results, add more examples for weak areas.

**Q: How much does this cost?**
A: ~$3-5 to train with 50 examples on gpt-4o-mini. Usage is ~$0.01 per workout.

**Q: What if the fine-tuned model isn't better?**
A: Review your training examples. Make sure they're diverse and high-quality. Add more examples.

**Q: Can I revert to the old system?**
A: Yes! Keep the old `generateAiWorkout` function, just export the fine-tuned one with a different name.

## 📖 Full Documentation

See: `AI-WORKOUT-TRAINING-GUIDE.md` for detailed instructions, tips, and troubleshooting.

---

**Ready to start? Go to: http://localhost:3000/admin/ai-training**
