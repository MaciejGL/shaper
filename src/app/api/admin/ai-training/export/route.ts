import { NextResponse } from 'next/server'

import { isAdminUser } from '@/lib/admin-auth'
import { generateJSONL, loadTrainingExamples } from '@/lib/ai-training/storage'

export async function GET() {
  try {
    await isAdminUser()

    const examples = loadTrainingExamples()
    const approvedExamples = examples.filter((e) => e.approved)

    if (approvedExamples.length === 0) {
      return NextResponse.json(
        { error: 'No approved training examples found' },
        { status: 400 },
      )
    }

    const jsonl = generateJSONL(examples)

    return new NextResponse(jsonl, {
      headers: {
        'Content-Type': 'application/jsonl',
        'Content-Disposition': `attachment; filename="workout-training-${Date.now()}.jsonl"`,
      },
    })
  } catch (error) {
    console.error('Error exporting training data:', error)
    return NextResponse.json(
      { error: 'Failed to export training data' },
      { status: 500 },
    )
  }
}
