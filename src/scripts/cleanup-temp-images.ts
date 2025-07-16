#!/usr/bin/env node
/**
 * Standalone script for cleaning up temp folder images
 * Can be run manually or scheduled as a cron job
 *
 * Usage:
 *   npx tsx src/scripts/cleanup-temp-images.ts [options]
 *
 * Options:
 *   --dry-run              Preview what would be deleted without actually deleting
 *   --max-age <hours>      Delete files older than this many hours (default: 24)
 *   --include-orphaned     Also clean up orphaned exercise images
 *   --help                 Show this help message
 */
import {
  getCleanupRecommendations,
  performScheduledCleanup,
} from '@/lib/scheduled-cleanup'

interface ScriptOptions {
  dryRun: boolean
  maxAgeHours: number
  includeOrphanedExercises: boolean
  showHelp: boolean
}

function parseArgs(): ScriptOptions {
  const args = process.argv.slice(2)
  const options: ScriptOptions = {
    dryRun: false,
    maxAgeHours: 24,
    includeOrphanedExercises: false,
    showHelp: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]

    switch (arg) {
      case '--dry-run':
        options.dryRun = true
        break
      case '--max-age':
        const ageValue = parseInt(args[i + 1], 10)
        if (isNaN(ageValue) || ageValue < 1 || ageValue > 168) {
          console.error(
            'Error: --max-age must be a number between 1 and 168 (hours)',
          )
          process.exit(1)
        }
        options.maxAgeHours = ageValue
        i++ // Skip next argument as it's the value
        break
      case '--include-orphaned':
        options.includeOrphanedExercises = true
        break
      case '--help':
      case '-h':
        options.showHelp = true
        break
      default:
        console.error(`Error: Unknown argument "${arg}"`)
        console.error('Use --help for usage information')
        process.exit(1)
    }
  }

  return options
}

function showHelp() {
  console.info(`
Temp Images Cleanup Script

Usage:
  npx tsx src/scripts/cleanup-temp-images.ts [options]

Options:
  --dry-run              Preview what would be deleted without actually deleting
  --max-age <hours>      Delete files older than this many hours (default: 24)
  --include-orphaned     Also clean up orphaned exercise images
  --help, -h             Show this help message

Examples:
  # Preview cleanup of files older than 24 hours (default)
  npx tsx src/scripts/cleanup-temp-images.ts --dry-run

  # Delete files older than 48 hours
  npx tsx src/scripts/cleanup-temp-images.ts --max-age 48

  # Delete temp files and orphaned exercise images older than 1 week
  npx tsx src/scripts/cleanup-temp-images.ts --max-age 168 --include-orphaned

  # Preview comprehensive cleanup
  npx tsx src/scripts/cleanup-temp-images.ts --dry-run --max-age 48 --include-orphaned

Environment Variables Required:
  AWS_ACCESS_KEY_ID      AWS access key ID
  AWS_SECRET_ACCESS_KEY  AWS secret access key
  AWS_REGION             AWS region (default: eu-north-1)
  AWS_S3_BUCKET_NAME     S3 bucket name
  DATABASE_URL           Database connection string (for orphaned cleanup)
`)
}

function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`
}

async function main() {
  const options = parseArgs()

  if (options.showHelp) {
    showHelp()
    return
  }

  console.info('🧹 Temp Images Cleanup Script')
  console.info('================================')
  console.info(`Mode: ${options.dryRun ? 'DRY RUN (preview only)' : 'EXECUTE'}`)
  console.info(`Max age: ${options.maxAgeHours} hours`)
  console.info(
    `Include orphaned: ${options.includeOrphanedExercises ? 'YES' : 'NO'}`,
  )
  console.info('')

  try {
    // Check environment variables
    const requiredEnvVars = [
      'AWS_ACCESS_KEY_ID',
      'AWS_SECRET_ACCESS_KEY',
      'AWS_S3_BUCKET_NAME',
    ]
    const missingVars = requiredEnvVars.filter(
      (varName) => !process.env[varName],
    )

    if (missingVars.length > 0) {
      console.error('❌ Error: Missing required environment variables:')
      missingVars.forEach((varName) => console.error(`   ${varName}`))
      console.error('\nPlease set these environment variables and try again.')
      process.exit(1)
    }

    if (options.includeOrphanedExercises && !process.env.DATABASE_URL) {
      console.error('❌ Error: DATABASE_URL is required for orphaned cleanup')
      process.exit(1)
    }

    // Get current state
    console.info('📊 Getting current storage state...')
    const recommendations = await getCleanupRecommendations()

    console.info(`Current state:`)
    console.info(`  Total temp files: ${recommendations.totalFiles}`)
    console.info(`  Total size: ${formatBytes(recommendations.totalSize)}`)
    console.info(`  Files older than 24h: ${recommendations.canClean24h}`)
    console.info(`  Files older than 1 week: ${recommendations.canCleanWeek}`)
    console.info(
      `  Oldest file: ${recommendations.oldestFileAgeHours.toFixed(1)} hours`,
    )
    console.info(`  Recommendation: ${recommendations.recommendedAction}`)
    console.info('')

    // Perform cleanup
    console.info('🚀 Starting cleanup...')
    const report = await performScheduledCleanup({
      maxAgeHours: options.maxAgeHours,
      dryRun: options.dryRun,
      includeOrphanedExercises: options.includeOrphanedExercises,
    })

    console.info('📋 Cleanup Report')
    console.info('=================')
    console.info(`Timestamp: ${report.timestamp}`)
    console.info(`Mode: ${report.dryRun ? 'DRY RUN' : 'EXECUTED'}`)
    console.info('')

    console.info('Temp Folder Cleanup:')
    console.info(`  Files found: ${report.tempFolderCleanup.filesFound}`)
    console.info(
      `  Files ${report.dryRun ? 'would be deleted' : 'deleted'}: ${report.tempFolderCleanup.filesDeleted}`,
    )
    console.info(
      `  Bytes ${report.dryRun ? 'would be freed' : 'freed'}: ${formatBytes(report.tempFolderCleanup.bytesDeleted)}`,
    )
    if (report.tempFolderCleanup.oldestFileAge) {
      console.info(
        `  Oldest file age: ${report.tempFolderCleanup.oldestFileAge}`,
      )
    }

    if (report.orphanedExerciseCleanup) {
      console.info('')
      console.info('Orphaned Exercise Cleanup:')
      console.info(
        `  Files found: ${report.orphanedExerciseCleanup.filesFound}`,
      )
      console.info(
        `  Files ${report.dryRun ? 'would be deleted' : 'deleted'}: ${report.orphanedExerciseCleanup.filesDeleted}`,
      )
      console.info(
        `  Bytes ${report.dryRun ? 'would be freed' : 'freed'}: ${formatBytes(report.orphanedExerciseCleanup.bytesDeleted)}`,
      )
    }

    if (report.errors.length > 0) {
      console.info('')
      console.info('❌ Errors:')
      report.errors.forEach((error) => console.info(`  ${error}`))
    }

    console.info('')
    const totalDeleted =
      report.tempFolderCleanup.filesDeleted +
      (report.orphanedExerciseCleanup?.filesDeleted || 0)
    const totalBytes =
      report.tempFolderCleanup.bytesDeleted +
      (report.orphanedExerciseCleanup?.bytesDeleted || 0)

    if (options.dryRun) {
      console.info(
        `✅ Dry run completed: would delete ${totalDeleted} files (${formatBytes(totalBytes)})`,
      )
      console.info(`💡 Run without --dry-run to actually perform the cleanup`)
    } else {
      console.info(
        `✅ Cleanup completed: deleted ${totalDeleted} files (${formatBytes(totalBytes)})`,
      )
    }
  } catch (error) {
    console.error(
      '❌ Error during cleanup:',
      error instanceof Error ? error.message : error,
    )
    process.exit(1)
  }
}

// Run the script
if (require.main === module) {
  main().catch((error) => {
    console.error('❌ Unexpected error:', error)
    process.exit(1)
  })
}

export { main as runCleanupScript }
