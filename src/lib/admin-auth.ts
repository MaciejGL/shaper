import { getCurrentUser } from '@/lib/getUser'

/**
 * Check if the current user has admin access
 * Admin access is granted only to the user with NEXT_PUBLIC_TEST_TRAINER_EMAIL
 */
export async function isAdminUser(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

    if (!user || !adminEmail) {
      return false
    }

    // Check if user email matches the admin email and user is a trainer
    return user.user.email === adminEmail
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
  const adminEmail = process.env.NEXT_PUBLIC_ADMIN_EMAIL

  if (!user) {
    throw new Error('Authentication required')
  }

  if (!adminEmail || user.user.email !== adminEmail) {
    throw new Error(
      'Admin access required - only authorized admin user can access this resource',
    )
  }

  return user
}

/**
 * Check if the current user has moderator access to exercises
 * Moderator access is granted to users with emails in MODERATOR_EMAILS env var
 */
export async function isModeratorUser(): Promise<boolean> {
  try {
    const user = await getCurrentUser()
    const moderatorEmails = process.env.MODERATOR_EMAILS

    if (!user || !moderatorEmails) {
      return false
    }

    // Parse comma-separated list of moderator emails
    const emailList = moderatorEmails
      .split(',')
      .map((email) => email.trim().toLowerCase())

    // Check if user email is in the moderator list and user is a trainer
    return (
      emailList.includes(user.user.email.toLowerCase()) &&
      user.user.role === 'TRAINER'
    )
  } catch (error) {
    console.error('Error checking moderator access:', error)
    return false
  }
}

/**
 * Get current user and verify moderator access, throwing error if not moderator
 */
export async function requireModeratorUser() {
  const user = await getCurrentUser()
  const moderatorEmails = process.env.MODERATOR_EMAILS

  if (!user) {
    throw new Error('Authentication required')
  }

  if (!moderatorEmails) {
    throw new Error('Moderator configuration not found')
  }

  const emailList = moderatorEmails
    .split(',')
    .map((email) => email.trim().toLowerCase())

  if (
    !emailList.includes(user.user.email.toLowerCase()) ||
    user.user.role !== 'TRAINER'
  ) {
    throw new Error(
      'Moderator access required - only authorized moderators can access this resource',
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

/**
 * Moderator access error response for API routes
 */
export function moderatorAccessDeniedResponse() {
  return new Response(JSON.stringify({ error: 'Moderator access required' }), {
    status: 403,
    headers: { 'Content-Type': 'application/json' },
  })
}
