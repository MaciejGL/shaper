import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentUser } from '@/lib/getUser'

export const metadata: Metadata = {
  title: 'Privacy Policy - Hypro',
  description: 'Privacy Policy for Hypro - Personal Fitness Training App',
}

export default async function PrivacyPolicyPage() {
  const userSession = await getCurrentUser()

  const getBackUrl = () => {
    if (!userSession) {
      return '/'
    }

    if (userSession.user.role === 'TRAINER') {
      return '/trainer/settings'
    } else {
      return '/fitspace/settings'
    }
  }

  const backUrl = getBackUrl()
  const backText = userSession ? 'Back to Settings' : 'Back to Home'

  return (
    <div className="mx-auto bg-background h-screen overflow-y-auto hide-scrollbar">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between max-w-5xl">
          <Link
            href={backUrl}
            className="flex items-center space-x-2 text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span className="text-sm font-medium">{backText}</span>
          </Link>
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold">Hypro</span>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-5xl min-h-screen flex items-start justify-center">
        <div className="w-full my-8">
          <div className="bg-card rounded-lg border p-6 md:p-8 shadow-sm">
            <div className="space-y-8">
              {/* Header */}
              <div className="border-b pb-6">
                <h1 className="text-4xl font-bold mb-4 text-foreground">
                  Privacy Policy
                </h1>
                <div className="text-sm text-muted-foreground border-l-4 border-primary pl-4 bg-muted/30 p-4 rounded-r-lg">
                  <p className="mb-1">
                    <strong>Effective Date:</strong> January 2025
                  </p>
                  <p>
                    <strong>Last Updated:</strong> January 2025
                  </p>
                </div>
              </div>

              {/* Introduction */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Introduction
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  Hypro ("we," "our," or "us") is committed to protecting your
                  privacy. This Privacy Policy explains how we collect, use,
                  disclose, and safeguard your information when you use our
                  mobile application and web services (collectively, the
                  "Service").
                </p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Information We Collect
                </h2>

                <p className="text-muted-foreground text-sm mb-6">
                  We collect different types of information to provide and
                  improve our Service. Many fields are optional - providing them
                  helps us personalize your experience and enables trainers to
                  create better programs for you.
                </p>

                <div className="space-y-6">
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Account Information
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>
                        <strong className="text-foreground">
                          Required:
                        </strong>{' '}
                        Email address (for login and account verification)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Optional:
                        </strong>{' '}
                        Name, profile picture, phone number, date of birth,
                        biological sex. Providing these helps trainers know you
                        better and personalize your experience.
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Fitness & Health Data (Optional)
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      All fitness data is optional. Providing it enables better
                      training recommendations and progress tracking:
                    </p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>
                        <strong className="text-foreground">
                          Fitness Profile:
                        </strong>{' '}
                        Height, weight, fitness level, activity level, goals,
                        allergies
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Body Measurements:
                        </strong>{' '}
                        Circumference measurements, body fat percentage
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Training Data:
                        </strong>{' '}
                        Workout logs, exercises performed, sets, reps, weights
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Nutrition Data:
                        </strong>{' '}
                        Meal plans, nutritional targets, dietary preferences
                      </li>
                      <li>
                        <strong className="text-foreground">Images:</strong>{' '}
                        Avatar photos (publicly visible), progress photos
                        (private, only visible to you and your trainer)
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Technical Data (Automatic)
                    </h3>
                    <p className="text-muted-foreground text-sm mb-3">
                      Collected automatically to ensure the Service works
                      properly:
                    </p>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>
                        <strong className="text-foreground">
                          Device Information:
                        </strong>{' '}
                        Device type, operating system, app version
                      </li>
                      <li>
                        <strong className="text-foreground">Usage Data:</strong>{' '}
                        App usage patterns, feature interactions
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Authentication:
                        </strong>{' '}
                        Session tokens for keeping you logged in
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* How We Use Your Information */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  How We Use Your Information
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Primary Uses
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>
                        <strong>Service Provision:</strong> Deliver core app
                        functionality and features
                      </li>
                      <li>
                        <strong>Personalization:</strong> Customize workouts,
                        nutrition plans, and recommendations
                      </li>
                      <li>
                        <strong>Trainer Matching:</strong> Connect you with
                        suitable personal trainers
                      </li>
                      <li>
                        <strong>Progress Tracking:</strong> Monitor and display
                        your fitness journey
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Secondary Uses
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>
                        <strong>Improvement:</strong> Analyze usage to enhance
                        app features and performance
                      </li>
                      <li>
                        <strong>Support:</strong> Provide customer service and
                        technical assistance
                      </li>
                      <li>
                        <strong>Communication:</strong> Send relevant updates
                        and notifications
                      </li>
                      <li>
                        <strong>Legal Compliance:</strong> Meet legal
                        obligations and enforce our terms
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Information Sharing */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Information Sharing
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      We Share Information With
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>
                        <strong>Trainers:</strong> When you work with a trainer,
                        we share your profile, fitness data, and progress
                      </li>
                      <li>
                        <strong>Service Providers:</strong> Cloud storage,
                        analytics, email, and notification services
                      </li>
                      <li>
                        <strong>Legal Requirements:</strong> When required by
                        law or to protect rights and safety
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      We Do Not
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>Sell your personal information to third parties</li>
                      <li>Share your data with social media platforms</li>
                      <li>Provide identifying information to advertisers</li>
                      <li>Share progress photos without explicit consent</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div className="bg-muted/30 p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Data Security
                </h2>
                <p className="text-muted-foreground mb-4">
                  We implement multiple layers of security to protect your
                  personal information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Secure authentication methods</li>
                    <li>HTTPS encryption for all data transmission</li>
                    <li>Private storage for sensitive images</li>
                  </ul>
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>Role-based access controls</li>
                    <li>Automatic session management</li>
                    <li>Data minimization practices</li>
                  </ul>
                </div>
              </div>

              {/* Mobile App */}
              <div className="bg-muted/30 p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Mobile App
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Push Notifications
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>Mobile-only push notifications</li>
                      <li>Push tokens stored securely with your account</li>
                      <li>You can disable notifications in app settings</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Camera & Photos
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>Camera access for progress photos only</li>
                      <li>Progress photos are private to your account</li>
                      <li>Avatar photos are publicly visible</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Your Rights
                </h2>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-primary-foreground text-xs font-bold">
                          A
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          Access
                        </div>
                        <div className="text-sm text-muted-foreground">
                          View and download your personal data from Settings
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-primary-foreground text-xs font-bold">
                          C
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          Correction
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Update your profile information directly in the app
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-primary-foreground text-xs font-bold">
                          D
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          Deletion
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Delete your account via Settings or contact support
                        </div>
                      </div>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                        <span className="text-primary-foreground text-xs font-bold">
                          P
                        </span>
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">
                          Portability
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Export your fitness data from Settings
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Contact Information
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about this Privacy Policy or our privacy
                  practices, contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <div className="font-semibold text-foreground">
                      Privacy Questions
                    </div>
                    <Link
                      className="text-sm text-primary hover:underline"
                      href="mailto:support@hypro.app"
                    >
                      support@hypro.app
                    </Link>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <div className="font-semibold text-foreground">
                      Support Center
                    </div>
                    <Link
                      className="text-sm text-primary hover:underline"
                      href="/support"
                    >
                      hypro.app/support
                    </Link>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  This Privacy Policy is legally binding and forms part of our{' '}
                  <Link href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </Link>
                  .
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
