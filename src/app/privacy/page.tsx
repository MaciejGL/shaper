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
    <div className="mx-auto bg-background h-screen overflow-y-auto hide-scrollbar">
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
                      Account & Profile Information
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">
                          Basic Account:
                        </strong>{' '}
                        Email address, name, user role (client or trainer),
                        profile picture
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Personal Details:
                        </strong>{' '}
                        First name, last name, phone number, date of birth,
                        biological sex
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Fitness Profile:
                        </strong>{' '}
                        Height, weight, fitness level, activity level, goals,
                        bio, allergies
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Body Measurements:
                        </strong>{' '}
                        Circumference measurements (chest, waist, hips, neck,
                        biceps, calves, thighs), body fat percentage, tracking
                        timestamps
                      </li>
                      <li>
                        <strong className="text-foreground">Images:</strong>{' '}
                        Avatar photos (public), progress photos (private),
                        exercise demonstration images
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Fitness & Nutrition Data
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">
                          Training Data:
                        </strong>{' '}
                        Workout plans, exercises performed, sets, reps, weights,
                        RPE scores, rest periods, completion timestamps
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Exercise Logs:
                        </strong>{' '}
                        Detailed workout history, performance tracking, notes
                        and observations
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Nutrition Data:
                        </strong>{' '}
                        Meal plans, food logs, nutritional targets, dietary
                        preferences
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Reviews & Ratings:
                        </strong>{' '}
                        Training plan ratings, comments, and feedback
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Communication & Teams
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">
                          Trainer-Client Communications:
                        </strong>{' '}
                        Notes, coaching requests, team invitations
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Notifications:
                        </strong>{' '}
                        In-app notification preferences and delivery status
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Support Communications:
                        </strong>{' '}
                        Help requests, bug reports, feedback submissions
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Technical & Usage Data
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">
                          Analytics Data:
                        </strong>{' '}
                        App usage patterns, feature interactions, session
                        duration (via PostHog)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Device Information:
                        </strong>{' '}
                        Device type, operating system, app version, platform
                        (iOS/Android/Web)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Authentication Data:
                        </strong>{' '}
                        Session tokens, one-time passwords (OTP) for login
                        verification
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Push Notification Data:
                        </strong>{' '}
                        Mobile push tokens (Expo), notification preferences,
                        delivery status
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Third-Party Data Sources
                    </h3>
                    <ul className="space-y-2 text-muted-foreground">
                      <li>
                        <strong className="text-foreground">
                          Food Databases:
                        </strong>{' '}
                        Nutritional information from OpenFoodFacts and USDA Food
                        Data Central
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Email Services:
                        </strong>{' '}
                        Delivery status and engagement metrics from our email
                        provider (Resend)
                      </li>
                      <li>
                        <strong className="text-foreground">
                          Analytics Services:
                        </strong>{' '}
                        Aggregated usage statistics and user behavior insights
                        (PostHog)
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
                        <strong>Trainers:</strong> When you work with a trainer,
                        we share your profile, fitness data, progress
                        measurements, and training history
                      </li>
                      <li>
                        <strong>AWS S3:</strong> Secure cloud storage for your
                        images (avatar photos are publicly accessible, progress
                        photos are private)
                      </li>
                      <li>
                        <strong>PostHog:</strong> Analytics service receives
                        anonymized usage data and session recordings (with
                        password masking)
                      </li>
                      <li>
                        <strong>Expo Push Service:</strong> Mobile notification
                        delivery service receives push tokens and notification
                        content
                      </li>
                      <li>
                        <strong>Resend Email Service:</strong> Receives your
                        email address and OTP codes for authentication emails
                      </li>
                      <li>
                        <strong>Legal Requirements:</strong> When required by
                        law, court order, or to protect our rights and safety
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-100">
                      We DO NOT:
                    </h3>
                    <ul className="space-y-2 text-red-800 dark:text-red-200 text-sm">
                      <li>Sell your personal information to third parties</li>
                      <li>Share your data with social media platforms</li>
                      <li>Provide identifying information to advertisers</li>
                      <li>
                        Use your fitness data for marketing to third parties
                      </li>
                      <li>Share progress photos without explicit consent</li>
                      <li>Retain authentication data longer than necessary</li>
                      <li>
                        Store traditional passwords (we use OTP-only
                        authentication)
                      </li>
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
                  We implement multiple layers of security to protect your
                  personal information and fitness data:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">
                        OTP Authentication:
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        No password storage - secure one-time password login
                        only
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">
                        HTTPS Encryption:
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        All data transmitted using TLS encryption
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">
                        Private Image Storage:
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        Progress photos stored in private AWS S3 buckets
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">
                        PostgreSQL Database:
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        Industry-standard database with role-based access
                        controls
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-pink-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">
                        Session Management:
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        JWT tokens with automatic expiration and cleanup
                      </span>
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-indigo-500 rounded-full"></div>
                    <span className="text-sm">
                      <strong className="text-foreground">
                        Data Minimization:
                      </strong>{' '}
                      <span className="text-muted-foreground">
                        We collect only data necessary for app functionality
                      </span>
                    </span>
                  </div>
                </div>
              </div>

              {/* Mobile App Specific Information */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
                  📱 Mobile App Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
                      Push Notifications
                    </h3>
                    <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                      <li>• Mobile-only push notifications via Expo</li>
                      <li>• Push tokens stored securely with your account</li>
                      <li>• You can disable notifications in app settings</li>
                      <li>• No web browser push notifications</li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
                      Camera & Photos
                    </h3>
                    <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                      <li>• Camera access for progress photos only</li>
                      <li>• Photos compressed before upload</li>
                      <li>• Progress photos are private to your account</li>
                      <li>• Avatar photos are publicly visible</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg">
                  <p className="text-blue-800 dark:text-blue-200 text-sm">
                    <strong>Note:</strong> Our mobile app uses a WebView to
                    display the web application with native integrations for
                    camera and push notifications. Your data is synced across
                    all platforms.
                  </p>
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
                            View and download your personal data from Settings →
                            Data & Privacy
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
                            Delete your account via Settings → Account or
                            contact support
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
                            Export your fitness data in JSON format from
                            Settings
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Notification Controls
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>
                        • Manage push notification preferences in mobile app
                        settings
                      </li>
                      <li>
                        • Control email notifications from your profile settings
                      </li>
                      <li>
                        • Disable specific notification types (workouts, meals,
                        teams)
                      </li>
                      <li>• Opt out of all non-essential communications</li>
                    </ul>
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
