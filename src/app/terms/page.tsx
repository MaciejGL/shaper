import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentUser } from '@/lib/getUser'

export const metadata: Metadata = {
  title: 'Terms of Service - Hypro',
  description: 'Terms of Service for Hypro - Personal Fitness Training App',
}

export default async function TermsOfServicePage() {
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
                  Terms of Service
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

              {/* 1. Acceptance */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  1. Acceptance of Terms
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground">
                  By downloading, installing, or using the Hypro mobile
                  application and web services ("Service"), you agree to be
                  bound by these Terms of Service ("Terms"). If you do not agree
                  to these Terms, do not use the Service.
                </p>
              </div>

              {/* 2. Service Description */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  2. Description of Service
                </h2>
                <p className="text-base leading-relaxed text-muted-foreground mb-4">
                  Hypro is a fitness platform available as both a web
                  application and mobile app that provides:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h4 className="font-semibold text-foreground mb-2">
                      Core Features
                    </h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>Customizable workout plan creation and tracking</li>
                      <li>Exercise database with instructions</li>
                      <li>Body measurement and progress photo tracking</li>
                      <li>Real-time workout session recording</li>
                    </ul>
                  </div>
                  <div className="bg-muted/30 p-4 rounded-lg border">
                    <h4 className="font-semibold text-foreground mb-2">
                      Trainer Services
                    </h4>
                    <ul className="space-y-2 text-muted-foreground text-sm">
                      <li>Connect with personal trainers</li>
                      <li>Receive customized training plans</li>
                      <li>Meal plans and nutrition guidelines</li>
                      <li>Progress monitoring and feedback</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* 3. Training Plan Disclaimer - PROMINENT SECTION */}
              <div className="bg-red-50 dark:bg-red-950/30 p-8 rounded-lg border-2 border-red-300 dark:border-red-700">
                <h2 className="text-2xl font-semibold mb-4 text-red-900 dark:text-red-100">
                  3. Training Plan Disclaimer
                </h2>
                <div className="space-y-4 text-red-800 dark:text-red-200">
                  <p className="font-semibold text-lg">
                    IMPORTANT: Please read this section carefully before using
                    any training plans or workout suggestions.
                  </p>

                  <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">
                      Training Plans Are Suggestions Only
                    </h3>
                    <p className="text-sm">
                      All training plans, workout programs, exercise
                      recommendations, and fitness content provided through
                      Hypro (whether created by our platform, trainers, or
                      AI-generated) are for{' '}
                      <strong>
                        informational and educational purposes only
                      </strong>
                      . They are not personalized medical or therapeutic
                      prescriptions.
                    </p>
                  </div>

                  <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">
                      Your Responsibility to Adjust
                    </h3>
                    <p className="text-sm mb-2">
                      You are solely responsible for:
                    </p>
                    <ul className="text-sm space-y-1 ml-4 list-disc">
                      <li>
                        Evaluating whether any exercise or training plan is
                        appropriate for your current fitness level, health
                        status, and physical capabilities
                      </li>
                      <li>
                        Adjusting intensity, volume, weight, and exercise
                        selection to match your individual needs
                      </li>
                      <li>
                        Modifying or skipping exercises that cause pain,
                        discomfort, or are beyond your abilities
                      </li>
                      <li>
                        Seeking proper instruction for unfamiliar exercises
                      </li>
                      <li>
                        Listening to your body and stopping immediately if
                        something feels wrong
                      </li>
                    </ul>
                  </div>

                  <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">
                      Consult Healthcare Professionals
                    </h3>
                    <p className="text-sm">
                      Before starting any new exercise program, you should
                      consult with a qualified healthcare provider, especially
                      if you have any pre-existing medical conditions, injuries,
                      physical limitations, or are pregnant. This is
                      particularly important if you have cardiovascular
                      conditions, joint problems, or have been sedentary.
                    </p>
                  </div>

                  <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                    <h3 className="font-semibold mb-2 text-red-900 dark:text-red-100">
                      Assumption of Risk
                    </h3>
                    <p className="text-sm">
                      Physical exercise carries inherent risks including, but
                      not limited to, muscle strains, sprains, fractures,
                      cardiovascular events, and other injuries. By using Hypro
                      and following any training plans or exercise
                      recommendations, you{' '}
                      <strong>
                        voluntarily assume all risks associated with physical
                        activity
                      </strong>{' '}
                      and agree that you exercise entirely at your own risk.
                    </p>
                  </div>
                </div>
              </div>

              {/* 4. Limitation of Liability */}
              <div className="bg-amber-50 dark:bg-amber-950/30 p-8 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                <h2 className="text-2xl font-semibold mb-4 text-amber-900 dark:text-amber-100">
                  4. Limitation of Liability
                </h2>
                <div className="space-y-4">
                  <p className="text-amber-800 dark:text-amber-200 font-semibold uppercase text-sm">
                    To the maximum extent permitted by applicable law:
                  </p>

                  <ul className="space-y-3 text-amber-800 dark:text-amber-200 text-sm">
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">a)</span>
                      <span>
                        Hypro, its owners, employees, trainers, and affiliates
                        shall not be liable for any injuries, health issues,
                        physical harm, or death resulting from the use of our
                        Service, including following any training plans, workout
                        programs, or exercise recommendations.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">b)</span>
                      <span>
                        We are not liable for any indirect, incidental, special,
                        consequential, or punitive damages, including loss of
                        profits, data, or other intangible losses.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">c)</span>
                      <span>
                        We are not responsible for the actions, advice, or
                        conduct of any trainers using our platform. Trainers are
                        independent contractors, not employees of Hypro.
                      </span>
                    </li>
                    <li className="flex items-start">
                      <span className="mr-2 font-bold">d)</span>
                      <span>
                        You agree to release and hold harmless Hypro from any
                        claims arising from your use of the Service or
                        participation in any exercise activities.
                      </span>
                    </li>
                  </ul>

                  <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-lg mt-4">
                    <p className="text-amber-900 dark:text-amber-100 text-sm font-semibold">
                      The Service is provided "as is" and "as available" without
                      warranties of any kind, either express or implied,
                      including but not limited to implied warranties of
                      merchantability, fitness for a particular purpose, or
                      non-infringement.
                    </p>
                  </div>
                </div>
              </div>

              {/* 5. User Accounts */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  5. User Accounts and Registration
                </h2>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>
                      You must be at least 13 years old to create an account
                    </li>
                    <li>You must provide a valid email address</li>
                    <li>Account information must be accurate and complete</li>
                    <li>You may not share your account access with others</li>
                    <li>
                      You are responsible for all activities under your account
                    </li>
                    <li>
                      Notify us immediately of any unauthorized account access
                    </li>
                  </ul>
                </div>
              </div>

              {/* 6. User Conduct */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  6. User Conduct
                </h2>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <p className="text-muted-foreground text-sm">
                    You agree to use the Service lawfully and respectfully. You
                    may not impersonate others, provide false information,
                    harass other users or trainers, or violate any applicable
                    laws.
                  </p>
                </div>
              </div>

              {/* 7. Trainer Relationships */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  7. Trainer Relationships
                </h2>
                <div className="bg-muted/30 p-6 rounded-lg space-y-4">
                  <p className="text-muted-foreground text-sm">
                    Hypro connects users with fitness trainers who provide
                    training plans, guidance, and coaching services through our
                    platform. Trainers are contractors of Hypro and are
                    initially evaluated before being allowed to offer services.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    We oversee trainer activity on the platform and are
                    committed to supporting the best possible user experience
                    and safety for our clients. However, Hypro does not take
                    responsibility for individual trainer actions, advice, or
                    the outcomes of following their training programs.
                  </p>
                  <p className="text-muted-foreground text-sm">
                    There are no additional contracts required between you and
                    trainers beyond these Terms of Service. All trainer services
                    are provided through and governed by the Hypro platform.
                  </p>
                </div>
              </div>

              {/* 8. Mobile Application */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  8. Mobile Application Terms
                </h2>
                <div className="bg-muted/30 p-6 rounded-lg">
                  <ul className="space-y-2 text-muted-foreground text-sm">
                    <li>
                      Available on iOS App Store and Google Play Store, subject
                      to respective platform terms
                    </li>
                    <li>
                      App permissions (camera, notifications) are clearly
                      disclosed during installation
                    </li>
                    <li>Updates may be automatically applied</li>
                    <li>Your data syncs across web and mobile platforms</li>
                  </ul>
                </div>
              </div>

              {/* 9. Privacy */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  9. Privacy and Data Protection
                </h2>
                <p className="text-muted-foreground">
                  Your privacy is important to us. Our collection and use of
                  personal information is governed by our{' '}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline font-semibold"
                  >
                    Privacy Policy
                  </Link>
                  , which is incorporated into these Terms by reference.
                </p>
              </div>

              {/* 10. Modifications */}
              <div>
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  10. Modifications to Terms
                </h2>
                <p className="text-muted-foreground text-sm">
                  We reserve the right to modify these Terms at any time. We
                  will notify users of material changes through the app or via
                  email. Your continued use of the Service after changes
                  constitutes acceptance of the modified Terms.
                </p>
              </div>

              {/* 11. Contact Information */}
              <div className="bg-muted/30 p-6 rounded-lg">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  11. Contact Information
                </h2>
                <p className="text-muted-foreground mb-4">
                  If you have questions about these Terms, contact us:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-card rounded-lg border">
                    <div className="font-semibold text-foreground">
                      Terms & Legal
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
              <div className="border-t pt-6 text-center bg-muted/20 p-6 rounded-lg">
                <p className="text-sm text-muted-foreground font-medium">
                  By using Hypro, you acknowledge that you have read,
                  understood, and agree to be bound by these Terms of Service.
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  These Terms work together with our{' '}
                  <Link
                    href="/privacy"
                    className="text-primary hover:underline"
                  >
                    Privacy Policy
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
