# Subscription Components

This directory contains all the React components for managing Stripe subscriptions in your application.

## 🎯 **Components Overview**

### **SubscriptionDashboard** - Main Component

The primary component that combines all subscription features into a tabbed interface.

```tsx
import { SubscriptionDashboard } from '@/components/subscription'

;<SubscriptionDashboard
  userId="user-123"
  availablePackages={[
    {
      id: 'premium-monthly',
      name: 'Premium Monthly',
      description: 'Full access to all features',
      duration: 'MONTHLY',
      priceNOK: 14900, // 149.00 NOK in cents
    },
  ]}
/>
```

### **SubscriptionStatusCard** - Status Display

Shows current subscription status with trial, grace period, and access information.

```tsx
import { SubscriptionStatusCard } from '@/components/subscription'

;<SubscriptionStatusCard
  userId="user-123"
  onManageSubscription={() => {
    /* Open customer portal */
  }}
  onUpgrade={() => {
    /* Handle upgrade flow */
  }}
/>
```

### **BillingHistory** - Payment Records

Displays complete billing history with pagination and summary statistics.

```tsx
import { BillingHistory } from '@/components/subscription'

;<BillingHistory userId="user-123" />
```

### **PlanManagement** - Cancel & Reactivate

Handles subscription cancellation and reactivation flows.

```tsx
import { PlanManagement } from '@/components/subscription'

;<PlanManagement userId="user-123" />
```

## 🔗 **Required Dependencies**

These components use React Query for data fetching. Make sure your app is wrapped with a QueryClient:

```tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      {/* Your app components */}
    </QueryClientProvider>
  )
}
```

## 📡 **API Integration**

The components use custom hooks from `@/hooks/use-subscription.ts` that connect to your Stripe APIs:

- `GET /api/stripe/subscription-status` - Check premium access
- `GET /api/stripe/billing-history` - Payment history
- `GET /api/stripe/reactivation-eligibility` - Reactivation options
- `POST /api/stripe/create-checkout-session` - Start subscription
- `POST /api/stripe/create-portal-session` - Customer portal
- `POST /api/stripe/reactivate-subscription` - Restart subscription
- `POST /api/stripe/cancel-subscription` - Cancel subscription

## 🎨 **Styling & UI**

Components use shadcn/ui components and Tailwind CSS. Required UI components:

- `Button`, `Card`, `Badge`, `Dialog`
- `Table`, `Tabs`, `RadioGroup`, `Textarea`
- `Skeleton`, `Alert`, `Label`

## 📱 **Usage Examples**

### **Basic Subscription Page**

```tsx
// app/(protected)/fitspace/settings/page.tsx
import { SubscriptionDashboard } from '@/components/subscription'

export default function SubscriptionPage() {
  const userId = useAuth().user?.id

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-8">Subscription</h1>
      <SubscriptionDashboard userId={userId} />
    </div>
  )
}
```

### **Premium Features Check**

```tsx
import { useSubscriptionStatus } from '@/hooks/use-subscription'

function PremiumFeature({ userId }: { userId: string }) {
  const { data: status } = useSubscriptionStatus(userId)

  if (!status?.hasPremiumAccess) {
    return <div>Upgrade to Premium to access this feature</div>
  }

  return <div>Premium feature content</div>
}
```

### **Upgrade Button**

```tsx
import { useCreateCheckoutSession } from '@/hooks/use-subscription'

function UpgradeButton({
  userId,
  packageId,
}: {
  userId: string
  packageId: string
}) {
  const checkoutMutation = useCreateCheckoutSession()

  const handleUpgrade = async () => {
    try {
      const result = await checkoutMutation.mutateAsync({
        userId,
        packageId,
        returnUrl: window.location.href,
      })

      if (result.checkoutUrl) {
        window.location.href = result.checkoutUrl
      }
    } catch (error) {
      console.error('Upgrade failed:', error)
    }
  }

  return (
    <button onClick={handleUpgrade} disabled={checkoutMutation.isPending}>
      {checkoutMutation.isPending ? 'Processing...' : 'Upgrade Now'}
    </button>
  )
}
```

## 🔧 **Customization**

### **Styling**

All components use Tailwind classes and can be customized by:

- Modifying the component files directly
- Using CSS modules or styled-components
- Overriding Tailwind classes with your design system

### **Features**

Components support:

- ✅ 14-day trial periods
- ✅ 3-day grace periods
- ✅ Smart reactivation
- ✅ Immediate or period-end cancellation
- ✅ Complete billing history
- ✅ Customer portal integration
- ✅ Multi-currency support (ready for NOK/EUR/USD)

### **Error Handling**

All components include:

- Loading states with skeletons
- Error boundaries with retry options
- Graceful fallbacks for missing data
- User-friendly error messages

## 🚀 **Production Checklist**

Before deploying:

- [ ] Set up proper user authentication
- [ ] Configure real Stripe price IDs
- [ ] Set up production Stripe account
- [ ] Configure webhook endpoints
- [ ] Test all user flows
- [ ] Set up error monitoring

## 📞 **Support**

If you need help with these components:

1. Check the TypeScript types for prop definitions
2. Review the API documentation for backend integration
3. Test with Stripe's test cards for development
4. Use browser dev tools to debug API calls
