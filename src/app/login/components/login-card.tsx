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
import { Separator } from '@/components/ui/separator'

import { AppleLoginButton } from './apple-login-button'
import { EmailForm } from './email-form'
import { GoogleLoginButton } from './google-login-button'
import { LoginAuthOverlay } from './login-auth-overlay'
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
    <Card className="dark flex flex-col gap-8 w-full max-w-md relative">
      <LoginAuthOverlay />
      <CardHeader className="space-y-1">
        <CardTitle>Login</CardTitle>
        {showOtp ? (
          <CardDescription>
            Enter the 4-digit code sent to your email to login.
          </CardDescription>
        ) : null}
      </CardHeader>
      <CardContent>
        {!showOtp && (
          <>
            {/* OAuth Login Buttons - Equal prominence as required by Apple */}
            <div className="mb-6 space-y-3">
              <GoogleLoginButton
                className="w-full"
                disabled={isLoading || isResending}
              />
              <AppleLoginButton
                className="w-full"
                disabled={isLoading || isResending}
              />
            </div>

            {/* Divider with "or" text */}
            <div className="relative mb-6">
              <Separator />
              <div className="absolute inset-0 -top-2.5 flex justify-center">
                <span className="bg-card px-2 text-sm text-muted-foreground">
                  or continue with email
                </span>
              </div>
            </div>
          </>
        )}

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
