import { exec } from 'child_process'
import { NextResponse } from 'next/server'
import { promisify } from 'util'

import { requireAdminUser } from '@/lib/admin-auth'

import { updateImportStatus } from '../usda-import-status/route'

const execAsync = promisify(exec)

export async function POST() {
  try {
    // Verify admin access
    await requireAdminUser()

    // Update status to parsing
    updateImportStatus({
      isDownloading: false,
      isParsing: true,
      isImporting: false,
      progress: 10,
      currentStep: 'Parsing USDA CSV files...',
      logs: ['🔍 Starting USDA data parsing...'],
    })

    // Run parsing script in background
    runParsingProcess()

    return NextResponse.json({ message: 'Parsing process started' })
  } catch (error) {
    console.error('Error starting parsing:', error)
    updateImportStatus({
      isParsing: false,
      currentStep: '❌ Parsing failed',
      logs: [`❌ Parsing error: ${error}`],
    })
    return NextResponse.json(
      { error: 'Failed to start parsing process' },
      { status: 500 },
    )
  }
}

async function runParsingProcess() {
  try {
    updateImportStatus({
      progress: 30,
      logs: ['🔍 Processing Foundation Foods data...'],
    })

    await execAsync('cd src/scripts && npx tsx parse-usda-data.ts')

    updateImportStatus({
      isParsing: false,
      progress: 100,
      currentStep: '✅ Parsing completed',
      logs: ['✅ USDA data parsed successfully!'],
    })

    // Reset status after 10 seconds
    setTimeout(() => {
      updateImportStatus({
        progress: 0,
        currentStep: '',
        logs: [],
      })
    }, 10000)
  } catch (error) {
    console.error('Parsing process failed:', error)
    updateImportStatus({
      isParsing: false,
      currentStep: '❌ Parsing failed',
      logs: [`❌ Parsing error: ${error}`],
    })
  }
}
