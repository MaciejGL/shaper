# Subscription Testing Flows

## Automated Tests

**Run unit tests:**

```bash
npm test subscription-switching
npm test coaching-pause-resume
```

**Coverage:**

- ✅ Monthly → Coaching (proration detection)
- ✅ Yearly + Coaching (pause/resume)
- ✅ Trainer pause/resume mutations
- ✅ Edge cases & error handling

---

## Manual Testing Setup

1. Run codegen: `pnpm run codegen`
2. Verify Stripe webhooks enabled: `subscription.created`, `subscription.updated`, `subscription.deleted`, `invoice.payment_succeeded`
3. Disable "Switch to Coaching" in Stripe Customer Portal

---

## Flow 1: Monthly Premium → Coaching

**User:** Has monthly premium subscription  
**Action:** Accepts trainer offer for coaching

**Expected:**

- ✅ Subscription modified (not new one created)
- ✅ Prorated charge appears
- ✅ ONE subscription in database
- ✅ Trainer assigned to user

**Where to check:**

- Stripe Dashboard → Subscriptions → User subscription → Events
- Database → `UserSubscription` table (only 1 record)
- App → User has coaching access + trainer assigned

---

## Flow 2: Yearly Premium → Coaching

**User:** Has yearly premium subscription  
**Action:** Accepts trainer offer for coaching

**Expected:**

- ✅ Yearly subscription paused in Stripe (metadata: `pausedForCoaching: true`)
- ✅ TWO subscriptions in database (yearly + coaching)
- ✅ No yearly charges while coaching active
- ✅ Trainer assigned to user

**Where to check:**

- Stripe Dashboard → Yearly subscription → Pause status
- Stripe Dashboard → Subscription metadata
- Database → `UserSubscription` table (2 records)

---

## Flow 3: Coaching Ends → Yearly Resumes

**User:** Has paused yearly + active coaching  
**Action:** Cancels coaching subscription

**Expected:**

- ✅ Yearly subscription automatically resumes
- ✅ Pause removed in Stripe
- ✅ Yearly billing restarts
- ✅ Trainer assignment removed

**Where to check:**

- Stripe Dashboard → Yearly subscription (no pause)
- Stripe Dashboard → Next billing date extended
- Database → User `trainerId` = null

---

## Flow 4: Trainer Pauses Coaching

**User:** Active coaching subscription  
**Action:** Trainer clicks "Pause Coaching" in client dashboard

**Expected:**

- ✅ Coaching subscription paused in Stripe (metadata: `manuallyPausedByTrainer: true`)
- ✅ No charges during pause
- ✅ UI shows "Paused" status
- ✅ Yearly premium (if exists) remains paused

**Where to check:**

- Trainer Dashboard → Client Info tab → Subscription card shows "Paused"
- Stripe Dashboard → Coaching subscription → Pause status
- Stripe Dashboard → Subscription metadata

---

## Flow 5: Trainer Resumes Coaching

**User:** Paused coaching subscription  
**Action:** Trainer clicks "Resume Coaching" in client dashboard

**Expected:**

- ✅ Coaching subscription resumed in Stripe
- ✅ Billing restarts (may be prorated)
- ✅ UI shows "Active" status
- ✅ Yearly premium still paused (if exists)

**Where to check:**

- Trainer Dashboard → Client Info tab → Subscription card shows "Active"
- Stripe Dashboard → Coaching subscription (no pause)
- Stripe Dashboard → Next invoice preview

---

## Edge Cases

### Client Cancels While Paused

- User manually paused by trainer
- User cancels via Stripe portal
- Expected: Yearly premium resumes, trainer removed

### Long Coaching Period

- User stays on coaching for 11+ months
- Expected: Yearly pause remains (until 1 year Stripe limit)

### Multiple Switches

- Monthly → Coaching → Cancel → Monthly → Coaching
- Expected: Each switch handled independently, no duplicate subscriptions

---

## Quick Verification Commands

**Check DB subscriptions:**

```sql
SELECT u.email, us.status, pt.name, us.trainerId
FROM UserSubscription us
JOIN User u ON us.userId = u.id
JOIN PackageTemplate pt ON us.packageId = pt.id
WHERE u.email = 'test@example.com';
```

**Check Stripe subscription:**

```bash
stripe subscriptions retrieve sub_xxx
```
