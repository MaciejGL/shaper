import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { credential } = await request.json()

    if (!credential) {
      return NextResponse.json(
        { error: 'No credential provided' },
        { status: 400 },
      )
    }

    // Decode the JWT (without verification for now, just to get user info)
    const base64Url = credential.split('.')[1]
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join(''),
    )

    const decoded = JSON.parse(jsonPayload)

    if (!decoded || !decoded.email) {
      return NextResponse.json({ error: 'Invalid credential' }, { status: 400 })
    }

    // Return user info for the UI to show
    return NextResponse.json({
      success: true,
      user: {
        email: decoded.email,
        name: decoded.name,
        picture: decoded.picture,
        given_name: decoded.given_name,
        family_name: decoded.family_name,
      },
    })
  } catch (error) {
    console.error('Google One Tap error:', error)
    return NextResponse.json(
      { error: 'Failed to process credential' },
      { status: 500 },
    )
  }
}
