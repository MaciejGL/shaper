/* eslint-disable no-console */
/**
 * Check the status of a fine-tuning job
 *
 * Usage:
 *   npx tsx src/scripts/check-fine-tune-status.ts <job-id>
 */
import { openai } from '@/lib/open-ai/open-ai'

async function checkFineTuneStatus(jobId: string) {
  try {
    console.log(`🔍 Checking status for job: ${jobId}\n`)

    const job = await openai.fineTuning.jobs.retrieve(jobId)

    console.log('📊 Job Details:')
    console.log(`   ID: ${job.id}`)
    console.log(`   Status: ${job.status}`)
    console.log(`   Model: ${job.model}`)
    console.log(
      `   Created: ${new Date(job.created_at * 1000).toLocaleString()}`,
    )

    if (job.finished_at) {
      console.log(
        `   Finished: ${new Date(job.finished_at * 1000).toLocaleString()}`,
      )
    }

    if (job.fine_tuned_model) {
      console.log(`   Fine-tuned Model ID: ${job.fine_tuned_model}`)
    }

    console.log('')

    if (job.status === 'succeeded' && job.fine_tuned_model) {
      console.log('✅ Fine-tuning completed successfully!')
      console.log('')
      console.log('📝 Next Steps:')
      console.log('   1. Add this to your .env file:')
      console.log(
        `      OPENAI_FINETUNED_WORKOUT_MODEL_ID=${job.fine_tuned_model}`,
      )
      console.log('   2. Deploy the updated environment variable')
      console.log('   3. Test the fine-tuned model in your app')
    } else if (job.status === 'failed') {
      console.log('❌ Fine-tuning failed')
      if (job.error) {
        console.log(`   Error: ${JSON.stringify(job.error, null, 2)}`)
      }
    } else if (job.status === 'running') {
      console.log('⏳ Fine-tuning is still in progress...')
      console.log('   Check again in a few minutes')
    } else {
      console.log(`   Current status: ${job.status}`)
    }

    return job
  } catch (error) {
    console.error('❌ Error checking status:', error)
    throw error
  }
}

// Run the script
const jobId = process.argv[2]

if (!jobId) {
  console.error('Usage: npx tsx src/scripts/check-fine-tune-status.ts <job-id>')
  console.error('')
  console.error('Example:')
  console.error('  npx tsx src/scripts/check-fine-tune-status.ts ftjob-abc123')
  process.exit(1)
}

checkFineTuneStatus(jobId)
  .then(() => {
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Failed:', error.message)
    process.exit(1)
  })
