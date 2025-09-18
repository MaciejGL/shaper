'use client'

import { useSearchParams } from 'next/navigation'

export const ErrorContent = () => {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')

  // Show specific messages for common errors
  const getErrorMessage = (errorCode: string | null) => {
    switch (errorCode) {
      case 'AccessDenied':
        return 'You cancelled the sign-in process. No worries - you can try again anytime.'
      case 'OAuthAccountNotLinked':
        return 'There was an issue linking your account. Please try signing in again.'
      case 'Configuration':
        return "There's a configuration issue. Please contact support if this persists."
      case 'OAuthCallback':
      case 'OAuthSignin':
        return 'There was an issue with the sign-in process. Please try again.'
      default:
        return 'An unexpected error occurred during sign-in.'
    }
  }

  if (error) {
    return (
      <div className="p-4 rounded-lg bg-amber-500/10 border border-amber-500/20">
        <p className="text-amber-400 text-sm">{getErrorMessage(error)}</p>
      </div>
    )
  }

  return null
}
