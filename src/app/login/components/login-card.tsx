'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Card } from '@/components/ui/card'

import { EmailForm } from './email-form'
import { OtpForm } from './otp-form'
import { useLoginForm } from './use-login-form.hook'

export const LoginCard = () => {
  const {
    email,
    otp,
    isLoading,
    isResending,
    showOtp,
    errorMessage,
    leftTime,
    handleEmailChange,
    handleOtpChange,
    handleSendOtp,
    handleLogin,
    handleBack,
    handleResendOtp,
  } = useLoginForm()

  return (
    <Card borderless className="dark flex flex-col gap-8 w-full max-w-md">
      <CardHeader className="space-y-1">
        <CardTitle>Login</CardTitle>
        <CardDescription>
          {!showOtp
            ? 'Enter your email to receive a one-time password to login.'
            : 'Enter the 4-digit code sent to your email to login.'}
        </CardDescription>
      </CardHeader>
      <CardContent>
        {!showOtp ? (
          <EmailForm
            email={email}
            isLoading={isLoading || isResending}
            onEmailChange={handleEmailChange}
            onSubmit={handleSendOtp}
          />
        ) : (
          <OtpForm
            otp={otp}
            onOtpChange={handleOtpChange}
            handleLogin={handleLogin}
          />
        )}
        <AnimatePresence>
          {errorMessage && (
            <motion.p
              key={errorMessage}
              initial={{ opacity: 0, y: 10, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              className="text-amber-500 mt-2 text-sm text-center"
            >
              {errorMessage}
            </motion.p>
          )}
        </AnimatePresence>
      </CardContent>
      {showOtp && (
        <CardFooter>
          <div className="flex flex-col gap-2 w-full">
            <Button
              variant="default"
              loading={isLoading}
              onClick={handleLogin}
              disabled={otp.length !== 4}
            >
              Login
            </Button>
            {!leftTime ? (
              <Button
                variant="link"
                loading={isResending}
                onClick={handleResendOtp}
              >
                Resend code to your email
              </Button>
            ) : (
              <p className="text-sm text-center text-muted-foreground">
                You can resend code in {leftTime} seconds
              </p>
            )}
            <Button variant="ghost" size="sm" onClick={handleBack}>
              <ChevronLeft className="size-4" />
              Back to email
            </Button>
          </div>
        </CardFooter>
      )}
    </Card>
  )
}
