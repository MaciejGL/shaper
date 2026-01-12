import { NextRequest, NextResponse } from 'next/server'

import { adminAccessDeniedResponse, requireAdminUser } from '@/lib/admin-auth'

type ResendEmailDetails = {
  id: string
  to: string[]
  from: string
  subject: string
  html?: string | null
  text?: string | null
  cc?: string[] | null
  bcc?: string[] | null
  reply_to?: string[] | null
}

type ResendRetrieveEmailResponse = {
  object: 'email'
  id: string
  to: string[]
  from: string
  subject: string
  html?: string | null
  text?: string | null
  cc?: string[] | null
  bcc?: string[] | null
  reply_to?: string[] | null
}

type ResendSendEmailResponse = {
  id: string
}

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
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

  const { id } = await params
  if (!id) {
    return NextResponse.json({ error: 'Missing email id' }, { status: 400 })
  }

  try {
    // 1) Retrieve original email
    const retrieveResponse = await fetch(
      `https://api.resend.com/emails/${id}`,
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
      },
    )

    const retrieveJson = (await retrieveResponse.json().catch(() => null)) as
      | ResendRetrieveEmailResponse
      | { error?: unknown }
      | null

    if (!retrieveResponse.ok) {
      return NextResponse.json(
        {
          error:
            retrieveJson && 'error' in retrieveJson
              ? retrieveJson.error
              : 'Resend retrieve email error',
        },
        { status: retrieveResponse.status },
      )
    }

    if (
      !retrieveJson ||
      !('to' in retrieveJson) ||
      !Array.isArray(retrieveJson.to) ||
      !retrieveJson.from ||
      !retrieveJson.subject
    ) {
      return NextResponse.json(
        { error: 'Unexpected response from Resend (retrieve)' },
        { status: 502 },
      )
    }

    const original: ResendEmailDetails = {
      id: retrieveJson.id,
      to: retrieveJson.to,
      from: retrieveJson.from,
      subject: retrieveJson.subject,
      html: retrieveJson.html ?? null,
      text: retrieveJson.text ?? null,
      cc: retrieveJson.cc ?? null,
      bcc: retrieveJson.bcc ?? null,
      reply_to: retrieveJson.reply_to ?? null,
    }

    // 2) Send again
    const sendPayload: Record<string, unknown> = {
      from: original.from,
      to: original.to,
      subject: original.subject,
    }

    if (original.html) sendPayload.html = original.html
    if (original.text) sendPayload.text = original.text
    if (original.cc?.length) sendPayload.cc = original.cc
    if (original.bcc?.length) sendPayload.bcc = original.bcc
    if (original.reply_to?.length) sendPayload.reply_to = original.reply_to

    const sendResponse = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(sendPayload),
    })

    const sendJson = (await sendResponse.json().catch(() => null)) as {
      data?: ResendSendEmailResponse
      error?: unknown
    } | null

    if (!sendResponse.ok) {
      return NextResponse.json(
        { error: sendJson?.error ?? 'Resend send email error' },
        { status: sendResponse.status },
      )
    }

    const resentId = sendJson?.data?.id ?? null

    return NextResponse.json({
      success: true,
      resentId,
    })
  } catch (error) {
    console.error('Failed to resend email:', error)
    return NextResponse.json(
      { error: 'Failed to resend email' },
      { status: 500 },
    )
  }
}
