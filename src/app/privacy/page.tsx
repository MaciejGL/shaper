import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentUser } from '@/lib/getUser'

export const metadata: Metadata = {
  title: 'Privacy Policy - Hypertro',
  description: 'Privacy Policy for Hypertro - Personal Fitness Training App',
}

export default async function PrivacyPolicyPage() {
  const userSession = await getCurrentUser()

  // Determine back URL based on user authentication and role
  const getBackUrl = () => {
    if (!userSession) {
      return '/' // Landing page for non-authenticated users
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
    <div className="mx-auto bg-background h-screen overflow-y-auto">
      {/* Navigation Header */}
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
            <span className="text-lg font-bold">Hypertro</span>
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
                  Privacy Policy for Hypertro
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

              {/* Early Stage Disclaimer */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <h2 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100 flex items-center">
                  🚧 Early Stage Product Notice
                </h2>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Important:</strong> Hypertro is currently in early
                  development. Features, functionality, and data handling
                  practices may change as we continue to develop and improve the
                  platform. We will notify users of any significant changes to
                  this Privacy Policy and provide appropriate migration paths
                  for your data if needed.
                </p>
              </div>

              {/* Introduction */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Introduction
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground mb-6">
                  Hypertro ("we," "our," or "us") is committed to protecting
                  your privacy. This Privacy Policy explains how we collect,
                  use, disclose, and safeguard your information when you use our
                  mobile application and web services (collectively, the
                  "Service").
                </p>
              </div>

              {/* Information We Collect */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Information We Collect
                </h2>

                <div className="space-y-6">
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Information You Provide
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">
                          Account Information:
                        </strong>{' '}
                        Name, email address, password, profile picture
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Profile Data:
                        </strong>{' '}
                        Age, gender, height, weight, fitness goals, experience
                        level
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Fitness Data:
                        </strong>{' '}
                        Workout logs, exercise history, progress measurements,
                        photos
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Nutrition Data:
                        </strong>{' '}
                        Meal logs, dietary preferences, nutritional information
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Communication Data:
                        </strong>{' '}
                        Messages with trainers, support requests, feedback
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Information Automatically Collected
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">Usage Data:</strong>{' '}
                        App interactions, feature usage, session duration
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Device Information:
                        </strong>{' '}
                        Device type, operating system, app version, device
                        identifiers
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Location Data:
                        </strong>{' '}
                        General location (city/region) for trainer matching
                        (with permission)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Performance Data:
                        </strong>{' '}
                        App crashes, errors, performance metrics
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Information from Third Parties
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">
                          Social Media:
                        </strong>{' '}
                        Profile information if you connect social media accounts
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Payment Processors:
                        </strong>{' '}
                        Transaction information for premium features
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Analytics Services:
                        </strong>{' '}
                        Aggregated usage statistics and performance data
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
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h3 className="text-lg font-semibold mb-3 text-blue-900 dark:text-blue-100">
                      Primary Uses
                    </h3>
                    <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
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
                      <li>
                        <strong>Communication:</strong> Enable messaging between
                        users and trainers
                      </li>
                    </ul>
                  </div>

                  <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-semibold mb-3 text-green-900 dark:text-green-100">
                      Secondary Uses
                    </h3>
                    <ul className="space-y-2 text-green-800 dark:text-green-200 text-sm">
                      <li>
                        <strong>Improvement:</strong> Analyze usage to enhance
                        app features and performance
                      </li>
                      <li>
                        <strong>Support:</strong> Provide customer service and
                        technical assistance
                      </li>
                      <li>
                        <strong>Marketing:</strong> Send relevant updates, tips,
                        and promotional content (with consent)
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
                  Information Sharing and Disclosure
                </h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-lg border border-amber-200 dark:border-amber-800">
                    <h3 className="text-lg font-semibold mb-3 text-amber-900 dark:text-amber-100">
                      We Share Information With:
                    </h3>
                    <ul className="space-y-2 text-amber-800 dark:text-amber-200 text-sm">
                      <li>
                        <strong>Trainers:</strong> Your profile and fitness data
                        with trainers you choose to work with
                      </li>
                      <li>
                        <strong>Service Providers:</strong> Third-party services
                        that help us operate the app
                      </li>
                      <li>
                        <strong>Analytics Partners:</strong> Aggregated,
                        non-identifying data for app improvement
                      </li>
                      <li>
                        <strong>Legal Requirements:</strong> When required by
                        law or to protect our rights
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-100">
                      We DO NOT:
                    </h3>
                    <ul className="space-y-2 text-red-800 dark:text-red-200 text-sm">
                      <li>Sell your personal information to third parties</li>
                      <li>
                        Share identifying information without your consent
                      </li>
                      <li>Use your data for unrelated commercial purposes</li>
                      <li>Retain data longer than necessary</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Data Security */}
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-950/30 dark:to-blue-950/30 p-6 rounded-lg border">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Data Security
                </h2>
                <p className="text-muted-foreground mb-4">
                  We implement industry-standard security measures to protect
                  your information:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">Encryption:</strong>{' '}
                      <span className="text-muted-foreground">
                        Data encrypted in transit and at rest
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">
                        Access Controls:
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        Limited access to authorized personnel only
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">
                        Regular Audits:
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        Security assessments and vulnerability testing
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">
                        Secure Infrastructure:
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        SOC 2 compliant hosting and data centers
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Your Rights */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Your Rights and Choices
                </h2>
                <div className="space-y-6">
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Account Control
                    </h3>
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
                            View and download your personal data
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
                            Update inaccurate or incomplete information
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
                            Request removal of your account and data
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
                            Export your data in a standard format
                          </div>
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
                    <div className="text-sm text-primary">
                      support@hypertro.app
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Mark subject as "Privacy"
                    </div>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <div className="font-semibold text-foreground">
                      Support Center
                    </div>
                    <a
                      className="text-sm text-primary"
                      href="/support"
                      target="_blank"
                    >
                      hypertro.app/support
                    </a>
                    <div className="text-xs text-muted-foreground mt-1">
                      FAQ and help resources
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 text-center">
                <p className="text-sm text-muted-foreground font-medium">
                  This Privacy Policy is legally binding and forms part of our{' '}
                  <a href="/terms" className="text-primary hover:underline">
                    Terms of Service
                  </a>
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
