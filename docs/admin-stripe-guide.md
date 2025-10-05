# 🔧 Admin Stripe Guide - Operations Runbook

Quick reference for common Stripe Dashboard tasks and operations.

---

## 🎯 Quick Access

**Stripe Dashboard**: https://dashboard.stripe.com

### Key Sections:

- **Payments** - All transactions and refunds
- **Connect** - Trainer accounts and payouts
- **Balance** - Platform balance and transfers
- **Reports** - Revenue, fees, earnings
- **Webhooks** - Event delivery monitoring
- **Settings** - Configuration and alerts

---

## 💸 Common Tasks

### 1. Issue a Refund

**When:** Client requests refund, service not delivered, payment issue

**Steps:**

1. Go to **Payments** in Stripe Dashboard
2. Search for payment by:
   - Client email
   - Amount
   - Date
   - Transaction ID
3. Click on the payment
4. Click **"Refund Payment"** button
5. Choose:
   - **Full refund**: Entire amount
   - **Partial refund**: Enter specific amount
6. Add reason (optional but recommended)
7. Click **"Refund"**

**What happens automatically:**

- ✅ Client receives money back
- ✅ Platform's 12% fee is reversed
- ✅ Trainer's payout is adjusted (clawed back)
- ✅ App receives `charge.refunded` webhook
- ✅ ServiceDelivery marked as refunded in database
- ✅ Trainer receives email notification

**Note:** Stripe fees are NOT refunded.

---

### 2. View Trainer Earnings

**When:** Checking trainer activity, investigating payout issues

**Steps:**

1. Go to **Connect** → **Accounts**
2. Search for trainer by:
   - Name
   - Email
   - Account ID
3. Click on trainer account
4. View tabs:
   - **Payments**: All charges to this account
   - **Payouts**: Payout history
   - **Balance**: Current balance
   - **Details**: Account info and verification status

**What you can see:**

- ✅ Total earnings
- ✅ Payout schedule
- ✅ Failed payouts (if any)
- ✅ Refunds and disputes
- ✅ Account verification status

---

### 3. Handle Payment Disputes

**When:** Client files chargeback with their bank

**Steps:**

1. **You'll receive email alert** when dispute is created
2. Go to **Payments** → **Disputes**
3. Click on the dispute
4. Review:
   - Dispute reason
   - Amount
   - Evidence deadline (CRITICAL - don't miss this!)
5. Click **"Submit Evidence"**
6. Upload:
   - Proof of service delivery
   - Communication with client
   - Terms of service agreement
   - Any other relevant documentation
7. Add written explanation
8. Click **"Submit"**

**Evidence deadline:**

- Usually 7-21 days from dispute creation
- **Missing deadline = automatic loss**
- Set calendar reminder immediately!

**App automation:**

- ✅ App receives `charge.dispute.created` webhook
- ✅ ServiceDelivery marked as disputed
- ✅ Admin email alert sent
- ✅ All tracked in database

**Outcomes:**

- **You win**: Keep the payment
- **You lose**: Payment reversed, funds returned to client
- **Inquiry resolved**: No chargeback filed

---

### 4. Check Platform Revenue

**When:** Monthly reporting, financial review

**Steps:**

1. Go to **Reports** → **Application fees**
2. Select date range
3. View:
   - Total application fees earned (your 12%)
   - Number of charges
   - Breakdown by trainer
4. Export to CSV for accounting

**Alternative: Balance Transactions**

1. Go to **Balance** → **Balance transactions**
2. Filter by:
   - Type: "Application fee"
   - Date range
3. See detailed breakdown

---

### 5. View Failed Payouts

**When:** Trainer reports not receiving payment

**Common reasons:**

- Bank account closed/invalid
- Bank rejected transfer
- Account verification issues
- Negative balance (refunds)

**Steps:**

1. Go to **Connect** → **Payouts**
2. Filter: **Status: Failed**
3. Click on failed payout
4. View failure reason
5. Check trainer's connected account:
   - Go to **Connect** → **Accounts** → [Trainer]
   - Check bank account details
   - Look for verification issues

**Resolution:**

1. Contact trainer
2. Ask them to update bank account in Stripe Dashboard
3. Stripe will automatically retry payout

---

### 6. Monitor Webhook Deliveries

**When:** Debugging issues, verifying events are processed

**Steps:**

1. Go to **Developers** → **Webhooks**
2. Click on your webhook endpoint
3. View:
   - Recent events
   - Success/failure status
   - Response codes
   - Event payload
4. **If failed:**
   - Click **"Resend"** to retry
   - Check app logs for errors

**Critical webhooks to monitor:**

- `checkout.session.completed` - Creates service deliveries
- `charge.refunded` - Tracks refunds
- `charge.dispute.created` - Alerts on disputes
- `invoice.payment_failed` - Grace period handling

---

### 7. Onboard New Trainer Team

**This is handled in the app**, but you can view in Stripe:

1. Trainer creates team in app
2. Goes through Stripe Connect onboarding
3. You can monitor in **Connect** → **Accounts**
4. Check verification status
5. Approve if needed (usually automatic)

**If trainer has onboarding issues:**

1. Go to **Connect** → **Accounts** → [Trainer]
2. Check "Verification" tab
3. See what documents/info is missing
4. Contact trainer to complete

---

## 🚨 Emergency Procedures

### Suspected Fraud

1. Go to **Payments** → Find transaction
2. Click **"Block customer"** if severe
3. Issue refund if necessary
4. Go to **Radar** → Add to block list
5. Document in internal notes

### Mass Refunds Needed

**Use Stripe CLI or API for bulk operations:**

```bash
# Contact support for bulk refund script
# Do NOT manually refund 100+ transactions
```

### Webhook Endpoint Down

1. Go to **Developers** → **Webhooks**
2. Check recent delivery failures
3. Fix app issue first
4. Use **"Resend"** for failed events (up to 72 hours)

---

## 📊 Regular Monitoring Tasks

### Daily:

- ✅ Check for new disputes (email alerts)
- ✅ Review failed webhooks
- ✅ Monitor for unusual refund activity

### Weekly:

- ✅ Review failed payouts
- ✅ Check platform balance
- ✅ Review application fee revenue

### Monthly:

- ✅ Generate revenue reports
- ✅ Review top earning trainers
- ✅ Check for inactive connected accounts
- ✅ Audit webhook delivery success rate

---

## ⚙️ Configuration & Settings

### Email Alerts (IMPORTANT!)

**Setup once, then forget:**

1. Go to **Settings** → **Email notifications**
2. Enable:

   - ✅ Failed payouts
   - ✅ Disputes created
   - ✅ Webhook failures
   - ✅ Verification issues
   - ✅ Balance alerts (when low)

3. Add admin emails to receive alerts

### Webhook Configuration

**Current webhooks (verify these are enabled):**

Critical:

- `checkout.session.completed`
- `charge.refunded` ✨ NEW
- `charge.dispute.created` ✨ NEW
- `invoice.payment_failed`
- `invoice.payment_succeeded`

Subscriptions:

- `subscription.created`
- `subscription.updated`
- `subscription.deleted`
- `customer.subscription.trial_will_end`

Cleanup:

- `checkout.session.expired`
- `customer.deleted`

**Endpoint URL:** `https://yourdomain.com/api/stripe/webhooks`

---

## 🔍 Troubleshooting Guide

### "Trainer says they weren't paid"

1. Check **Connect** → **Payouts**
2. Find trainer's account
3. Check payout status:
   - **Pending**: Still processing (wait 2-7 days)
   - **Paid**: Check their bank account/statement
   - **Failed**: See "Failed Payouts" section above
   - **Canceled**: Usually means negative balance

### "Client says they were double-charged"

1. Check **Payments** → Search by email
2. Look for duplicate charges
3. If duplicate: Issue refund for one
4. Check app logs for double submission

### "Refund not showing up"

1. Check **Payments** → Refunds filter
2. Verify refund was processed
3. Remind client: Refunds take 5-10 business days to appear
4. Check if refund failed (rare)

### "Webhook not firing"

1. **Developers** → **Webhooks** → Check delivery log
2. Look for errors
3. Check app server logs
4. Test webhook manually (click "Send test webhook")
5. Verify webhook signing secret is correct

---

## 📱 Mobile Access

**Stripe Dashboard works on mobile:**

- Use Stripe mobile app (iOS/Android)
- View payments, payouts, balance
- Receive push notifications for disputes
- Issue refunds on the go

---

## 🔐 Security Best Practices

### Access Control:

- ✅ Use separate accounts for each admin
- ✅ Enable 2FA (two-factor authentication)
- ✅ Use strong, unique passwords
- ✅ Don't share login credentials
- ✅ Audit team access quarterly

### API Keys:

- ✅ Keep secret keys in environment variables (never commit to git)
- ✅ Use restricted keys when possible
- ✅ Rotate keys if compromised
- ✅ Test mode keys for development only

### Webhook Security:

- ✅ Always verify webhook signatures
- ✅ Use HTTPS only
- ✅ Keep webhook secret secure

---

## 📞 When to Contact Stripe Support

**Contact Stripe for:**

- Connected account verification issues
- Payout holds or delays
- Technical API/webhook issues
- Questions about fees or pricing
- Disputes requiring additional help

**How to contact:**

- Stripe Dashboard → **Support** button
- Email: support@stripe.com
- 24/7 availability for urgent issues

---

## 📈 Advanced Features (Optional)

### Instant Payouts

- Enable for trainers (0.5% fee)
- They can trigger instant transfer to debit card
- Configure in **Connect** settings

### Custom Payout Schedules

- Change from rolling to daily/weekly/monthly
- Per connected account basis
- Configure in trainer's account settings

### Multi-Currency Support

- Accept payments in multiple currencies
- Configure presentment currency
- Check exchange rate fees

---

## ✅ Monthly Checklist

Copy this for your operations team:

```
[ ] Review dispute win/loss rate
[ ] Check for aged/unresolved disputes
[ ] Audit failed payout reasons
[ ] Review top 10 earning trainers
[ ] Check webhook delivery success rate (should be >99%)
[ ] Verify email alerts are working
[ ] Review platform revenue vs. projections
[ ] Check for suspicious refund patterns
[ ] Update this document if processes changed
[ ] Train new admin team members
```

---

## 📚 Additional Resources

- **Stripe Dashboard**: https://dashboard.stripe.com
- **Stripe Connect Docs**: https://stripe.com/docs/connect
- **Stripe Support**: https://support.stripe.com
- **API Reference**: https://stripe.com/docs/api

---

## 🆘 Emergency Contacts

**Platform Team:**

- Email: support@hypro.app
- Slack: #platform-team
- On-call: [Your on-call rotation]

**Stripe Support:**

- Dashboard → Support
- Email: support@stripe.com
- Phone: Available in Dashboard

---

**Last Updated**: January 2025  
**Version**: 2.0 (Updated for 12% application fee and new webhooks)  
**Maintained by**: Platform Team
