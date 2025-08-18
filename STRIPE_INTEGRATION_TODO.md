# 🚀 Stripe Integration - Production Ready TODO

## Phase 1: Database & Configuration Setup

### 📊 Database Schema Updates

- [ ] **Add Stripe fields to User model**
  - [ ] `stripeCustomerId` (String, unique)
  - [ ] Add index for `stripeCustomerId`
- [ ] **Add Stripe fields to PackageTemplate model**

  - [ ] `stripeProductId` (String) - Maps to Stripe product
  - [ ] `stripePriceIdNOK` (String) - Norwegian Kroner price ID
  - [ ] `stripePriceIdEUR` (String) - Euro price ID
  - [ ] `stripePriceIdUSD` (String) - USD price ID
  - [ ] Add index for `stripeProductId`

- [ ] **Create database migration**
- [ ] **Run migration in development**
- [ ] **Test migration rollback**

### ⚙️ Environment Configuration

- [ ] **Add Stripe environment variables**
  - [ ] `STRIPE_SECRET_KEY`
  - [ ] `STRIPE_PUBLISHABLE_KEY`
  - [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
  - [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] **Configure different keys for dev/staging/prod**
- [ ] **Add to CI/CD environment variables**

### 🏷️ Stripe Product Mapping

- [ ] **Get actual price IDs from Stripe Dashboard**

  - [ ] Premium Monthly NOK price ID (149.00kr)
  - [ ] Premium Yearly NOK price ID (1,490.00kr)
  - [ ] Premium Monthly EUR price ID (€12.90)
  - [ ] Premium Yearly EUR price ID (€139.00)
  - [ ] Premium Monthly USD price ID ($14.90)
  - [ ] Premium Yearly USD price ID ($149.90)

- [ ] **Update package templates with Stripe mappings**
- [ ] **Create seeder script for Stripe product mappings**

## Phase 2: Core Stripe Integration

### 🛠️ Stripe Client Setup

- [ ] **Install Stripe dependencies**
  - [ ] `stripe` (server-side)
  - [ ] `@stripe/stripe-js` (client-side)
- [ ] **Create Stripe client configuration (`src/lib/stripe/client.ts`)**
- [ ] **Create Stripe config mapping (`src/lib/stripe/config.ts`)**
- [ ] **Create helper functions**
  - [ ] `getOrCreateStripeCustomer()`
  - [ ] `getStripePriceForPackage()`
  - [ ] `validateStripeSignature()`

### 🔗 API Endpoints

- [ ] **Checkout Session API (`/api/stripe/create-checkout-session`)**

  - [ ] Validate user authentication
  - [ ] Get or create Stripe customer
  - [ ] Create checkout session
  - [ ] Handle success/cancel URLs
  - [ ] Error handling & logging

- [ ] **Customer Portal API (`/api/stripe/create-portal-session`)**

  - [ ] Validate user authentication
  - [ ] Create customer portal session
  - [ ] Return portal URL

- [ ] **Webhook Handler API (`/api/stripe/webhooks`)**

  - [ ] Verify webhook signature
  - [ ] Handle subscription events
  - [ ] Update database accordingly
  - [ ] Invalidate caches
  - [ ] Error handling & retry logic

- [ ] **Subscription Status API (`/api/stripe/subscription-status`)**
  - [ ] Get current Stripe subscription status
  - [ ] Sync with internal database
  - [ ] Return unified status

## Phase 3: Webhook Event Handling

### 🎣 Critical Stripe Events

- [ ] **`customer.subscription.created`**

  - [ ] Create UserSubscription record
  - [ ] Set status to ACTIVE
  - [ ] Map Stripe price to internal package
  - [ ] Invalidate user caches

- [ ] **`customer.subscription.updated`**

  - [ ] Update subscription status
  - [ ] Handle plan changes
  - [ ] Update end dates
  - [ ] Invalidate user caches

- [ ] **`customer.subscription.deleted`**

  - [ ] Set status to CANCELLED
  - [ ] Keep access until period end
  - [ ] Invalidate user caches

- [ ] **`invoice.payment_succeeded`**

  - [ ] Update subscription status
  - [ ] Extend subscription period
  - [ ] Send confirmation email
  - [ ] Track revenue metrics

- [ ] **`invoice.payment_failed`**

  - [ ] Set status to PENDING
  - [ ] Send payment failure notification
  - [ ] Handle retry logic
  - [ ] Grace period handling

- [ ] **`customer.subscription.trial_will_end`**
  - [ ] Send trial expiration notification
  - [ ] Prepare for conversion

### 🔄 Cache Invalidation

- [ ] **Invalidate subscription caches on all webhook events**
- [ ] **Invalidate user context caches**
- [ ] **Update premium access status**

## Phase 4: Frontend Integration

### 🛒 Checkout Flow

- [ ] **Replace mock "Upgrade to Premium" button**
- [ ] **Create Stripe checkout redirect**
- [ ] **Handle loading states**
- [ ] **Success page with confirmation**
- [ ] **Error handling for failed checkouts**

### 👤 Customer Portal

- [ ] **Add "Manage Subscription" button in settings**
- [ ] **Redirect to Stripe customer portal**
- [ ] **Handle return from portal**

### 🎨 UI Components

- [ ] **Update SubscriptionSection component**
- [ ] **Add Stripe-powered upgrade cards**
- [ ] **Show real pricing from Stripe**
- [ ] **Handle multiple currencies**
- [ ] **Loading and error states**

### 📱 Payment Methods

- [ ] **Card payments (default)**
- [ ] **SEPA Direct Debit (for European customers)**
- [ ] **Future: PayPal integration**

## Phase 5: Testing & Quality Assurance

### 🧪 Testing Strategy

- [ ] **Unit tests for Stripe client functions**
- [ ] **Integration tests for webhook handlers**
- [ ] **End-to-end checkout flow tests**
- [ ] **Test subscription lifecycle events**
- [ ] **Test error scenarios and edge cases**

### 🔍 Manual Testing Checklist

- [ ] **Test successful subscription creation**
- [ ] **Test subscription cancellation**
- [ ] **Test plan upgrades/downgrades**
- [ ] **Test payment failures**
- [ ] **Test webhook delivery failures**
- [ ] **Test customer portal functionality**

### 🛡️ Security Testing

- [ ] **Webhook signature validation**
- [ ] **Input sanitization**
- [ ] **Rate limiting on API endpoints**
- [ ] **Authentication checks**

## Phase 6: Production Deployment

### 🚀 Deployment Preparation

- [ ] **Configure production Stripe account**
- [ ] **Set up production webhooks**
- [ ] **Configure production environment variables**
- [ ] **Set up monitoring and alerting**

### 📊 Monitoring & Logging

- [ ] **Stripe event processing logs**
- [ ] **Payment success/failure metrics**
- [ ] **Subscription churn tracking**
- [ ] **Revenue analytics**
- [ ] **Error tracking (Sentry integration)**

### 🔔 Notifications

- [ ] **Email confirmations for subscriptions**
- [ ] **Payment failure notifications**
- [ ] **Subscription expiration warnings**
- [ ] **Admin alerts for critical events**

## Phase 7: Business Logic & Features

### 💼 Business Model & Commission Structure

- [ ] **Fixed commission rates (not trainer-controlled)**
  - [ ] Combo packages: $15 USD app commission per sale
  - [ ] Small packages: $10 USD app commission per sale
  - [ ] Stripe processing fees (passed to customer or deducted)
- [ ] **Trainer payout system**
  - [ ] Automatic commission calculation
  - [ ] Payout schedule management (weekly/monthly)
  - [ ] Tax reporting integration
  - [ ] Payment method setup for trainers
- [ ] **Price standardization**
  - [ ] Business owner controls all pricing
  - [ ] No trainer pricing flexibility
  - [ ] Consistent pricing across platform

### 💰 Subscription Management

- [ ] **Proration handling for plan changes**
- [ ] **Trial period management**
- [ ] **Subscription pause/resume (if needed)**
- [ ] **Dunning management for failed payments**

### 🎁 Discounts & Promotions

- [ ] **Stripe coupon integration**
- [ ] **Promotional codes**
- [ ] **First-time subscriber discounts**
- [ ] **Annual plan discounts**

### 📈 Analytics & Reporting

- [ ] **MRR (Monthly Recurring Revenue) tracking**
- [ ] **Churn rate analysis**
- [ ] **Subscription conversion funnels**
- [ ] **Customer lifetime value**
- [ ] **Commission tracking & reporting**
  - [ ] App commission revenue ($15 combo, $10 small packages)
  - [ ] Trainer earnings tracking
  - [ ] Stripe fee calculations
  - [ ] Net revenue analytics

## Phase 8: Future One-Time Purchases (Placeholder)

### 🛍️ One-Time Product Setup

- [ ] **Create Stripe products for one-time purchases**
  - [ ] Individual Coaching Session
  - [ ] Custom Training Plan
  - [ ] Custom Meal Plan
  - [ ] In-Person Meeting
  - [ ] Combo Packages

### 🔄 Purchase Flow

- [ ] **One-time checkout sessions**
- [ ] **Digital product delivery**
- [ ] **Purchase confirmation system**
- [ ] **Refund handling**

### 📦 Product Management

- [ ] **Fixed pricing structure (business-controlled)**
  - [ ] Define standard package prices (set by business owners)
  - [ ] Combo packages: Base price + $15 USD app commission + Stripe fees
  - [ ] Small packages: Base price + $10 USD app commission + Stripe fees
  - [ ] No trainer control over pricing
- [ ] **Trainer product assignment (not pricing)**
  - [ ] Assign predefined packages to trainers
  - [ ] Trainer availability management (when they're bookable)
  - [ ] Trainer service capacity limits
- [ ] **Revenue split automation**
  - [ ] Automatic commission deduction ($15/$10 + Stripe fees)
  - [ ] Trainer payout calculation
  - [ ] Payout scheduling and processing
- [ ] **Digital delivery automation**

## Phase 9: Advanced Features

### 🌍 Multi-Currency Support

- [ ] **Automatic currency detection**
- [ ] **Regional pricing strategies**
- [ ] **Tax calculation (Stripe Tax)**
- [ ] **Invoice customization**

### 🔄 Advanced Subscription Features

- [ ] **Multiple subscription tiers**
- [ ] **Add-on services**
- [ ] **Family/team plans**
- [ ] **Corporate subscriptions**

### 💸 Trainer Payout Infrastructure

- [ ] **Stripe Connect integration (for trainer payouts)**
  - [ ] Connect account creation for trainers
  - [ ] Identity verification requirements
  - [ ] Bank account connection
  - [ ] Automatic transfer scheduling
- [ ] **Alternative payout methods**
  - [ ] Manual bank transfers
  - [ ] PayPal integration
  - [ ] International payout support

### 🎯 Retention & Growth

- [ ] **Win-back campaigns for cancelled users**
- [ ] **Referral program integration**
- [ ] **Usage-based billing (future)**
- [ ] **Customer success triggers**

## Phase 10: Documentation & Maintenance

### 📚 Documentation

- [ ] **API documentation for Stripe integration**
- [ ] **Webhook event documentation**
- [ ] **Troubleshooting guides**
- [ ] **Runbook for production issues**

### 🔧 Maintenance & Updates

- [ ] **Regular Stripe SDK updates**
- [ ] **Webhook endpoint monitoring**
- [ ] **Failed payment recovery processes**
- [ ] **Subscription health checks**

---

## 🎯 Priority Order for Development

**Immediate (Week 1-2):**

- Phase 1: Database & Configuration Setup
- Phase 2: Core Stripe Integration
- Phase 3: Webhook Event Handling

**Short-term (Week 3-4):**

- Phase 4: Frontend Integration
- Phase 5: Testing & Quality Assurance

**Medium-term (Month 2):**

- Phase 6: Production Deployment
- Phase 7: Business Logic & Features

**Long-term (Month 3+):**

- Phase 8: One-Time Purchases
- Phase 9: Advanced Features
- Phase 10: Documentation & Maintenance
