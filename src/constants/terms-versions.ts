// Terms versioning system with full content tracking
export interface TermsSection {
  title: string
  content: string[]
}

export interface ServiceTerms {
  title: string
  description: string
  sections: TermsSection[]
}

export interface TermsVersion {
  version: string
  date: string
  effectiveDate: string
  coaching: ServiceTerms
  premium: ServiceTerms
}

// Terms content by version
export const TERMS_BY_VERSION: Record<string, TermsVersion> = {
  'v1.0': {
    version: 'v1.0',
    date: '2024-12-01',
    effectiveDate: '2024-12-01',
    coaching: {
      title: 'Coaching Service Agreement',
      description:
        'Please review and agree to these terms before proceeding with your coaching purchase.',
      sections: [
        {
          title: '1. Coaching Service Details',
          content: [
            'Your trainer will provide the agreed services according to the package details and schedule.',
            'Response Time: Trainers typically respond to messages within 24 hours during business days.',
            "Availability: Coaching services are provided according to your trainer's schedule and your agreed sessions.",
          ],
        },
        {
          title: '2. Service Commitment',
          content: [
            'All coaching sessions and consultations will be delivered as agreed in your package.',
            'Training plans will be customized to your goals, fitness level, and preferences.',
            'Nutrition guidance will be provided based on your dietary requirements and restrictions.',
          ],
        },
        {
          title: '3. Cancellation & Refunds',
          content: [
            'Notice Period: 30 days written notice required for ongoing coaching subscriptions.',
            'Trainer Changes: If your trainer becomes unavailable, we will assign a replacement trainer or provide a prorated refund.',
            'One-time Services: Refunds available within 7 days if services have not been delivered.',
            'Monthly Subscriptions: Cancel anytime - access continues until the end of your billing period.',
          ],
        },
        {
          title: '4. Important Legal Information',
          content: [
            'By agreeing to these terms, you also agree to our Terms of Service and Privacy Policy.',
            'Liability: Services are provided on an "as-is" basis. We are not liable for any health outcomes or injuries.',
            'Data: Your workout and nutrition data will be stored securely and used to improve your experience.',
            'Professional Advice: Coaching services are for informational purposes. Consult healthcare professionals for medical advice.',
          ],
        },
      ],
    },
    premium: {
      title: 'Premium Service Terms',
      description:
        'Please review and agree to these terms before proceeding with your premium subscription.',
      sections: [
        {
          title: '1. Premium Features',
          content: [
            'Premium access includes advanced workout tracking, nutrition planning, and progress analytics.',
            'Features are continuously updated and improved based on user feedback.',
            'Access to exclusive workout templates and meal planning tools.',
            'Priority customer support with faster response times.',
          ],
        },
        {
          title: '2. Billing & Cancellation',
          content: [
            'Billing: Premium subscriptions are billed monthly or annually as selected.',
            'Cancellation: Cancel anytime - access continues until the end of your billing period.',
            'Refunds: No refunds for partial billing periods after service has been used.',
            'Auto-renewal: Subscriptions automatically renew unless cancelled before the next billing cycle.',
          ],
        },
        {
          title: '3. Data & Privacy',
          content: [
            'Your fitness and nutrition data will be stored securely and used to enhance your experience.',
            'Anonymous usage analytics help us improve our platform and features.',
            'You can export or delete your data at any time through your account settings.',
          ],
        },
        {
          title: '4. Important Legal Information',
          content: [
            'By agreeing to these terms, you also agree to our Terms of Service and Privacy Policy.',
            'Liability: Services are provided on an "as-is" basis. We are not liable for any health outcomes or injuries.',
            'Service Changes: We may modify or discontinue features with reasonable notice.',
            'Professional Advice: Premium features are for informational purposes. Consult healthcare professionals for medical advice.',
          ],
        },
      ],
    },
  },
  // Future versions will be added here
  // 'v1.1': { ... },
  // 'v2.0': { ... },
}

// Current active version
export const CURRENT_VERSION = 'v1.0'

// Helper functions
export const getCurrentTermsVersion = () => CURRENT_VERSION

export const getCurrentTerms = () => TERMS_BY_VERSION[CURRENT_VERSION]

export const getTermsByVersion = (version: string) => TERMS_BY_VERSION[version]

export const getAllVersions = () =>
  Object.keys(TERMS_BY_VERSION).sort().reverse()

// Helper to get terms for a specific service type
export const getServiceTerms = (
  serviceType: 'coaching' | 'premium',
  version?: string,
) => {
  const termsVersion = version ? getTermsByVersion(version) : getCurrentTerms()
  return termsVersion ? termsVersion[serviceType] : null
}
