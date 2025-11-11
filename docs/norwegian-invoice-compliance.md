# Norwegian Invoice Compliance - Setup Guide

## Overview

This guide explains how to configure Stripe invoices to comply with Norwegian regulations, including:

- Organization number display
- 0% VAT line items
- Supplier attribution for trainer services
- Clean discount naming

## Environment Variables

Add these to your `.env` file:

```bash
# Norwegian Invoice Compliance
STRIPE_SHOW_ZERO_VAT_ON_INVOICE=true
STRIPE_NORWEGIAN_ORG_NUMBER=936343503
STRIPE_TAX_RATE_0_PERCENT=txr_xxxxx  # Get from Stripe Dashboard (see below)
```

### Variable Descriptions

- **SHOW_ZERO_VAT_ON_INVOICE**: Set to `true` to show 0% VAT line on invoices. Set to `false` after VAT registration to enable automatic Stripe Tax.
- **NORWEGIAN_ORG_NUMBER**: Your Norwegian organization number (shows on invoices).
- **STRIPE_TAX_RATE_0_PERCENT**: The Stripe tax rate ID for 0% VAT (created in Dashboard).

## Stripe Dashboard Setup

### Step 1: Create 0% VAT Tax Rate

1. Go to **Stripe Dashboard** → **Products** → **Tax Rates**
2. Click **"+ New"**
3. Configure:
   - **Display name**: VAT
   - **Percentage**: 0
   - **Description**: Not VAT registered
   - **Country**: NO (Norway)
   - **Inclusive**: No
4. Click **Save**
5. Copy the tax rate ID (starts with `txr_`)
6. Add to `.env` as `STRIPE_TAX_RATE_0_PERCENT=txr_xxxxx`

### Step 2: Verify Invoice Footer

1. Go to **Dashboard** → **Settings** → **Billing** → **Invoices**
2. Under **"Default footer"**, verify it shows:
   ```
   Org. nr: 936343503
   VAT 0%. Not VAT-registered.
   ```
3. This should already be configured

### Step 3: (Optional) Create Custom Invoice Template

For additional customization:

1. Go to **Dashboard** → **Billing** → **Invoices** → **Templates**
2. Click **"+ Create template"**
3. Name: "Norwegian Compliance"
4. Add custom fields:
   - Use `{{invoice.metadata.norwegian_org_number}}` for org number
   - Use `{{invoice.metadata.supplier_name}}` for supplier attribution
5. Customize footer with Norwegian compliance text
6. Save and set as default

## How It Works

### For Platform Subscriptions

When users purchase Hypertro Premium subscriptions:

- Invoice shows org number in footer
- 0% VAT line appears in breakdown
- Tax metadata attached to invoice

### For Trainer Services

When trainers sell services to clients:

- Invoice shows org number in footer
- 0% VAT line appears in breakdown
- Supplier attribution in metadata: "Business Name - Trainer Name"
- Supplier info fetched from Stripe Connect account (if configured)

### Discount Coupons

- Coupon names simplified to avoid redundancy
- Stripe automatically adds percentage, so we show "In-Person Sessions Discount"
- Invoice displays as: "In-Person Sessions Discount (50% off)"

## Testing

After setup:

1. **Deploy code changes** to production
2. **Restart application** to load new environment variables
3. **Create a NEW test checkout** (old invoices won't change)
4. **Verify invoice shows**:
   - ✅ Org number in footer
   - ✅ VAT (0%) line in breakdown
   - ✅ Clean discount text (no redundant percentage)
   - ✅ Supplier name in metadata (for trainer services)

## Expected Invoice Output

```
Premium Personal Trainer Coaching    1,799.00kr
In-Person Training Session              899.00kr
                                      ----------
Subtotal                              2,698.00kr
VAT (0%)                                  0.00kr
In-Person Sessions Discount (50%)      -449.50kr
                                      ----------
Total                                 2,248.50kr

Org. nr: 936343503
VAT 0%. Not VAT-registered.
Services provided by: [Business Name - Trainer Name]
```

## Transition to VAT Registration

When you become VAT registered:

1. **Update environment variable**:

   ```bash
   SHOW_ZERO_VAT_ON_INVOICE=false
   ```

2. **Enable Stripe Tax**:

   - Go to Dashboard → Settings → Tax
   - Enable Stripe Tax
   - Configure VAT registration details

3. **Restart application**

4. **Result**: Stripe will automatically calculate VAT based on customer location:
   - Norway customers: 25% VAT
   - EU customers: Applicable country VAT rate
   - Outside EU: 0% VAT
   - B2B with VAT number: Reverse charge (0%)

## Troubleshooting

### VAT line not showing

Check:

- `STRIPE_SHOW_ZERO_VAT_ON_INVOICE=true` in `.env`
- `STRIPE_TAX_RATE_0_PERCENT` has valid tax rate ID
- Application restarted after `.env` changes
- Tax rate exists in Stripe Dashboard

### Org number not visible

Check:

- `STRIPE_NORWEGIAN_ORG_NUMBER` set in `.env`
- Invoice footer configured in Dashboard
- Metadata appears on invoice (may need custom template)

### Supplier name not showing

Check:

- Trainer has profile with first/last name
- Trainer has Stripe Connect account (for business name)
- Metadata key `supplier_name` exists on invoice
- Use custom invoice template to display prominently

### Discount text still redundant

- Old coupons won't update automatically
- Create new test checkout to generate new coupon
- Or manually rename existing coupons in Dashboard

## Key Implementation Details

### Coupon Compatibility

- Uses predefined Stripe price IDs (not inline `price_data`)
- Required for coupons with product restrictions
- Supplier attribution stored in metadata, not product names

### Metadata Fields

Invoices include these metadata fields:

- `norwegian_org_number`: Organization number
- `supplier_name`: Full supplier attribution
- `supplier_label`: Label for supplier field

### File Changes

Implementation files:

- `src/lib/stripe/invoice-config.ts` - Configuration
- `src/lib/stripe/connect-utils.ts` - Stripe Connect utilities
- `src/app/api/stripe/create-checkout-session/route.ts` - Platform checkout
- `src/app/api/stripe/create-trainer-checkout/route.ts` - Trainer checkout
- `src/lib/stripe/discount-utils.ts` - Discount naming

## Support

For issues or questions:

- Check this documentation
- Review Stripe Dashboard settings
- Verify environment variables
- Test with new checkout (not old invoices)
