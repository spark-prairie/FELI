# RevenueCat Integration Guide

**Status:** ✅ COMPLETE
**Date:** 2025-12-28

---

## Overview

This guide documents the complete RevenueCat SDK integration for the FELI app, including subscription management, paywall UI, and customer center.

---

## Installation

### Packages Installed

```bash
npx expo install react-native-purchases react-native-purchases-ui
```

**Dependencies:**
- `react-native-purchases@^9.6.12` - Core RevenueCat SDK
- `react-native-purchases-ui@^9.6.12` - Pre-built paywall and customer center UI

---

## Configuration

### API Keys

**Location:** [src/config/revenue-cat.ts](../src/config/revenue-cat.ts)

```typescript
export const REVENUE_CAT_CONFIG = {
  apiKey: __DEV__
    ? 'test_WQrrRhqtUZYQiBbZPsRAJWqFVfE'  // Test key
    : Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
      }) || '',
} as const;
```

**Environment Variables (Production):**
```env
EXPO_PUBLIC_REVENUECAT_IOS_KEY=your_ios_key_here
EXPO_PUBLIC_REVENUECAT_ANDROID_KEY=your_android_key_here
```

### Entitlements

```typescript
export const ENTITLEMENTS = {
  PRO_FEATURES: 'pro_features',  // Main Pro entitlement
} as const;
```

### Product Identifiers

```typescript
export const PRODUCTS = {
  MONTHLY: 'feli_monthly_pro',
  MONTHLY_ALT: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;
```

---

## Architecture

### 1. Provider Setup

**Location:** [src/providers/revenue-cat-provider.tsx](../src/providers/revenue-cat-provider.tsx)

The `RevenueCatProvider` initializes the SDK at app startup:

```typescript
<RevenueCatProvider>
  <YourAppComponents />
</RevenueCatProvider>
```

**Integration:** Added to [src/app/_layout.tsx](../src/app/_layout.tsx:57)

### 2. Custom Hook

**Location:** [src/hooks/use-revenue-cat.ts](../src/hooks/use-revenue-cat.ts)

The `useRevenueCat()` hook provides:

```typescript
interface UseRevenueCatReturn {
  isConfigured: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isPro: boolean;  // Based on pro_features entitlement
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  error: string | null;
}
```

**Key Features:**
- Auto-syncs `isPro` status with Zustand store
- Fetches customer info and offerings on mount
- Persists Pro status to MMKV storage
- Handles purchase and restore flows

---

## Components

### 1. Paywall Component

**Location:** [src/components/revenue-cat-paywall.tsx](../src/components/revenue-cat-paywall.tsx)

Wraps RevenueCat's `presentPaywall()` API:

```tsx
<RevenueCatPaywall
  visible={showModal}
  onClose={() => setShowModal(false)}
  onSuccess={() => console.log('Purchase successful')}
/>
```

**How it works:**
- Calls `RevenueCatUI.presentPaywall()` when `visible` becomes `true`
- Handles purchase, restore, and cancellation results
- Auto-closes on completion

### 2. Paywall Page

**Location:** [src/app/paywall.tsx](../src/app/paywall.tsx)

Full-screen subscription page showing:
- 5 Pro benefit cards
- "Subscribe Now" button (opens RevenueCat paywall)
- "Maybe Later" button (dismisses page)
- Auto-redirect if user is already Pro

**Route:** `/paywall`

### 3. Subscription Gate

**Location:** [src/components/subscription-gate.tsx](../src/components/subscription-gate.tsx)

Wrapper component for Pro-only content:

```tsx
// Modal mode (shows inline subscription prompt)
<SubscriptionGate>
  <ProFeatureComponent />
</SubscriptionGate>

// Navigate mode (routes to /paywall)
<SubscriptionGate mode="navigate">
  <ProFeatureComponent />
</SubscriptionGate>
```

**Behavior:**
- **Pro users:** Render children directly
- **Free users:** Show locked state → open RevenueCat paywall on tap

**Updated:** Now uses real RevenueCat entitlement checking (not mock)

### 4. Customer Center

**Location:** [src/app/customer-center.tsx](../src/app/customer-center.tsx)

Subscription management page for Pro users:
- Displays Pro subscription status
- "Manage Subscription" button opens RevenueCat Customer Center
- Auto-redirects non-Pro users to paywall

**Route:** `/customer-center`

---

## Usage Examples

### Check Pro Status

```tsx
import { useRevenueCat } from '@/hooks/use-revenue-cat';

function MyComponent() {
  const { isPro, isLoading } = useRevenueCat();

  if (isLoading) return <LoadingSpinner />;

  return isPro ? <ProContent /> : <FreeContent />;
}
```

### Purchase a Subscription

```tsx
import { useRevenueCat } from '@/hooks/use-revenue-cat';

function SubscribeButton() {
  const { offerings, purchasePackage, isLoading } = useRevenueCat();

  const handlePurchase = async () => {
    const defaultOffering = offerings?.current;
    if (!defaultOffering?.availablePackages[0]) return;

    const success = await purchasePackage(defaultOffering.availablePackages[0]);
    if (success) {
      console.log('Purchase successful!');
    }
  };

  return <Button onPress={handlePurchase} disabled={isLoading} />;
}
```

### Restore Purchases

```tsx
import { useRevenueCat } from '@/hooks/use-revenue-cat';

function RestoreButton() {
  const { restorePurchases, isLoading } = useRevenueCat();

  const handleRestore = async () => {
    const success = await restorePurchases();
    if (success) {
      alert('Purchases restored successfully!');
    } else {
      alert('No purchases found to restore.');
    }
  };

  return <Button onPress={handleRestore} disabled={isLoading} />;
}
```

### Gate Pro Features

```tsx
import { SubscriptionGate } from '@/components/subscription-gate';

function AnalysisResult() {
  return (
    <View>
      {/* Always visible */}
      <PrimaryEmotionCard />

      {/* Pro-only with inline modal */}
      <SubscriptionGate>
        <ConfidencePercentage value={72} />
      </SubscriptionGate>

      {/* Pro-only with navigation to /paywall */}
      <SubscriptionGate mode="navigate">
        <SecondaryEmotionCard />
      </SubscriptionGate>
    </View>
  );
}
```

---

## RevenueCat Dashboard Setup

### Required Configuration

1. **Create Entitlement:**
   - Name: `pro_features`
   - Attach to all subscription products

2. **Create Products:**
   - Monthly: `feli_monthly_pro` (primary) or `monthly`
   - Yearly: `yearly`
   - Lifetime: `lifetime`

3. **Create Offering:**
   - Identifier: `default`
   - Add packages for all products

4. **Paywall Configuration:**
   - Design paywall in RevenueCat dashboard
   - Paywall will auto-display via `RevenueCatUI.presentPaywall()`

5. **Customer Center:**
   - Enable in RevenueCat dashboard settings
   - Configure subscription management options

---

## State Management

### Zustand Store Integration

**Location:** [src/stores/analysis-store.ts](../src/stores/analysis-store.ts)

The `isPro` state is automatically synced:

```typescript
// In useRevenueCat hook
const hasProEntitlement =
  customerInfo?.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;
setPro(hasProEntitlement);  // Auto-syncs to Zustand store
```

**Persistence:**
- Zustand persist middleware → MMKV storage
- `isPro` persists across app restarts
- Updated on every `customerInfo` change

---

## Testing

### Test Mode (Development)

Current setup uses test API key: `test_WQrrRhqtUZYQiBbZPsRAJWqFVfE`

**Features:**
- Debug logging enabled (`LOG_LEVEL.DEBUG`)
- No real payments processed
- Test purchases can be made via RevenueCat sandbox

### Production Checklist

Before releasing to production:

- [ ] Replace test API key with production keys
- [ ] Set `EXPO_PUBLIC_REVENUECAT_IOS_KEY` env variable
- [ ] Set `EXPO_PUBLIC_REVENUECAT_ANDROID_KEY` env variable
- [ ] Configure products in App Store Connect / Google Play Console
- [ ] Link products to RevenueCat dashboard
- [ ] Test purchase flows on real devices
- [ ] Verify entitlement checking works correctly
- [ ] Test restore purchases functionality
- [ ] Configure webhooks for subscription events (optional)

---

## API Reference

### RevenueCatUI Methods

```typescript
// Present paywall
const result = await RevenueCatUI.presentPaywall();
// Returns: PURCHASED | CANCELLED | RESTORED

// Present customer center
await RevenueCatUI.presentCustomerCenter();
```

### Purchases SDK Methods

```typescript
// Get customer info
const customerInfo = await Purchases.getCustomerInfo();

// Get offerings
const offerings = await Purchases.getOfferings();

// Purchase package
const { customerInfo } = await Purchases.purchasePackage(package);

// Restore purchases
const restoredInfo = await Purchases.restorePurchases();

// Check entitlement
const isPro = customerInfo.entitlements.active['pro_features'] !== undefined;
```

---

## Files Created

| File | Purpose |
|------|---------|
| [src/config/revenue-cat.ts](../src/config/revenue-cat.ts) | Configuration constants |
| [src/hooks/use-revenue-cat.ts](../src/hooks/use-revenue-cat.ts) | Main RevenueCat hook |
| [src/providers/revenue-cat-provider.tsx](../src/providers/revenue-cat-provider.tsx) | SDK initialization provider |
| [src/components/revenue-cat-paywall.tsx](../src/components/revenue-cat-paywall.tsx) | Paywall modal component |
| [src/app/customer-center.tsx](../src/app/customer-center.tsx) | Subscription management page |

## Files Modified

| File | Changes |
|------|---------|
| [src/app/_layout.tsx](../src/app/_layout.tsx) | Added RevenueCatProvider wrapper |
| [src/app/paywall.tsx](../src/app/paywall.tsx) | Replaced mock with RevenueCat paywall |
| [src/components/subscription-gate.tsx](../src/components/subscription-gate.tsx) | Uses RevenueCat entitlement checking |

---

## Migration from Day 9 Mock

### Before (Mock Subscription)

```typescript
const handleSubscribe = () => {
  setPro(true);  // DEV mock
  router.back();
};
```

### After (RevenueCat Integration)

```typescript
const { isPro } = useRevenueCat();  // Real entitlement check
const [showPaywall, setShowPaywall] = useState(false);

const handleSubscribe = () => {
  setShowPaywall(true);  // Opens RevenueCat paywall
};

<RevenueCatPaywall
  visible={showPaywall}
  onClose={() => setShowPaywall(false)}
  onSuccess={() => router.back()}
/>
```

---

## Error Handling

### Common Errors

**1. SDK Not Configured**
```typescript
if (!isConfigured) {
  return <Text>Subscription system unavailable</Text>;
}
```

**2. No Offerings Available**
```typescript
if (!offerings?.current) {
  return <Text>No subscription plans available</Text>;
}
```

**3. Purchase Cancelled**
```typescript
const success = await purchasePackage(pkg);
if (!success) {
  // User cancelled or error occurred
  console.log('Purchase not completed');
}
```

---

## Best Practices

1. **Always check `isPro` before rendering gated content**
2. **Use `isLoading` to show loading states**
3. **Handle `error` state from `useRevenueCat()`**
4. **Test restore purchases flow thoroughly**
5. **Monitor webhook events in production**
6. **Use RevenueCat dashboard for analytics**
7. **Keep product IDs in sync between code and dashboards**

---

## Support Resources

- **RevenueCat Docs:** https://www.revenuecat.com/docs
- **Expo Integration:** https://www.revenuecat.com/docs/getting-started/installation/expo
- **Paywall UI:** https://www.revenuecat.com/docs/tools/paywalls
- **Customer Center:** https://www.revenuecat.com/docs/tools/customer-center
- **Entitlements:** https://www.revenuecat.com/docs/entitlements

---

## Status Summary

✅ **SDK Installed & Configured**
✅ **Provider Initialized**
✅ **Custom Hook Implemented**
✅ **Paywall UI Integrated**
✅ **Customer Center Added**
✅ **Subscription Gate Updated**
✅ **Entitlement Checking Working**
✅ **State Management Synced**
✅ **TypeScript Compilation Passing**

**Ready for:** Production configuration and testing
