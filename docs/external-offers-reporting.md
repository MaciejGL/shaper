# External Offers Reporting System

This document describes how Hypertro reports Premium subscription transactions to Google Play for External Offers program compliance.

## Overview

When users subscribe to Premium via the Android app, we must report transactions to Google Play to comply with their External Offers program. This incurs a fee (4% in EEA, 27% in US) but allows us to use Stripe as our payment processor instead of Google Play Billing.

### Key Principles

1. **Web subscriptions are never reported** - Google has no jurisdiction over web purchases
2. **iOS companion mode is never reported** - No external payment allowed in Norway iOS
3. **Android full mode requires reporting** - All purchases, renewals, and refunds
4. **Token required for initial purchase only** - Renewals reference the initial transaction

---

## Payment Rules by Region and Platform

```
┌─────────┬─────────────────┬─────────────────┬─────────────────┐
│ Region  │ iOS             │ Android         │ Web             │
├─────────┼─────────────────┼─────────────────┼─────────────────┤
│ Norway  │ companion       │ full (4% fee)   │ full            │
│ EU      │ full            │ full (4% fee)   │ full            │
│ US      │ full            │ full (27% fee)  │ full            │
│ Default │ companion       │ companion       │ full            │
└─────────┴─────────────────┴─────────────────┴─────────────────┘

companion = No in-app purchase UI, no reporting required
full      = Full purchase flow, reporting required (Android only)
```

---

## Database Schema

```prisma
model UserSubscription {
  // ... existing fields ...

  // External Offers tracking
  externalOfferToken     String?   // Token from Android app (initial purchase only)
  initialStripeInvoiceId String?   // First invoice ID (used for renewals/refunds)
  originPlatform         String?   // 'android' | 'ios' | null (web)
}
```

---

## Flow Diagrams

### Flow 1: Web Subscription (No Reporting)

```
┌─────────────────────────────────────────────────────────────────┐
│                     WEB SUBSCRIPTION                            │
└─────────────────────────────────────────────────────────────────┘

User (Browser)
    │
    ▼
┌─────────────────────┐
│ /offers page        │
│ platform = undefined│
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ POST /api/stripe/   │
│ create-checkout     │
│ platform: ''        │
│ extToken: undefined │
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ Stripe Checkout     │
│ metadata.platform=''│
└─────────────────────┘
    │
    ▼ (payment succeeds)
    │
┌─────────────────────┐
│ payment-succeeded   │
│ webhook             │
├─────────────────────┤
│ platform = null     │
│ (empty string → null│
└─────────────────────┘
    │
    ▼
┌─────────────────────┐
│ reportTransaction() │
├─────────────────────┤
│ platform === null   │
│ → EARLY RETURN      │
│ → NO REPORTING      │
└─────────────────────┘
```

**Result:** Web subscriptions are never reported to Google.

---

### Flow 2: iOS Subscription - Norway (Companion Mode, No Reporting)

```
┌─────────────────────────────────────────────────────────────────┐
│                iOS SUBSCRIPTION (NORWAY)                        │
└─────────────────────────────────────────────────────────────────┘

User (iOS App - Norway)
    │
    ▼
┌─────────────────────┐
│ Companion Mode      │
│ No upgrade UI shown │
│ Must use web to     │
│ subscribe           │
└─────────────────────┘
    │
    ▼ (user uses web)
    │
    Same as Web Flow → NO REPORTING
```

**Result:** iOS Norway users subscribe via web, no reporting needed.

---

### Flow 3: Android Initial Purchase (Full Mode, Reported)

```
┌─────────────────────────────────────────────────────────────────┐
│              ANDROID INITIAL PURCHASE                           │
└─────────────────────────────────────────────────────────────────┘

User (Android App)
    │
    ▼
┌─────────────────────────────────────────┐
│ /offers page (WebView)                  │
│ useMobileApp() → isAndroid = true       │
└─────────────────────────────────────────┘
    │
    ▼ (user clicks Subscribe)
    │
┌─────────────────────────────────────────┐
│ getExternalOfferToken()                 │
│ ├── checkAlternativeBillingAvailable()  │
│ └── createAlternativeBillingToken()     │
│     → returns 'ext_token_abc123...'     │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ POST /api/stripe/create-checkout        │
│ {                                       │
│   platform: 'android',                  │
│   extToken: 'ext_token_abc123...'       │
│ }                                       │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Stripe Checkout Session Created         │
│ subscription_data.metadata:             │
│   platform: 'android'                   │
│   extToken: 'ext_token_abc123...'       │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ openExternalCheckout(url)               │
│ ├── showAlternativeBillingDialog()      │
│ └── WebBrowser.openBrowserAsync()       │
│     → Opens Chrome Custom Tabs          │
└─────────────────────────────────────────┘
    │
    ▼ (user completes payment)
    │
┌─────────────────────────────────────────┐
│ Stripe Webhook: invoice.payment_succeeded│
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ payment-succeeded.ts                    │
│                                         │
│ billing_reason === 'subscription_create'│
│ → isInitialPurchase = true              │
└─────────────────────────────────────────┘
    │
    ├────────────────────────────────────┐
    │ Save to DB:                        │
    │   originPlatform: 'android'        │
    │   externalOfferToken: 'ext_...'    │
    │   initialStripeInvoiceId: 'in_xxx' │
    └────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ reportTransaction({                     │
│   stripeTransactionId: 'in_xxx',        │
│   transactionType: 'purchase',          │
│   platform: 'android',                  │
│   externalOfferToken: 'ext_token_...'   │
│ })                                      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ report-transaction.ts                   │
│                                         │
│ platform === 'android' ✓                │
│ getRegionFromTimezone() → 'NO'          │
│ PAYMENT_RULES['NO']['android']          │
│   → paymentModel: 'full' ✓              │
│ getCountryCodeFromTimezone() → 'NO'     │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ reportToGoogle({                        │
│   externalTransactionId: 'in_xxx',      │
│   transactionType: 'purchase',          │
│   countryCode: 'NO',                    │
│   externalOfferToken: 'ext_token_...',  │
│   amount: 9900,  // cents               │
│   currency: 'NOK'                       │
│ })                                      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Google Play API                         │
│ createexternaltransaction({             │
│   parent: 'applications/app.hypertro',  │
│   externalTransactionId: 'in_xxx',      │
│   requestBody: {                        │
│     transactionTime: '2025-12-12...',   │
│     userTaxAddress: { regionCode: 'NO' }│
│     currentPreTaxAmount: {              │
│       priceMicros: '990000000',         │
│       currency: 'NOK'                   │
│     },                                  │
│     recurringTransaction: {             │
│       externalTransactionToken: '...',  │  ← TOKEN REQUIRED
│       externalSubscription: {           │
│         subscriptionType: 'RECURRING'   │
│       }                                 │
│     }                                   │
│   }                                     │
│ })                                      │
└─────────────────────────────────────────┘
```

**Result:** Initial Android purchase is reported to Google with the token.

---

### Flow 4: Android Renewal (Automatic, Reported)

```
┌─────────────────────────────────────────────────────────────────┐
│              ANDROID SUBSCRIPTION RENEWAL                       │
└─────────────────────────────────────────────────────────────────┘

(No user action - Stripe auto-renews)
    │
    ▼
┌─────────────────────────────────────────┐
│ Stripe charges saved payment method     │
│ Creates new invoice: 'in_yyy'           │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Stripe Webhook: invoice.payment_succeeded│
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ payment-succeeded.ts                    │
│                                         │
│ billing_reason !== 'subscription_create'│
│ → isInitialPurchase = false (renewal)   │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Load from DB:                           │
│   subscription.originPlatform: 'android'│
│   subscription.initialStripeInvoiceId:  │
│     'in_xxx' (original invoice)         │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ reportTransaction({                     │
│   stripeTransactionId: 'in_yyy', ← NEW  │
│   transactionType: 'renewal',           │
│   platform: 'android',       ← FROM DB  │
│   initialExternalTransactionId: 'in_xxx'│
│                              ↑ FROM DB  │
│ })                                      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ reportToGoogle({                        │
│   externalTransactionId: 'in_yyy',      │
│   transactionType: 'renewal',           │
│   initialExternalTransactionId: 'in_xxx'│
│ })                                      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ Google Play API                         │
│ createexternaltransaction({             │
│   externalTransactionId: 'in_yyy',      │
│   requestBody: {                        │
│     recurringTransaction: {             │
│       initialExternalTransactionId:     │
│         'in_xxx',            ← LINKS TO │
│                                ORIGINAL │
│       externalSubscription: {           │
│         subscriptionType: 'RECURRING'   │
│       }                                 │
│     }                                   │
│   }                                     │
│ })                                      │
└─────────────────────────────────────────┘
```

**Result:** Renewal is reported to Google, linked to the original transaction.

---

### Flow 5: Refund (Reported for Android Subscriptions)

```
┌─────────────────────────────────────────────────────────────────┐
│                      REFUND                                     │
└─────────────────────────────────────────────────────────────────┘

Admin issues refund in Stripe Dashboard
    │
    ▼
┌─────────────────────────────────────────┐
│ Stripe Webhook: charge.refunded         │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ charge-refunded.ts                      │
│                                         │
│ Find user by Stripe customer ID         │
│ Call reportRefund()                     │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ report-refund.ts                        │
│                                         │
│ Find Premium subscription for user      │
│ Load:                                   │
│   originPlatform: 'android'             │
│   initialStripeInvoiceId: 'in_xxx'      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ reportTransaction({                     │
│   transactionType: 'refund',            │
│   platform: 'android',                  │
│   initialExternalTransactionId: 'in_xxx'│
│ })                                      │
└─────────────────────────────────────────┘
    │
    ▼
┌─────────────────────────────────────────┐
│ reportToGoogle() - REFUND               │
│                                         │
│ Google Play API                         │
│ refundexternaltransaction({             │
│   name: 'applications/.../             │
│          externalTransactions/in_xxx',  │
│   requestBody: {                        │
│     fullRefund: {},                     │
│     refundTime: '2025-12-12...'         │
│   }                                     │
│ })                                      │
└─────────────────────────────────────────┘
```

**Result:** Refund is reported to Google, referencing the original transaction.

---

## Files Involved

| File                                                        | Purpose                                           |
| ----------------------------------------------------------- | ------------------------------------------------- |
| `src/config/payment-rules.ts`                               | Defines which regions/platforms require reporting |
| `src/lib/external-reporting/types.ts`                       | TypeScript interfaces                             |
| `src/lib/external-reporting/report-transaction.ts`          | Entry point, checks rules and dispatches          |
| `src/lib/external-reporting/google.ts`                      | Google Play API calls                             |
| `src/lib/external-reporting/report-refund.ts`               | Refund-specific helper                            |
| `src/app/api/stripe/webhooks/handlers/payment-succeeded.ts` | Handles purchases and renewals                    |
| `src/app/api/stripe/webhooks/handlers/charge-refunded.ts`   | Handles refunds                                   |
| `src/app/api/stripe/create-checkout-session/route.ts`       | Stores platform/token in Stripe metadata          |
| `expo-app/services/external-offers.ts`                      | Native token generation                           |
| `expo-app/components/enhanced-webview.tsx`                  | Bridge for web↔native communication              |
| `src/components/mobile-app-bridge.tsx`                      | Web-side bridge interface                         |
| `src/app/(protected)/account-management/offers/page.tsx`    | Subscription UI                                   |

---

## Decision Matrix

```
┌────────────────────┬────────────┬───────────┬──────────────────┐
│ Condition          │ Report?    │ Token?    │ Reference ID?    │
├────────────────────┼────────────┼───────────┼──────────────────┤
│ Web purchase       │ NO         │ -         │ -                │
│ iOS companion      │ NO         │ -         │ -                │
│ iOS full (future)  │ YES (Apple)│ TBD       │ TBD              │
│ Android purchase   │ YES        │ REQUIRED  │ -                │
│ Android renewal    │ YES        │ NO        │ initialInvoiceId │
│ Android refund     │ YES        │ NO        │ initialInvoiceId │
│ Unknown platform   │ NO         │ -         │ -                │
│ Unknown region     │ NO         │ -         │ -                │
└────────────────────┴────────────┴───────────┴──────────────────┘
```

---

## Error Handling

| Scenario                              | Behavior                                  |
| ------------------------------------- | ----------------------------------------- |
| No token for Android initial purchase | Skip reporting, log warning               |
| No initialStripeInvoiceId for renewal | Skip reporting, log warning               |
| Unknown timezone/country              | Skip reporting, log warning               |
| Google API call fails                 | Log error, continue (don't block payment) |
| User not found                        | Log error, continue                       |

All reporting errors are **non-blocking** - the payment/refund still succeeds even if reporting fails.
