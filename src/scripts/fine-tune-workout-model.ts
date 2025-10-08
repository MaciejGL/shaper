/* eslint-disable no-console */
/**
 * Script to upload training data and initiate fine-tuning
 * Run this after you've created and exported your training examples
 *
 * Usage:
 *   npx tsx src/scripts/fine-tune-workout-model.ts path/to/training.jsonl
 */
import { createReadStream } from 'fs'
import { existsSync } from 'fs'

import { openai } from '@/lib/open-ai/open-ai'

async function fineTuneWorkoutModel(trainingFilePath: string) {
  if (!existsSync(trainingFilePath)) {
    console.error(`❌ Training file not found: ${trainingFilePath}`)
    process.exit(1)
  }

  console.log('🚀 Starting fine-tuning process...\n')

  try {
    // Step 1: Upload the training file
    console.log('📤 Uploading training file...')
    const file = await openai.files.create({
      file: createReadStream(trainingFilePath),
      purpose: 'fine-tune',
    })

    console.log(`✅ File uploaded: ${file.id}\n`)

    // Step 2: Create fine-tuning job
    console.log('🎯 Creating fine-tuning job...')
    console.log('   Base model: gpt-4o-mini-2024-07-18')
    console.log('   Training file:', file.id)

    const fineTuneJob = await openai.fineTuning.jobs.create({
      training_file: file.id,
      model: 'gpt-4o-mini-2024-07-18',
      hyperparameters: {
        n_epochs: 3, // You can adjust this (1-50)
      },
      suffix: 'hypertro-workout', // Model name suffix
    })

    console.log(`✅ Fine-tuning job created: ${fineTuneJob.id}\n`)

    console.log('📊 Job Status:')
    console.log(`   ID: ${fineTuneJob.id}`)
    console.log(`   Status: ${fineTuneJob.status}`)
    console.log(`   Model: ${fineTuneJob.model}`)
    console.log('')

    console.log('⏳ Fine-tuning is now in progress...')
    console.log(
      '   This typically takes 20-60 minutes depending on dataset size.',
    )
    console.log('')

    console.log('📝 Next Steps:')
    console.log(
      '   1. Monitor progress at: https://platform.openai.com/finetune',
    )
    console.log(
      `   2. Or run: npx tsx src/scripts/check-fine-tune-status.ts ${fineTuneJob.id}`,
    )
    console.log(
      '   3. When complete, copy the fine-tuned model ID to your .env file:',
    )
    console.log('      OPENAI_FINETUNED_WORKOUT_MODEL_ID=ft:gpt-4o-mini-...')
    console.log('')

    console.log('✨ Fine-tuning initiated successfully!')

    return fineTuneJob
  } catch (error) {
    console.error('❌ Error during fine-tuning:', error)
    throw error
  }
}

// Run the script
const trainingFile = process.argv[2]

if (!trainingFile) {
  console.error(
    'Usage: npx tsx src/scripts/fine-tune-workout-model.ts <path-to-training.jsonl>',
  )
  console.error('')
  console.error('Example:')
  console.error(
    '  npx tsx src/scripts/fine-tune-workout-model.ts ./workout-training-123456.jsonl',
  )
  process.exit(1)
}

fineTuneWorkoutModel(trainingFile)
  .then(() => {
    console.log('\n✅ Done!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message)
    process.exit(1)
  })
