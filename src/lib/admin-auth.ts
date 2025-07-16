import { getCurrentUser } from '@/lib/getUser'

/**
 * Check if the current user has admin access
 * Admin access is granted only to the user with NEXT_PUBLIC_TEST_TRAINER_EMAIL
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    const adminEmail = process.env.NEXT_PUBLIC_TEST_TRAINER_EMAIL

    if (!user || !adminEmail) {
      return false
    }

    // Check if user email matches the admin email and user is a trainer
    return user.user.email === adminEmail && user.user.role === 'TRAINER'
  } catch (error) {
    console.error('Error checking admin access:', error)
    return false
  }
}

/**
 * Get current user and verify admin access, throwing error if not admin
 */
export async function requireAdminUser() {
  const user = await getCurrentUser()
  const adminEmail = process.env.NEXT_PUBLIC_TEST_TRAINER_EMAIL

  if (!user) {
    throw new Error('Authentication required')
  }

  if (
    !adminEmail ||
    user.user.email !== adminEmail ||
    user.user.role !== 'TRAINER'
  ) {
    throw new Error(
      'Admin access required - only authorized admin user can access this resource',
    )
  }

  return user
}

/**
 * Admin access error response for API routes
 */
export function adminAccessDeniedResponse() {
  return new Response(
    JSON.stringify({
      error:
        'Admin access required - only authorized admin user can access this resource',
    }),
    { status: 403, headers: { 'Content-Type': 'application/json' } },
  )
}
