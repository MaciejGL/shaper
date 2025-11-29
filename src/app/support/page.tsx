import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentUser } from '@/lib/getUser'

export const metadata: Metadata = {
  title: 'Support - Hypro',
  description: 'Get help and support for Hypro - Personal Fitness Training App',
}

export default async function SupportPage() {
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
              <div className="border-b pb-6 text-center">
                <h1 className="text-4xl font-bold mb-4 text-foreground">
                  Support
                </h1>
                <p className="text-xl text-muted-foreground">
                  We're here to help you get the most out of your fitness
                  journey with Hypro.
                </p>
              </div>

              {/* Contact */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-foreground text-center">
                  Contact Us
                </h2>
                <div className="bg-muted/30 p-6 rounded-lg border text-center">
                  <p className="text-muted-foreground mb-4">
                    For all support inquiries, technical issues, privacy
                    questions, or feedback:
                  </p>
                  <Link
                    className="text-xl text-primary font-semibold hover:underline"
                    href="mailto:support@hypro.app"
                  >
                    support@hypro.app
                  </Link>
                  <p className="text-sm text-muted-foreground mt-4">
                    We typically respond within 1-3 business days
                  </p>
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-foreground">
                  Frequently Asked Questions
                </h2>

                {/* Getting Started */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    Getting Started
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        q: 'How do I create an account?',
                        a: "Visit hypro.app or download our mobile app. Enter your email address and we'll send you a one-time password to log in.",
                      },
                      {
                        q: 'How does the trainer-client system work?',
                        a: 'Clients can send coaching requests to trainers. Once connected, trainers can create custom workout and meal plans, track progress, and provide guidance.',
                      },
                      {
                        q: 'Can I use Hypro without a trainer?',
                        a: 'Yes! You can create your own workout plans, track exercises, log meals, take progress photos, and monitor your fitness journey independently.',
                      },
                    ].map((faq, index) => (
                      <div
                        key={index}
                        className="bg-muted/30 border-l-4 border-primary pl-6 py-4 rounded-r-lg"
                      >
                        <h4 className="font-semibold text-foreground mb-2">
                          {faq.q}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account & Data */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    Account & Data
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        q: 'How do I delete my account?',
                        a: 'Go to Settings and look for the Delete Account option, or email support@hypro.app. This will permanently remove all your data.',
                      },
                      {
                        q: 'Is my data secure?',
                        a: 'Yes. We use secure authentication, HTTPS encryption, and private storage for sensitive data. See our Privacy Policy for details.',
                      },
                      {
                        q: 'Where are my progress photos stored?',
                        a: 'Progress photos are stored securely in private cloud storage and are only accessible to you and trainers you work with.',
                      },
                    ].map((faq, index) => (
                      <div
                        key={index}
                        className="bg-muted/30 border-l-4 border-primary pl-6 py-4 rounded-r-lg"
                      >
                        <h4 className="font-semibold text-foreground mb-2">
                          {faq.q}
                        </h4>
                        <p className="text-muted-foreground text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Support */}
                <div className="mb-8">
                  <h3 className="text-lg font-semibold mb-4 text-foreground">
                    Technical Support
                  </h3>
                  <div className="bg-muted/30 border-l-4 border-primary pl-6 py-4 rounded-r-lg">
                    <h4 className="font-semibold text-foreground mb-2">
                      The app isn't working properly
                    </h4>
                    <p className="text-muted-foreground text-sm mb-3">
                      Try these steps first:
                    </p>
                    <ol className="text-muted-foreground text-sm ml-4 space-y-1 list-decimal">
                      <li>Close and restart the app</li>
                      <li>Check for app updates in your app store</li>
                      <li>Restart your device</li>
                      <li>Ensure you have a stable internet connection</li>
                    </ol>
                    <p className="text-muted-foreground text-sm mt-3">
                      If issues persist, please email us at support@hypro.app
                      with details about the problem, your device type, and
                      operating system version.
                    </p>
                  </div>
                </div>
              </div>

              {/* Safety Notice */}
              <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                <h2 className="text-2xl font-semibold mb-4 text-amber-900 dark:text-amber-100">
                  Training & Safety
                </h2>
                <div className="space-y-4 text-amber-800 dark:text-amber-200">
                  <p className="text-sm">
                    Hypro provides fitness guidance and training plan
                    suggestions. All workout programs are for informational
                    purposes only and should be adjusted to your individual
                    fitness level.
                  </p>
                  <ul className="text-sm space-y-2">
                    <li>
                      Consult with a healthcare provider before starting any new
                      exercise program
                    </li>
                    <li>
                      Stop exercising immediately if you feel pain, dizziness,
                      or discomfort
                    </li>
                    <li>
                      Adjust intensity and exercises to match your abilities
                    </li>
                    <li>
                      You exercise at your own risk and assume responsibility
                      for your safety
                    </li>
                  </ul>
                  <p className="text-sm mt-4">
                    For complete details, see our{' '}
                    <Link
                      href="/terms"
                      className="font-semibold underline hover:no-underline"
                    >
                      Terms of Service
                    </Link>
                    .
                  </p>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Quick Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Link
                    href="/privacy"
                    className="flex items-center p-4 bg-card rounded-lg border hover:border-primary transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        Privacy Policy
                      </div>
                      <div className="text-sm text-muted-foreground">
                        How we handle your data
                      </div>
                    </div>
                  </Link>
                  <Link
                    href="/terms"
                    className="flex items-center p-4 bg-card rounded-lg border hover:border-primary transition-colors"
                  >
                    <div>
                      <div className="font-semibold text-foreground">
                        Terms of Service
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Legal terms and conditions
                      </div>
                    </div>
                  </Link>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 text-center bg-muted/20 p-6 rounded-lg">
                <p className="text-muted-foreground font-medium">
                  Need help? Email us at{' '}
                  <Link
                    href="mailto:support@hypro.app"
                    className="text-primary font-semibold hover:underline"
                  >
                    support@hypro.app
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
