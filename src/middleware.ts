import { NextRequest, NextResponse } from 'next/server'

import { fitspaceWorkoutMiddleware } from './middleware/fitspace-workout'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only handle /fitspace/workout without trainingId
  if (pathname === '/fitspace/workout') {
    return await fitspaceWorkoutMiddleware(request)
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/fitspace/workout'],
  runtime: 'nodejs',
}
