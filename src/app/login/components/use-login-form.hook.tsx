import { signIn } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'

import { emailValidation } from '@/utils/validation'

export const useLoginForm = () => {
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')
  const [isLoading, setIsLoading] = useState(false)
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
    let interval: NodeJS.Timeout
    if (leftTime > 0) {
      interval = setTimeout(() => setLeftTime(leftTime - 1), 1000)
    }
    return () => clearInterval(interval)
  }, [leftTime])

  const handleSendOtp = async () => {
    if (!emailValidation(email)) return

    setIsLoading(true)
    setOtp('')
    try {
      await fetch('/api/auth/request-otp', {
        method: 'POST',
        body: JSON.stringify({ email }),
        headers: { 'Content-Type': 'application/json' },
      })
      setLeftTime(30)
      setShowOtp(true)
    } catch (error) {
      setErrorMessage('Failed to send OTP')
      console.error(error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleLogin = useCallback(async () => {
    try {
      const result = await signIn('otp', {
        email,
        otp,
        redirect: false,
        callbackUrl: '/fitspace/dashboard',
      })

      if (result?.error) {
        setErrorMessage('Invalid OTP. Please try again.')
        setOtp('')
      } else if (result?.url) {
        localStorage.setItem('last-email', email)
        window.location.href = result.url
      }
    } catch (error) {
      setErrorMessage('Something went wrong. Please try again.')
      setOtp('')
      console.error(error)
      localStorage.removeItem('last-email')
    } finally {
      setIsLoading(false)
    }
  }, [email, otp])

  // Automatic login when OTP is entered
  useEffect(() => {
    if (otp.length === 4) {
      setIsLoading(true)
      handleLogin()
    }
  }, [otp, handleLogin])

  return {
    email,
    otp,
    isLoading,
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
    },
    handleResendOtp: handleSendOtp,
  }
}
