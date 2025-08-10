import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentUser } from '@/lib/getUser'

export const metadata: Metadata = {
  title: 'Terms of Service - Hypertro',
  description: 'Terms of Service for Hypertro - Personal Fitness Training App',
}

export default async function TermsOfServicePage() {
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
                  Terms of Service for Hypertro
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
                  development. Features may be modified, added, or removed
                  during ongoing development. These Terms may be updated to
                  reflect new functionality. We will notify users of significant
                  changes and provide reasonable transition periods for any
                  modifications that affect existing features.
                </p>
              </div>

              {/* Acceptance */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  1. Acceptance of Terms
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground mb-6">
                  By downloading, installing, or using the Hypertro mobile
                  application and web services ("Service"), you agree to be
                  bound by these Terms of Service ("Terms"). If you do not agree
                  to these Terms, do not use the Service.
                </p>
              </div>

              {/* Service Description */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  2. Description of Service
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground mb-4">
                  Hypertro is a comprehensive fitness platform available as both
                  a web application and mobile apps that provides:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      Core Features
                    </h4>
                    <ul className="space-y-2 text-blue-800 dark:text-blue-200 text-sm">
                      <li>• Customizable workout plan creation and tracking</li>
                      <li>• Exercise database with detailed instructions</li>
                      <li>• Body measurement and progress photo tracking</li>
                      <li>• Real-time workout session recording</li>
                    </ul>
                  </div>
                  <div className="bg-green-50 dark:bg-green-950/30 p-4 rounded-lg border border-green-200 dark:border-green-800">
                    <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                      Advanced Features
                    </h4>
                    <ul className="space-y-2 text-green-800 dark:text-green-200 text-sm">
                      <li>• Meal planning and nutrition tracking</li>
                      <li>• Trainer-client collaboration tools</li>
                      <li>• Mobile app with native push notifications</li>
                      <li>• Data export and privacy controls</li>
                    </ul>
                  </div>
                </div>
                <div className="mt-4 p-4 bg-amber-50 dark:bg-amber-950/30 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-amber-800 dark:text-amber-200 text-sm">
                    <strong>Current Status:</strong> Hypertro is currently free
                    to use. Premium features may be introduced in the future,
                    but core functionality will always remain available at no
                    cost.
                  </p>
                </div>
              </div>

              {/* User Accounts */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  3. User Accounts and Registration
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Account Creation
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>
                        • You must be at least 13 years old to create an account
                      </li>
                      <li>• You must provide a valid email address</li>
                      <li>
                        • Account information must be accurate and complete
                      </li>
                      <li>
                        • You may not share your account access with others
                      </li>
                    </ul>
                  </div>

                  <div className="bg-muted/30 p-6 rounded-lg">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      Authentication & Security
                    </h3>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>
                        • Hypertro uses one-time password (OTP) authentication
                      </li>
                      <li>• No traditional passwords are stored or required</li>
                      <li>
                        • Notify us immediately of any unauthorized account
                        access
                      </li>
                      <li>
                        • You are responsible for all activities under your
                        account
                      </li>
                      <li>• Provide truthful health and fitness information</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* User Conduct */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  4. User Conduct and Prohibited Activities
                </h2>
                <div className="space-y-6">
                  <div className="bg-green-50 dark:bg-green-950/30 p-6 rounded-lg border border-green-200 dark:border-green-800">
                    <h3 className="text-lg font-semibold mb-3 text-green-900 dark:text-green-100">
                      ✅ Acceptable Use
                    </h3>
                    <p className="text-green-800 dark:text-green-200 text-sm">
                      You agree to use the Service only for lawful purposes and
                      in accordance with these Terms.
                    </p>
                  </div>

                  <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg border border-red-200 dark:border-red-800">
                    <h3 className="text-lg font-semibold mb-3 text-red-900 dark:text-red-100">
                      ❌ Prohibited Activities
                    </h3>
                    <p className="text-red-800 dark:text-red-200 text-sm mb-3">
                      You may not:
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <ul className="space-y-1 text-red-800 dark:text-red-200 text-sm">
                        <li>
                          • Use the Service for any illegal or unauthorized
                          purpose
                        </li>
                        <li>
                          • Impersonate others or provide false information
                        </li>
                        <li>
                          • Harass, abuse, or harm other users or trainers
                        </li>
                        <li>
                          • Distribute malware, viruses, or harmful content
                        </li>
                      </ul>
                      <ul className="space-y-1 text-red-800 dark:text-red-200 text-sm">
                        <li>
                          • Attempt to gain unauthorized access to our systems
                        </li>
                        <li>• Use automated tools to access the Service</li>
                        <li>• Share inappropriate or offensive content</li>
                        <li>• Violate any applicable laws or regulations</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Health & Safety Disclaimer */}
              <div className="bg-amber-50 dark:bg-amber-950/30 p-8 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                <h2 className="text-2xl font-semibold mb-4 text-amber-900 dark:text-amber-100 flex items-center">
                  ⚠️ Health and Safety Disclaimer
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-amber-800 dark:text-amber-200">
                      Important Reminders
                    </h3>
                    <ul className="space-y-2 text-amber-700 dark:text-amber-300 text-sm">
                      <li>
                        • Consult healthcare providers before starting any
                        fitness program
                      </li>
                      <li>
                        • Exercise at your own risk and within your capabilities
                      </li>
                      <li>
                        • Stop exercising if you experience pain or discomfort
                      </li>
                      <li>
                        • We are not responsible for injuries resulting from app
                        use
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-amber-800 dark:text-amber-200">
                      Trainer Relationships
                    </h3>
                    <ul className="space-y-2 text-amber-700 dark:text-amber-300 text-sm">
                      <li>
                        • Trainers are independent contractors, not Hypertro
                        employees
                      </li>
                      <li>
                        • We facilitate connections but do not employ trainers
                      </li>
                      <li>
                        • You are responsible for evaluating trainer
                        qualifications
                      </li>
                      <li>
                        • Direct relationships are governed by separate
                        agreements
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Medical Disclaimer */}
              <div className="bg-red-50 dark:bg-red-950/30 p-8 rounded-lg border-2 border-red-300 dark:border-red-700">
                <h2 className="text-2xl font-semibold mb-4 text-red-900 dark:text-red-100 flex items-center">
                  🏥 Medical Disclaimer
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-800 dark:text-red-200">
                      Not Medical Advice
                    </h3>
                    <ul className="space-y-2 text-red-700 dark:text-red-300 text-sm">
                      <li>
                        • The Service provides general fitness information only
                      </li>
                      <li>• Content is not intended as medical advice</li>
                      <li>
                        • Always consult healthcare professionals before
                        starting exercise programs
                      </li>
                      <li>
                        • We do not diagnose, treat, or prevent any medical
                        conditions
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-red-800 dark:text-red-200">
                      Health Considerations
                    </h3>
                    <ul className="space-y-2 text-red-700 dark:text-red-300 text-sm">
                      <li>
                        • Exercise programs may not be suitable for everyone
                      </li>
                      <li>• Consider your health status and limitations</li>
                      <li>
                        • Stop exercising if you experience adverse symptoms
                      </li>
                      <li>• Seek medical attention for any health concerns</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Mobile App Terms */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                <h2 className="text-2xl font-semibold mb-4 text-blue-900 dark:text-blue-100">
                  📱 Mobile Application Terms
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
                      App Store Compliance
                    </h3>
                    <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                      <li>
                        • Available on iOS App Store and Google Play Store
                      </li>
                      <li>
                        • Subject to respective platform terms and policies
                      </li>
                      <li>
                        • Over-the-air updates may be automatically applied
                      </li>
                      <li>
                        • App permissions are clearly disclosed during
                        installation
                      </li>
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold mb-3 text-blue-800 dark:text-blue-200">
                      Mobile-Specific Features
                    </h3>
                    <ul className="space-y-2 text-blue-700 dark:text-blue-300 text-sm">
                      <li>
                        • Camera access for progress photos only when granted
                      </li>
                      <li>• Push notifications require user permission</li>
                      <li>• Data syncs across web and mobile platforms</li>
                      <li>• Native integrations with device capabilities</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Legal Disclaimers */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Legal Disclaimers
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-muted p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      9. Disclaimer of Warranties
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 font-semibold">
                      THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT
                      WARRANTIES OF ANY KIND:
                    </p>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>
                        • MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
                      </li>
                      <li>• ACCURACY OR COMPLETENESS OF CONTENT</li>
                      <li>• UNINTERRUPTED OR ERROR-FREE OPERATION</li>
                      <li>• SECURITY OR ABSENCE OF VIRUSES</li>
                      <li>• FITNESS ADVICE OR NUTRITIONAL RECOMMENDATIONS</li>
                    </ul>
                  </div>

                  <div className="bg-muted p-6 rounded-lg border">
                    <h3 className="text-lg font-semibold mb-3 text-foreground">
                      10. Limitation of Liability
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 font-semibold">
                      TO THE MAXIMUM EXTENT PERMITTED BY LAW:
                    </p>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• WE SHALL NOT BE LIABLE FOR INDIRECT DAMAGES</li>
                      <li>• WE ARE NOT LIABLE FOR EXERCISE-RELATED INJURIES</li>
                      <li>
                        • WE ARE NOT LIABLE FOR TRAINER-CLIENT RELATIONSHIPS
                      </li>
                      <li>
                        • WE ARE NOT LIABLE FOR DATA LOSS OR DEVICE ISSUES
                      </li>
                      <li>• LIABILITY LIMITED TO THE FULLEST EXTENT OF LAW</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Privacy Reference */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  7. Privacy and Data Protection
                </h2>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Our collection and use of
                  personal information is governed by our{' '}
                  <a
                    href="/privacy"
                    className="text-primary hover:underline font-semibold"
                  >
                    Privacy Policy
                  </a>
                  , which is incorporated into these Terms by reference.
                </p>
              </div>

              {/* Contact Information */}
              <div className="bg-muted/30 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  17. Contact Information
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about these Terms, contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <div className="font-semibold text-foreground">
                      Terms Questions
                    </div>
                    <Link
                      className="text-sm text-blue-500 hover:underline"
                      href="mailto:support@hypertro.app"
                    >
                      support@hypertro.app
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1">
                      Mark subject as "Terms & Legal"
                    </div>
                  </div>
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <div className="font-semibold text-foreground">
                      Support Center
                    </div>
                    <Link
                      className="text-sm text-blue-500 hover:underline"
                      href="/support"
                      target="_blank"
                    >
                      hypertro.app/support
                    </Link>
                    <div className="text-xs text-muted-foreground mt-1">
                      FAQ and help resources
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 text-center bg-muted/20 p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">
                  By using Hypertro, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms of Service.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  These Terms work together with our{' '}
                  <a href="/privacy" className="text-primary hover:underline">
                    Privacy Policy
                  </a>{' '}
                  and{' '}
                  <a href="/support" className="text-primary hover:underline">
                    Support Documentation
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
