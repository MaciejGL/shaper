import { signIn } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'

import { emailValidation } from '@/utils/validation'

export const useLoginForm = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isResending, setIsResending] = useState(false)
  const [showOtp, setShowOtp] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [leftTime, setLeftTime] = useState(30)

  useEffect(() => {
    // get key from local storage
    const lastEmail = localStorage.getItem('last-email')
    if (lastEmail) {
      setEmail(lastEmail.toLowerCase())
    }
  }, [])

  // Timer for resend OTP
  useEffect(() => {
    let interval: NodeJS.Timeout | number | null
    if (leftTime > 0) {
      interval = setTimeout(() => setLeftTime(leftTime - 1), 1000)
    }
    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [leftTime])

  const handleSendOtp = async () => {
    if (!emailValidation(email)) {
      setErrorMessage('Please enter a valid email address.')
      return
    }

    setIsResending(true)
    setErrorMessage('') // Clear any previous errors
    setOtp('') // Clear any previous OTP

    try {
      const response = await fetch('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      })

      if (!response.ok) {
        throw new Error(`Failed to send OTP: ${response.status}`)
      }

      setLeftTime(30)
      setShowOtp(true) // Only switch to OTP view on success
    } catch (error) {
      setErrorMessage('Failed to send code. Please try again.')
      console.error(error)
      // Stay in email view if sending fails
    } finally {
      setIsResending(false)
    }
  }

  const handleLogin = useCallback(async () => {
    if (!otp || otp.length !== 4) {
      setErrorMessage('Please enter a valid 4-digit code.')
      return
    }

    setIsLoading(true)
    setErrorMessage('') // Clear any previous errors

    try {
      const result = await signIn('otp', {
        email,
        otp,
        redirect: false,
        callbackUrl: `${window.location.origin}/fitspace/workout`,
      })

      if (result?.error) {
        setErrorMessage('Invalid OTP. Please try again.')
        setOtp('') // Clear OTP but stay in OTP view
        // Don't switch back to email view on error
      } else if (result?.url) {
        localStorage.setItem('last-email', email)
        window.location.href = result.url
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.')
      setOtp('') // Clear OTP but stay in OTP view
      console.error(error)
      // Don't remove email from localStorage or switch views on network error
    } finally {
      setIsLoading(false)
    }
  }, [email, otp])

  // Automatic login when OTP is entered (debounced to prevent multiple calls)
  useEffect(() => {
    if (otp.length === 4 && !isLoading && showOtp) {
      // Small delay to prevent rapid-fire submissions
      const timer = setTimeout(() => {
        handleLogin()
      }, 100)

      return () => clearTimeout(timer)
    }
  }, [otp, handleLogin, isLoading, showOtp])

  return {
    email,
    otp,
    isLoading,
    isResending,
    showOtp,
    errorMessage,
    leftTime,
    handleEmailChange: (e: React.ChangeEvent<HTMLInputElement>) =>
      setEmail(e.target.value.toLowerCase()),
    handleOtpChange: (value: string) => setOtp(value),
    handleSendOtp,
    handleLogin,
    handleBack: () => {
      setShowOtp(false)
      setOtp('')
      setErrorMessage('') // Clear any error messages
      setIsLoading(false) // Reset loading state
      setLeftTime(30) // Reset timer
    },
    handleResendOtp: handleSendOtp,
  }
}
