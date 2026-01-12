import { NextRequest, NextResponse } from 'next/server'

import { adminAccessDeniedResponse, requireAdminUser } from '@/lib/admin-auth'

type ResendEmailListItem = {
  id: string
  to: string[]
  from: string
  created_at: string
  subject: string
  bcc: string[] | null
  cc: string[] | null
  reply_to: string[] | null
  last_event: string
  scheduled_at: string | null
}

type ResendListEmailsResponse = {
  object: 'list'
  has_more: boolean
  data: ResendEmailListItem[]
}

function clampInt(value: number, { min, max }: { min: number; max: number }) {
  if (Number.isNaN(value)) return min
  return Math.max(min, Math.min(max, value))
}

export async function GET(request: NextRequest) {
  try {
    await requireAdminUser()
  } catch {
    return adminAccessDeniedResponse()
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json(
      { error: 'RESEND_API_KEY is not configured' },
      { status: 500 },
    )
  }

  const { searchParams } = request.nextUrl
  const limit = clampInt(parseInt(searchParams.get('limit') ?? '20', 10), {
    min: 1,
    max: 100,
  })
  const after = searchParams.get('after')?.trim() || undefined
  const before = searchParams.get('before')?.trim() || undefined

  // Optional server-side filters (applied after fetching a page from Resend)
  const status = searchParams.get('status')?.trim().toLowerCase() || ''
  const q = searchParams.get('q')?.trim().toLowerCase() || ''

  if (after && before) {
    return NextResponse.json(
      { error: 'Use either "after" or "before", not both.' },
      { status: 400 },
    )
  }

  const url = new URL('https://api.resend.com/emails')
  url.searchParams.set('limit', String(limit))
  if (after) url.searchParams.set('after', after)
  if (before) url.searchParams.set('before', before)

  try {
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    })

    const json = (await response.json().catch(() => null)) as
      | ResendListEmailsResponse
      | { error?: unknown }
      | null

    if (!response.ok) {
      return NextResponse.json(
        { error: json && 'error' in json ? json.error : 'Resend API error' },
        { status: response.status },
      )
    }

    if (!json || !('data' in json) || !Array.isArray(json.data)) {
      return NextResponse.json(
        { error: 'Unexpected response from Resend' },
        { status: 502 },
      )
    }

    const filtered = json.data.filter((email) => {
      if (status && status !== 'all' && email.last_event !== status) {
        return false
      }
      if (!q) return true

      const subjectMatch = email.subject?.toLowerCase().includes(q)
      const fromMatch = email.from?.toLowerCase().includes(q)
      const toMatch = email.to?.some((t) => t.toLowerCase().includes(q))

      return Boolean(subjectMatch || fromMatch || toMatch)
    })

    return NextResponse.json({
      ...json,
      data: filtered,
    })
  } catch (error) {
    console.error('Failed to list Resend emails:', error)
    return NextResponse.json(
      { error: 'Failed to list Resend emails' },
      { status: 500 },
    )
  }
}
