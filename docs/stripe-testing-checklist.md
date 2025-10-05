# 🧪 Stripe Testing Checklist

Complete testing guide for verifying your Stripe implementation works correctly.

---

## 🎯 Prerequisites

Before testing:

- [ ] Week 1 code changes deployed
- [ ] Database migration completed
- [ ] Webhook endpoint is accessible
- [ ] You have access to Stripe test mode Dashboard

**Test Mode Dashboard**: https://dashboard.stripe.com/test

---

## 🧪 Test 1: Basic Payment Flow

**What we're testing:** Full offer → payment → service delivery creation

### Steps:

1. **Create a test offer in the app**

   - Login as trainer
   - Create new offer for a test client email
   - Copy offer URL

2. **Complete payment with test card**

   - Open offer URL in incognito window
   - Enter test card: `4242 4242 4242 4242`
   - Expiry: Any future date (e.g., `12/25`)
   - CVC: Any 3 digits (e.g., `123`)
   - Complete checkout

3. **Verify in Stripe Dashboard (test mode)**

   - Go to **Payments** → Find your payment
   - Check amount is correct
   - Click on payment → See metadata includes:
     - `offerToken`
     - `trainerId`
     - `platformFeePercent: 12`
   - Go to **Connect** → **Transfers**
   - Verify transfer to trainer's connected account

4. **Verify in app database**
   ```sql
   SELECT * FROM "ServiceDelivery" WHERE "clientEmail" = 'test@example.com' ORDER BY "createdAt" DESC LIMIT 1;
   ```
   - Check `status` is created correctly
   - Check `stripePaymentIntentId` is populated
   - Check trainer is linked

### ✅ Success Criteria:

- [ ] Payment shows in Stripe Dashboard
- [ ] 12% application fee calculated correctly
- [ ] ServiceDelivery created in database
- [ ] Client has premium access (if applicable)

---

## 🧪 Test 2: Verify 12% Application Fee Split

**What we're testing:** Platform gets exactly 12%, trainer gets 88%

### Steps:

1. **Make test payment for 1000 NOK**

   - Use offer with known amount
   - Complete checkout with test card

2. **Check Stripe Dashboard → Payments**

   - Find your payment
   - **Total amount**: 1000 NOK
   - **Application fee**: Should be ~120 NOK (12%)
   - **Transfer to trainer**: Should be ~880 NOK (88%)

3. **Go to Balance → Balance transactions**
   - Filter by your payment
   - Verify:
     - Platform receives: 12% application fee
     - Stripe processing fee shown separately (~16 NOK)
     - Trainer receives: Remainder

### 📊 Expected Math:

```
Client pays: 1000 NOK
Stripe fee: ~16 NOK (1.4% + 2 NOK)
Net amount: 984 NOK

Split (on net amount):
  Platform (12%): ~118 NOK
  Trainer (88%): ~866 NOK
```

### ✅ Success Criteria:

- [ ] Application fee is 12% of total
- [ ] Math adds up correctly
- [ ] Transfer to trainer is correct

---

## 🧪 Test 3: Refund Flow

**What we're testing:** Refund reverses fee and updates database

### Steps:

1. **Create and complete a test payment** (from Test 1)

2. **Issue refund in Stripe Dashboard**

   - Go to **Payments** → Find payment
   - Click **"Refund"**
   - Choose **Full refund**
   - Add reason: "Testing refund flow"
   - Click **Refund**

3. **Verify webhook fired**

   - Go to **Developers** → **Webhooks** → Your endpoint
   - Find `charge.refunded` event
   - Check status is **200 OK**
   - View payload and response

4. **Check app database**

   ```sql
   SELECT
     "refundedAt",
     "refundReason",
     "stripePaymentIntentId"
   FROM "ServiceDelivery"
   WHERE "stripePaymentIntentId" = 'pi_xxx';
   ```

   - `refundedAt` should be populated
   - `refundReason` should have value

5. **Check app logs**

   - Should see: `✅ Processed refund for charge...`
   - Should see: `📧 Refund notification sent to trainer...`

6. **Verify in Stripe Dashboard**
   - Go to payment → **Refunds** tab
   - See full refund listed
   - Check **Application fee** was **reversed**
   - Go to **Connect** → Trainer account
   - Verify balance adjustment (clawback)

### ✅ Success Criteria:

- [ ] Webhook received and processed
- [ ] ServiceDelivery marked as refunded
- [ ] Application fee reversed in Stripe
- [ ] Trainer balance adjusted
- [ ] Email sent to trainer (check logs)

---

## 🧪 Test 4: Dispute Tracking

**What we're testing:** Dispute webhook updates database and alerts admin

### Steps:

1. **Create test payment**

2. **Create dispute in Stripe test mode**

   - Go to **Payments** → Find payment
   - Click on payment
   - Click **"Actions"** → **"Create dispute"** (test mode only)
   - Choose dispute reason
   - Submit

3. **Verify webhook fired**

   - Go to **Developers** → **Webhooks**
   - Find `charge.dispute.created` event
   - Check status is **200 OK**

4. **Check app database**

   ```sql
   SELECT
     "disputedAt",
     "disputeStatus",
     "stripePaymentIntentId"
   FROM "ServiceDelivery"
   WHERE "stripePaymentIntentId" = 'pi_xxx';
   ```

   - `disputedAt` should be populated
   - `disputeStatus` should show dispute status

5. **Check email was sent**
   - Look in app logs for: `📧 Dispute alert sent to admin...`
   - Check admin email inbox (if configured)

### ✅ Success Criteria:

- [ ] Webhook processed successfully
- [ ] ServiceDelivery marked as disputed
- [ ] Admin received email alert
- [ ] Can view dispute in Stripe Dashboard

---

## 🧪 Test 5: Offer Expiration

**What we're testing:** Expired checkout marks offer as EXPIRED

### Steps:

1. **Create test offer**

   - Create offer in app
   - Get checkout URL

2. **Start checkout but don't complete**

   - Open checkout page
   - Enter email
   - **Don't enter payment details**
   - Wait for session to expire (or use Stripe test mode to expire manually)

3. **Manually expire in Stripe Dashboard (faster)**

   - Go to **Payments** → **Checkout Sessions**
   - Find your session (status: open)
   - Click **"Actions"** → **"Expire session"**

4. **Check webhook**

   - **Developers** → **Webhooks**
   - Find `checkout.session.expired` event
   - Verify 200 OK response

5. **Check offer status in database**

   ```sql
   SELECT "status", "token", "updatedAt"
   FROM "TrainerOffer"
   WHERE "token" = 'your_offer_token';
   ```

   - Status should be: `EXPIRED`

6. **Check logs**
   - Should see: `⏰ Marked offer xxx as EXPIRED...`
   - Should see: `📧 TODO: Send offer expired notification...`

### ✅ Success Criteria:

- [ ] Webhook processed
- [ ] Offer marked as EXPIRED
- [ ] Log message shows proper handling

---

## 🧪 Test 6: Grace Period (Already Working!)

**What we're testing:** Failed payment → 3 day grace period → access removed

### Steps:

1. **Create subscription offer** (monthly coaching)

2. **Complete with test card**

   - Use: `4242 4242 4242 4242`
   - Complete payment

3. **Simulate payment failure**

   - Go to **Customers** in Stripe Dashboard
   - Find customer
   - Go to **Subscriptions** tab
   - Update payment method to failing card: `4000 0000 0000 0341`
   - Wait for next billing cycle OR trigger invoice manually:
     - Click subscription → **"Send invoice"**

4. **Verify grace period set**

   ```sql
   SELECT
     "status",
     "isInGracePeriod",
     "gracePeriodEnd"
   FROM "UserSubscription"
   WHERE "userId" = 'test_user_id';
   ```

   - `isInGracePeriod` should be `true`
   - `gracePeriodEnd` should be ~3 days from now
   - User should still have access

5. **Check email sent**

   - Look for payment failed email
   - Should mention 3-day grace period

6. **After 3 days** (or manually trigger subscription.deleted):
   - User should lose premium access
   - Subscription status: canceled

### ✅ Success Criteria:

- [ ] Failed payment triggers grace period
- [ ] User keeps access for 3 days
- [ ] Email notification sent
- [ ] After 3 days, access removed

---

## 🧪 Test 7: Multiple Webhooks Integration

**What we're testing:** All webhooks work together correctly

### Complete Flow Test:

1. **Create offer** → Verify offer in DB
2. **Complete payment** → Verify ServiceDelivery created
3. **Issue refund** → Verify marked as refunded
4. **Create new offer** → Start checkout → Expire
5. **Verify offer expired** correctly

### ✅ Success Criteria:

- [ ] No webhook delivery failures
- [ ] All database updates correct
- [ ] No errors in app logs
- [ ] Stripe Dashboard matches app database

---

## 🚨 Common Issues & Fixes

### Webhook Not Firing

**Symptoms:** Event shows in Stripe but handler not called

**Check:**

1. Webhook endpoint URL is correct
2. Endpoint is publicly accessible (use ngrok for local testing)
3. Webhook signing secret is correct in `.env`
4. Check webhook event list includes the event type

**Fix:**

```bash
# Use Stripe CLI for local testing
stripe listen --forward-to localhost:3000/api/stripe/webhooks
```

---

### Application Fee Not Showing

**Symptoms:** Payment successful but no application fee in Stripe

**Check:**

1. Trainer has `stripeConnectedAccountId` set
2. Payment mode uses `payment_intent_data` with `application_fee_amount`
3. Subscription mode uses `application_fee_percent: 12`

**Fix:** Check logs for "Revenue sharing enabled" message

---

### Refund Not Updating Database

**Symptoms:** Refund processed but ServiceDelivery not marked

**Check:**

1. `charge.refunded` webhook is registered
2. Webhook fired successfully (check Stripe Dashboard)
3. Check app logs for errors
4. Verify `stripePaymentIntentId` matches

**Fix:** Resend webhook from Stripe Dashboard → Webhooks → Event → Resend

---

### Dispute Not Creating Alert

**Symptoms:** Dispute created but no admin email

**Check:**

1. `charge.dispute.created` webhook registered
2. Admin user exists with role 'ADMIN'
3. Email service is configured
4. Check logs for email send errors

---

## 📊 Testing Checklist Summary

After completing all tests, you should have verified:

**Week 1 Implementation:**

- [x] 12% platform fee applied correctly
- [x] Revenue calculations automatic (no manual math)
- [x] Refund webhooks track refunds in database
- [x] Dispute webhooks alert admins
- [x] Old duplicate webhooks removed
- [x] Database migrations applied

**Week 2 Implementation:**

- [ ] Checkout expiration marks offers as EXPIRED
- [ ] Documentation created for trainers
- [ ] Documentation created for admins
- [ ] All webhooks deliver successfully
- [ ] No errors in production logs

**Financial Accuracy:**

- [ ] 12% platform fee is correct
- [ ] Trainer receives 88% (minus Stripe fees)
- [ ] Refunds reverse fees correctly
- [ ] Disputes tracked properly

---

## 🎯 Final Production Checklist

Before going live:

**Configuration:**

- [ ] Switch Stripe to **live mode**
- [ ] Update webhook endpoint to production URL
- [ ] Verify webhook signing secret (live mode)
- [ ] Enable Stripe email alerts (Settings → Notifications)

**Webhooks (Live Mode):**

- [ ] Add production webhook endpoint in Stripe Dashboard
- [ ] Enable all required events (see admin guide)
- [ ] Test with real small payment

**Monitoring:**

- [ ] Set up error alerts (Sentry/similar)
- [ ] Configure admin email alerts in Stripe
- [ ] Add webhook delivery monitoring
- [ ] Set up daily revenue reports

**Documentation:**

- [ ] Share trainer-payouts.md with trainers
- [ ] Share admin-stripe-guide.md with admin team
- [ ] Update internal wiki with process docs

---

## 📞 Need Help?

**If tests fail:**

1. Check Stripe Dashboard → Webhooks for delivery errors
2. Check app logs for error messages
3. Review this checklist step-by-step
4. Contact platform team

**Test Mode Resources:**

- Test cards: https://stripe.com/docs/testing
- Webhook testing: https://stripe.com/docs/webhooks/test
- Stripe CLI: https://stripe.com/docs/stripe-cli

---

**Last Updated**: January 2025  
**Next Review**: After production deployment
