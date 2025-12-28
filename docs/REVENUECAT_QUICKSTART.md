# RevenueCat Quick Start Guide

This guide will help you set up and test the RevenueCat integration in your FELI app.

---

## Step 1: RevenueCat Dashboard Setup

### 1.1 Create Account
1. Go to [RevenueCat](https://app.revenuecat.com)
2. Sign up or log in
3. Create a new project named "FELI"

### 1.2 Configure API Keys

**Current Test Key:** `test_WQrrRhqtUZYQiBbZPsRAJWqFVfE`

For production:
1. Navigate to Project Settings → API Keys
2. Copy your **iOS** and **Android** API keys
3. Add to your `.env` file:
   ```env
   EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key_here
   EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key_here
   ```

### 1.3 Create Entitlement

1. Go to **Entitlements** tab
2. Click **+ New Entitlement**
3. Enter identifier: `pro_features`
4. Save

### 1.4 Create Products

1. Go to **Products** tab
2. Create products with these identifiers:
   - `feli_monthly_pro` (Primary monthly)
   - `monthly` (Alternative monthly)
   - `yearly` (Yearly subscription)
   - `lifetime` (One-time purchase)

3. For each product:
   - Attach to `pro_features` entitlement
   - Configure pricing in App Store Connect / Google Play Console
   - Link store IDs in RevenueCat

### 1.5 Create Offering

1. Go to **Offerings** tab
2. Create a new offering with identifier: `default`
3. Add packages:
   - Monthly package → `feli_monthly_pro` product
   - Yearly package → `yearly` product
   - Lifetime package → `lifetime` product
4. Make it the **Current Offering**

### 1.6 Configure Paywall (Optional)

1. Go to **Paywalls** tab
2. Design your paywall UI
3. Attach to `default` offering

---

## Step 2: App Store Connect / Google Play Setup

### For iOS (App Store Connect)

1. Log in to [App Store Connect](https://appstoreconnect.apple.com)
2. Go to your app → **Features** → **In-App Purchases**
3. Create auto-renewable subscriptions:
   - Product ID: `feli_monthly_pro`
   - Product ID: `yearly`
4. Create non-consumable:
   - Product ID: `lifetime`
5. Configure pricing and metadata
6. Submit for review

### For Android (Google Play Console)

1. Log in to [Google Play Console](https://play.google.com/console)
2. Go to **Monetize** → **Products** → **Subscriptions**
3. Create subscriptions:
   - Product ID: `feli_monthly_pro`
   - Product ID: `yearly`
4. Create in-app products:
   - Product ID: `lifetime`
5. Configure pricing and metadata
6. Activate

---

## Step 3: Link Stores to RevenueCat

### iOS

1. In RevenueCat dashboard, go to **Project Settings** → **Apps**
2. Add iOS app bundle ID
3. Go to **Products** and link each product to App Store Connect SKU

### Android

1. In RevenueCat dashboard, go to **Project Settings** → **Apps**
2. Add Android package name
3. Upload service account key (for API access)
4. Go to **Products** and link each product to Google Play SKU

---

## Step 4: Test the Integration

### 4.1 Run the App

```bash
npx expo start
```

### 4.2 Test Flows

**1. View Paywall**
```
Open app → Navigate to /paywall
✓ Should see Pro benefits
✓ Tap "Subscribe Now" → RevenueCat paywall appears
```

**2. Test Subscription Gate**
```
Open app → View Pro-only feature
✓ Should see locked state
✓ Tap locked content → Paywall modal appears
✓ Tap "Unlock Pro" → RevenueCat paywall appears
```

**3. Make Test Purchase (Sandbox)**
```
✓ Select a product in paywall
✓ Complete sandbox purchase
✓ Verify isPro becomes true
✓ Verify locked content is now visible
```

**4. Test Restore Purchases**
```
✓ Uninstall app
✓ Reinstall app
✓ Navigate to paywall
✓ Tap "Restore Purchases"
✓ Verify Pro status is restored
```

**5. Test Customer Center**
```
✓ As Pro user, navigate to /customer-center
✓ Tap "Manage Subscription"
✓ RevenueCat Customer Center appears
✓ Test cancel/reactivate flows
```

---

## Step 5: Verify Entitlement Checking

Add this debug component to verify entitlements:

```tsx
import { useRevenueCat } from '@/hooks/use-revenue-cat';
import { Text, View } from '@/components/ui';

function DebugPanel() {
  const { isPro, customerInfo, isLoading, error } = useRevenueCat();

  return (
    <View className="p-4 bg-yellow-100">
      <Text className="font-bold">RevenueCat Debug</Text>
      <Text>Loading: {isLoading ? 'Yes' : 'No'}</Text>
      <Text>Pro Status: {isPro ? '✅ PRO' : '❌ FREE'}</Text>
      <Text>Error: {error || 'None'}</Text>
      <Text>Customer ID: {customerInfo?.originalAppUserId || 'None'}</Text>
      <Text>Active Entitlements: {Object.keys(customerInfo?.entitlements.active || {}).join(', ') || 'None'}</Text>
    </View>
  );
}
```

---

## Step 6: Sandbox Testing

### iOS Sandbox Testing

1. **Create Sandbox Tester:**
   - App Store Connect → Users and Access → Sandbox Testers
   - Create test Apple ID

2. **Sign In on Device:**
   - Settings → App Store → Sandbox Account
   - Sign in with sandbox tester

3. **Test Purchase:**
   - Run app on device
   - Complete purchase
   - Verify no real charge

### Android Sandbox Testing

1. **Add License Tester:**
   - Google Play Console → Setup → License Testing
   - Add test Google account

2. **Test Purchase:**
   - Run app on device with test account
   - Complete purchase
   - Verify no real charge

---

## Step 7: Monitor in Dashboard

### View Purchase Events

1. Go to RevenueCat dashboard → **Customers**
2. Find your test customer
3. View:
   - Active subscriptions
   - Purchase history
   - Entitlements

### Check Webhook Events (Optional)

1. Go to **Integrations** → **Webhooks**
2. Add webhook URL
3. Monitor events:
   - `INITIAL_PURCHASE`
   - `RENEWAL`
   - `CANCELLATION`
   - `BILLING_ISSUE`

---

## Troubleshooting

### Issue: "No Offerings Available"

**Solution:**
1. Verify products are created in RevenueCat
2. Check offering is marked as "Current"
3. Ensure products are linked to store SKUs
4. Wait 5-10 minutes for cache to update

### Issue: "Purchase Failed"

**Solution:**
1. Verify sandbox testing is enabled
2. Check bundle ID/package name matches
3. Ensure products are approved in stores
4. Check RevenueCat logs for errors

### Issue: "Entitlement Not Granted"

**Solution:**
1. Verify entitlement ID is `pro_features`
2. Check product is attached to entitlement
3. Refresh customer info: `await Purchases.getCustomerInfo()`
4. Check dashboard for customer's entitlements

### Issue: "isPro Always False"

**Solution:**
1. Add debug logs in `useRevenueCat` hook
2. Verify `customerInfo.entitlements.active['pro_features']` exists
3. Check RevenueCat dashboard for active entitlements
4. Test restore purchases

---

## Production Deployment Checklist

Before releasing to production:

- [ ] Replace test API key with production keys
- [ ] Update environment variables
- [ ] Test all purchase flows on real devices
- [ ] Verify refund handling
- [ ] Test subscription renewals
- [ ] Configure webhook endpoints
- [ ] Add analytics tracking
- [ ] Test promotional offers (if using)
- [ ] Verify family sharing settings
- [ ] Test cross-platform purchases (iOS → Android)
- [ ] Document customer support procedures
- [ ] Set up subscription event monitoring
- [ ] Test grace period handling
- [ ] Verify trial period flows (if using)

---

## Next Steps

1. **Test locally** with sandbox accounts
2. **Configure dashboard** with your products
3. **Deploy to TestFlight/Internal Testing** for beta testing
4. **Monitor RevenueCat dashboard** for purchase events
5. **Switch to production keys** before App Store/Play Store release

---

## Support

- **RevenueCat Docs:** https://docs.revenuecat.com
- **Community:** https://community.revenuecat.com
- **Support:** https://app.revenuecat.com/settings/support

---

**Status:** Ready for testing with sandbox accounts
