import { ArrowLeft } from 'lucide-react'
import { Metadata } from 'next'
import Link from 'next/link'

import { getCurrentUser } from '@/lib/getUser'

export const metadata: Metadata = {
  title: 'Support - Hypertro',
  description:
    'Get help and support for Hypertro - Personal Fitness Training App',
}

export default async function SupportPage() {
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
              <div className="border-b pb-6 text-center">
                <h1 className="text-4xl font-bold mb-4 text-foreground">
                  Hypertro Support
                </h1>
                <p className="text-xl text-muted-foreground">
                  We're here to help you get the most out of your fitness
                  journey with Hypertro.
                </p>
              </div>

              {/* Early Stage Disclaimer */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-6 rounded-lg border-2 border-blue-300 dark:border-blue-700">
                <h2 className="text-xl font-semibold mb-3 text-blue-900 dark:text-blue-100 flex items-center">
                  🚧 Early Stage Product Notice
                </h2>
                <p className="text-blue-800 dark:text-blue-200 text-sm">
                  <strong>Please note:</strong> Hypertro is actively under
                  development. You may encounter bugs, changing features, or
                  temporary limitations. We appreciate your patience and
                  feedback as we continue to improve the platform. Report any
                  issues to help us make Hypertro better!
                </p>
              </div>

              {/* Contact Cards */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-foreground text-center">
                  Contact Us
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-6 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">📧</span>
                      </div>
                      <h3 className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                        General Support
                      </h3>
                    </div>
                    <p className="text-blue-800 dark:text-blue-200 mb-3 text-sm">
                      For app questions, technical issues, and general help
                    </p>
                    <Link
                      className="text-blue-900 dark:text-blue-100 font-semibold"
                      href="mailto:support@hypertro.app"
                    >
                      support@hypertro.app
                    </Link>
                    <p className="text-blue-700 dark:text-blue-300 text-sm mt-2">
                      ⏱️ We typically respond within 1-3 business days
                    </p>
                  </div>

                  <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 p-6 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="flex items-center mb-4">
                      <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center mr-3">
                        <span className="text-white font-bold">🔒</span>
                      </div>
                      <h3 className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                        Privacy & Legal
                      </h3>
                    </div>
                    <p className="text-purple-800 dark:text-purple-200 mb-3 text-sm">
                      For privacy questions and legal matters
                    </p>
                    <Link
                      className="text-purple-900 dark:text-purple-100 font-semibold"
                      href="mailto:support@hypertro.app"
                    >
                      support@hypertro.app
                    </Link>
                    <p className="text-purple-700 dark:text-purple-300 text-sm mt-2">
                      🛡️ For data protection and privacy concerns
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQ Section */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-foreground">
                  Frequently Asked Questions
                </h2>

                {/* Getting Started */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                    <span className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">
                      🚀
                    </span>
                    Getting Started
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        q: 'How do I create an account?',
                        a: "Visit hypertro.app in your web browser or download our mobile app. Enter your email address and we'll send you a one-time password (OTP) to log in. No traditional password needed!",
                      },
                      {
                        q: 'Is Hypertro free to use?',
                        a: 'Yes! Hypertro is completely free with all core features included: workout tracking, meal planning, progress photos, trainer teams, and more. Premium features may be added in the future.',
                      },
                      {
                        q: 'How does the trainer-client system work?',
                        a: "If you're a client, you can send coaching requests to trainers. Once connected, trainers can create custom workout and meal plans for you, track your progress, and leave notes.",
                      },
                      {
                        q: 'Can I use Hypertro without a trainer?',
                        a: 'Absolutely! You can create your own workout plans, track exercises, log meals, take progress photos, and monitor your fitness journey independently.',
                      },
                      {
                        q: 'Is Hypertro still in development?',
                        a: 'Yes! Hypertro is actively being developed. You may notice new features, improvements, or occasional changes as we enhance the platform based on user feedback.',
                      },
                    ].map((faq, index) => (
                      <div
                        key={index}
                        className="bg-green-50 dark:bg-green-950/30 border-l-4 border-green-500 pl-6 py-4 rounded-r-lg"
                      >
                        <h4 className="font-semibold text-green-900 dark:text-green-100 mb-2">
                          {faq.q}
                        </h4>
                        <p className="text-green-800 dark:text-green-200 text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Technical Support */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                    <span className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">
                      🔧
                    </span>
                    Technical Support
                  </h3>
                  <div className="space-y-4">
                    <div className="bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500 pl-6 py-4 rounded-r-lg">
                      <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                        The app isn't working properly
                      </h4>
                      <p className="text-orange-800 dark:text-orange-200 text-sm mb-3">
                        Try these steps first:
                      </p>
                      <ol className="text-orange-800 dark:text-orange-200 text-sm ml-4 space-y-1 list-decimal">
                        <li>Close and restart the app</li>
                        <li>Check for app updates in your app store</li>
                        <li>Restart your device</li>
                        <li>Ensure you have a stable internet connection</li>
                      </ol>
                      <p className="text-orange-800 dark:text-orange-200 text-sm mt-3">
                        If issues persist, please email us at
                        support@hypertro.app with details about the problem,
                        your device type, and operating system version.
                      </p>
                    </div>

                    {[
                      {
                        q: 'How do I sync my data across devices?',
                        a: "Your data automatically syncs when you're logged into the same account on multiple devices with an internet connection. Works seamlessly between web browser and mobile app.",
                      },
                      {
                        q: "Push notifications aren't working on mobile",
                        a: 'First, ensure notifications are enabled in your device settings for Hypertro. Then check the notification preferences in the mobile app settings. Note: Push notifications only work on mobile apps, not in web browsers.',
                      },
                      {
                        q: 'Can I export my workout data?',
                        a: 'Yes! Go to Settings → Data & Privacy → Export Data to download your workout history, progress measurements, and other fitness data in JSON format.',
                      },
                      {
                        q: 'How does OTP login work?',
                        a: 'Instead of passwords, Hypertro uses one-time passwords (OTP). Enter your email, check your inbox for a 6-digit code, and enter it to log in. Codes expire after a few minutes for security.',
                      },
                      {
                        q: 'I found a bug or want to suggest a feature',
                        a: "Great! Since we're actively developing Hypertro, your feedback is invaluable. Please email us at support@hypertro.app with details about bugs or feature suggestions.",
                      },
                    ].map((faq, index) => (
                      <div
                        key={index}
                        className="bg-orange-50 dark:bg-orange-950/30 border-l-4 border-orange-500 pl-6 py-4 rounded-r-lg"
                      >
                        <h4 className="font-semibold text-orange-900 dark:text-orange-100 mb-2">
                          {faq.q}
                        </h4>
                        <p className="text-orange-800 dark:text-orange-200 text-sm leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Account & Data */}
                <div className="mb-8">
                  <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                    <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">
                      👤
                    </span>
                    Account & Data
                  </h3>
                  <div className="space-y-4">
                    {[
                      {
                        q: 'What data can I export?',
                        a: 'You can export your complete fitness data including workout plans, exercise logs, body measurements, meal plans, and progress tracking data in JSON format from Settings → Data & Privacy.',
                      },
                      {
                        q: 'How do I delete my account?',
                        a: 'To delete your account, go to Settings → Account → Delete Account or email support@hypertro.app. This will permanently remove all your data including progress photos and workout history.',
                      },
                      {
                        q: 'Where are my progress photos stored?',
                        a: 'Progress photos are securely stored in private AWS S3 buckets and are only accessible to you and any trainers you collaborate with. Avatar photos are publicly visible to other users.',
                      },
                      {
                        q: 'Is my data secure?',
                        a: 'Yes! We use OTP authentication (no password storage), HTTPS encryption, and secure cloud storage. Learn more in our Privacy Policy.',
                      },
                    ].map((faq, index) => (
                      <div
                        key={index}
                        className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 pl-6 py-4 rounded-r-lg"
                      >
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                          {faq.q}
                        </h4>
                        <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                          {faq.a}
                          {faq.q.includes('data secure') && (
                            <>
                              {' '}
                              <a
                                href="/privacy"
                                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                              >
                                Privacy Policy
                              </a>
                              .
                            </>
                          )}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Mobile App Specific */}
              <div className="mb-8">
                <h3 className="text-xl font-semibold mb-4 text-foreground flex items-center">
                  <span className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center mr-3 text-white text-sm font-bold">
                    📱
                  </span>
                  Mobile App
                </h3>
                <div className="space-y-4">
                  {[
                    {
                      q: 'Where can I download the mobile app?',
                      a: 'The Hypertro mobile app is available on the iOS App Store and Google Play Store. Search for "Hypertro" or visit the download links on our website.',
                    },
                    {
                      q: 'Why do I need camera permissions?',
                      a: 'Camera access is only used for taking progress photos and exercise demonstration images. You can grant or deny this permission in your device settings.',
                    },
                    {
                      q: 'How do mobile push notifications work?',
                      a: 'Our mobile app uses native push notifications to remind you about workouts, meals, and team updates. You can customize notification types in the app settings.',
                    },
                    {
                      q: 'Is the mobile app the same as the website?',
                      a: 'The mobile app provides the same features as the web version with additional native integrations like push notifications and camera access. Your data syncs across all platforms.',
                    },
                  ].map((faq, index) => (
                    <div
                      key={index}
                      className="bg-blue-50 dark:bg-blue-950/30 border-l-4 border-blue-500 pl-6 py-4 rounded-r-lg"
                    >
                      <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        {faq.q}
                      </h4>
                      <p className="text-blue-800 dark:text-blue-200 text-sm leading-relaxed">
                        {faq.a}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bug Reports */}
              <div className="bg-red-50 dark:bg-red-950/30 p-6 rounded-lg border border-red-200 dark:border-red-800">
                <h2 className="text-2xl font-semibold mb-4 text-red-900 dark:text-red-100 flex items-center">
                  <span className="mr-3">🐛</span>Report a Bug
                </h2>
                <p className="text-red-800 dark:text-red-200 mb-4">
                  Found a bug? Help us improve Hypertro by reporting it. Please
                  include:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <ul className="space-y-2 text-red-800 dark:text-red-200 text-sm">
                    <li>• Detailed description of the problem</li>
                    <li>• Steps to reproduce the issue</li>
                    <li>• Your device type and operating system version</li>
                  </ul>
                  <ul className="space-y-2 text-red-800 dark:text-red-200 text-sm">
                    <li>• App version (found in Settings → About)</li>
                    <li>• Screenshots or screen recordings if applicable</li>
                    <li>• When the issue first occurred</li>
                  </ul>
                </div>
                <div className="bg-red-100 dark:bg-red-900/50 p-4 rounded-lg">
                  <p className="font-semibold text-red-900 dark:text-red-100">
                    Send bug reports to:{' '}
                    <span className="text-red-600 dark:text-red-400">
                      support@hypertro.app
                    </span>
                  </p>
                </div>
              </div>

              {/* Safety Notice */}
              <div className="bg-amber-50 dark:bg-amber-950/30 p-6 rounded-lg border-2 border-amber-300 dark:border-amber-700">
                <h2 className="text-2xl font-semibold mb-4 text-amber-900 dark:text-amber-100 flex items-center">
                  <span className="mr-3">⚠️</span>Training & Safety
                </h2>
                <div className="bg-amber-100 dark:bg-amber-900/50 p-4 rounded-lg mb-4">
                  <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-2">
                    Important Safety Notice
                  </h3>
                  <p className="text-amber-800 dark:text-amber-200 text-sm mb-3">
                    Hypertro provides fitness guidance, but we are not medical
                    professionals. Always consult with your healthcare provider
                    before starting any new exercise program.
                  </p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <ul className="space-y-2 text-amber-800 dark:text-amber-200 text-sm">
                    <li>
                      • Stop exercising immediately if you feel pain, dizziness,
                      or discomfort
                    </li>
                    <li>
                      • Listen to your body and exercise within your
                      capabilities
                    </li>
                  </ul>
                  <ul className="space-y-2 text-amber-800 dark:text-amber-200 text-sm">
                    <li>• Stay hydrated and take breaks as needed</li>
                    <li>
                      • If you have any medical conditions, get clearance from
                      your doctor first
                    </li>
                  </ul>
                </div>
              </div>

              {/* Response Times */}
              <div>
                <h2 className="text-2xl font-semibold mb-6 text-foreground text-center">
                  Response Times
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center p-6 bg-green-50 dark:bg-green-950/30 rounded-lg border border-green-200 dark:border-green-800">
                    <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">24h</span>
                    </div>
                    <div className="text-lg font-semibold text-green-900 dark:text-green-100">
                      General Support
                    </div>
                    <div className="text-sm text-green-700 dark:text-green-300 mt-2">
                      App questions, account help, general inquiries
                    </div>
                  </div>
                  <div className="text-center p-6 bg-blue-50 dark:bg-blue-950/30 rounded-lg border border-blue-200 dark:border-blue-800">
                    <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">48h</span>
                    </div>
                    <div className="text-lg font-semibold text-blue-900 dark:text-blue-100">
                      Technical Issues
                    </div>
                    <div className="text-sm text-blue-700 dark:text-blue-300 mt-2">
                      Bug reports, app crashes, technical problems
                    </div>
                  </div>
                  <div className="text-center p-6 bg-purple-50 dark:bg-purple-950/30 rounded-lg border border-purple-200 dark:border-purple-800">
                    <div className="w-16 h-16 bg-purple-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <span className="text-white font-bold text-xl">72h</span>
                    </div>
                    <div className="text-lg font-semibold text-purple-900 dark:text-purple-100">
                      Privacy & Legal
                    </div>
                    <div className="text-sm text-purple-700 dark:text-purple-300 mt-2">
                      Data requests, privacy concerns, legal matters
                    </div>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="bg-primary/5 p-6 rounded-lg border border-primary/20">
                <h2 className="text-2xl font-semibold mb-4 text-foreground">
                  Quick Links
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <a
                      href="/privacy"
                      className="flex items-center p-3 bg-card rounded-lg border hover:border-primary transition-colors"
                    >
                      <span className="mr-3">🔒</span>
                      <div>
                        <div className="font-semibold text-foreground">
                          Privacy Policy
                        </div>
                        <div className="text-sm text-muted-foreground">
                          How we handle your data
                        </div>
                      </div>
                    </a>
                    <a
                      href="/terms"
                      className="flex items-center p-3 bg-card rounded-lg border hover:border-primary transition-colors"
                    >
                      <span className="mr-3">📋</span>
                      <div>
                        <div className="font-semibold text-foreground">
                          Terms of Service
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Legal terms and conditions
                        </div>
                      </div>
                    </a>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center p-3 bg-card rounded-lg border">
                      <span className="mr-3">💡</span>
                      <div>
                        <div className="font-semibold text-foreground">
                          Feature Requests
                        </div>
                        <div className="text-sm text-muted-foreground">
                          support@hypertro.app
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center p-3 bg-card rounded-lg border">
                      <span className="mr-3">🤝</span>
                      <div>
                        <div className="font-semibold text-foreground">
                          Partnership Inquiries
                        </div>
                        <div className="text-sm text-muted-foreground">
                          support@hypertro.app
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Mark subject as "Partnership"
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="border-t pt-6 text-center bg-muted/20 p-6 rounded-lg">
                <p className="text-muted-foreground font-medium">
                  Need immediate help? Check our FAQ section above or email{' '}
                  <span className="text-primary font-semibold">
                    support@hypertro.app
                  </span>
                </p>
                <p className="text-sm text-muted-foreground mt-2">
                  We're committed to providing excellent support for your
                  fitness journey! 💪
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
