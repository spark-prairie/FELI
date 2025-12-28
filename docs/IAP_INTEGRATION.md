# IAP Integration Architecture

**Status:** ✅ PRODUCTION-READY
**Platform:** RevenueCat SDK v9.6+
**Compliance:** Apple App Store + Google Play Store

---

## Table of Contents

1. [Subscription Model](#subscription-model)
2. [Product IDs](#product-ids)
3. [Purchase Flow](#purchase-flow)
4. [Restore Purchases](#restore-purchases)
5. [Edge Cases](#edge-cases)
6. [Compliance](#compliance)
7. [Testing Strategy](#testing-strategy)

---

## Subscription Model

### Tiers

FELI offers **two subscription tiers** and one **lifetime option**:

| Tier | Type | Product ID | Features |
|------|------|-----------|----------|
| **Monthly Pro** | Auto-renewable | `feli_monthly_pro` | All Pro features, renews monthly |
| **Yearly Pro** | Auto-renewable | `yearly` | All Pro features, renews yearly (best value) |
| **Lifetime Pro** | One-time purchase | `lifetime` | All Pro features, one-time payment |

**Free Tier:**
- 2 analyses per day
- General emotion labels (no percentages)
- Primary emotion only
- Basic suggestions (1-2 items)
- Limited reasoning details (1-2 observations)

**Pro Tier Features:**
- ✅ Unlimited daily analyses
- ✅ Exact confidence percentages (e.g., 72%)
- ✅ Secondary emotion insights
- ✅ Full reasoning details (up to 6 observations)
- ✅ Extended suggestions (up to 4 recommendations)

### Pricing Strategy

**Recommended Pricing:**
- Monthly: $4.99 USD
- Yearly: $39.99 USD (33% savings)
- Lifetime: $79.99 USD

**Trial Period:**
- Optional: 7-day free trial on yearly plan
- Configure in App Store Connect / Google Play Console

---

## Product IDs

### Platform Configuration

**iOS Bundle ID:** `com.yourapp.feli`
**Android Package:** `com.yourapp.feli`

### Product Identifiers

```typescript
// src/config/revenue-cat.ts
export const PRODUCTS = {
  MONTHLY: 'feli_monthly_pro',      // Primary monthly subscription
  MONTHLY_ALT: 'monthly',            // Alternative ID (backup)
  YEARLY: 'yearly',                  // Yearly subscription
  LIFETIME: 'lifetime',              // One-time purchase
} as const;
```

### Entitlement Mapping

All products grant the **same entitlement**:

```typescript
export const ENTITLEMENTS = {
  PRO_FEATURES: 'pro_features',  // Main Pro entitlement
} as const;
```

**RevenueCat Dashboard Setup:**
1. Create entitlement: `pro_features`
2. Attach all products to this entitlement
3. Check entitlement status: `customerInfo.entitlements.active['pro_features']`

---

## Purchase Flow

### Architecture Diagram

```
┌──────────────────────────────────────────────────────────┐
│  User taps "Subscribe Now" or Pro-locked feature        │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  1. SubscriptionGate / Paywall Page                      │
│     - Show benefits                                       │
│     - Display "Subscribe Now" button                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  2. RevenueCat Paywall UI Presented                      │
│     RevenueCatUI.presentPaywall()                        │
│     - Fetches offerings from RevenueCat                  │
│     - Displays products (Monthly/Yearly/Lifetime)        │
│     - Shows pricing configured in dashboard              │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  3. User Selects Product & Confirms Purchase             │
│     - Apple Pay (iOS) / Google Pay (Android)             │
│     - Native payment sheet                               │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  4. RevenueCat SDK Processes Purchase                    │
│     const { customerInfo } = await Purchases             │
│       .purchasePackage(selectedPackage)                  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  5. Verify Entitlement Granted                           │
│     const isPro = customerInfo.entitlements              │
│       .active['pro_features'] !== undefined              │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  6. Update Local State                                   │
│     useAnalysisStore.setPro(true)                        │
│     - Syncs to Zustand store                             │
│     - Persists to MMKV storage                           │
│     - Updates lastSubscriptionCheck timestamp            │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  7. UI Updates                                           │
│     - Locked content becomes visible                     │
│     - Subscription gates removed                         │
│     - Pro features unlocked                              │
└──────────────────────────────────────────────────────────┘
```

### Implementation

**File:** [src/hooks/use-revenue-cat.ts](../src/hooks/use-revenue-cat.ts:148-151)

```typescript
const purchasePackage = useCallback(
  async (pkg: PurchasesPackage): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      // Purchase via RevenueCat SDK
      const { customerInfo: updatedInfo } = await Purchases.purchasePackage(pkg);
      setCustomerInfo(updatedInfo);

      // Check entitlement
      const hasProEntitlement =
        updatedInfo.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;

      // Update Zustand store (auto-persists to MMKV)
      setPro(hasProEntitlement);

      return hasProEntitlement;
    } catch (err) {
      if (err instanceof Error && !err.message.includes('user cancelled')) {
        setError(err.message);
      }
      return false;
    } finally {
      setIsLoading(false);
    }
  },
  [setPro]
);
```

### Error Handling

```typescript
// User cancelled purchase
if (error.message.includes('user cancelled')) {
  // Silent - don't show error
  return false;
}

// Network error
if (error.message.includes('network')) {
  alert('Network error. Please check your connection and try again.');
  return false;
}

// Payment declined
if (error.message.includes('payment')) {
  alert('Payment could not be processed. Please check your payment method.');
  return false;
}

// Other errors
alert('Purchase failed. Please try again later.');
console.error('[Purchase]', error);
return false;
```

---

## Restore Purchases

### When to Restore

Restore purchases should be available when:
- ✅ User reinstalls the app
- ✅ User signs in on a new device
- ✅ User claims they already purchased but Pro is not active
- ✅ After subscription renewal (auto-restored)

### Restore Flow Diagram

```
┌──────────────────────────────────────────────────────────┐
│  User taps "Restore Purchases" in paywall               │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  1. Call Restore API                                     │
│     const restored = await Purchases.restorePurchases()  │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  2. RevenueCat Queries Store Receipts                    │
│     - iOS: Queries App Store for purchases               │
│     - Android: Queries Play Store for purchases          │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  3. RevenueCat Syncs Entitlements                        │
│     - Matches store receipts to products                 │
│     - Grants entitlements if valid                       │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  4. Check Restored Entitlements                          │
│     const isPro = restored.entitlements                  │
│       .active['pro_features'] !== undefined              │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  5. Update Local State                                   │
│     setPro(isPro)                                        │
│     syncProStatus(isPro, Date.now())                     │
└────────────────────┬─────────────────────────────────────┘
                     │
                     ▼
┌──────────────────────────────────────────────────────────┐
│  6. Show Result to User                                  │
│     ✅ Success: "Purchases restored successfully!"       │
│     ❌ No purchases: "No purchases found to restore."    │
└──────────────────────────────────────────────────────────┘
```

### Implementation

**File:** [src/hooks/use-revenue-cat.ts](../src/hooks/use-revenue-cat.ts:152)

```typescript
const restorePurchases = useCallback(async (): Promise<boolean> => {
  try {
    setIsLoading(true);
    setError(null);

    // Restore via RevenueCat SDK
    const restoredInfo = await Purchases.restorePurchases();
    setCustomerInfo(restoredInfo);

    // Check entitlement
    const hasProEntitlement =
      restoredInfo.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;

    // Update Zustand store
    setPro(hasProEntitlement);

    return hasProEntitlement;
  } catch (err) {
    setError(err instanceof Error ? err.message : 'Failed to restore purchases');
    return false;
  } finally {
    setIsLoading(false);
  }
}, [setPro]);
```

### iOS-Specific: Receipt Validation

RevenueCat **automatically handles** iOS receipt validation:
- Validates receipts with Apple servers
- Detects subscription status changes
- Handles subscription renewals
- Manages grace periods

**No additional code required** - RevenueCat SDK handles this.

### Android-Specific: Purchase Tokens

RevenueCat **automatically handles** Android purchase tokens:
- Validates purchase tokens with Google Play
- Detects subscription status changes
- Handles acknowledgment of purchases
- Manages pending purchases

**No additional code required** - RevenueCat SDK handles this.

---

## Edge Cases

### 1. Expired Subscription

**Scenario:** User's subscription expires after billing failure

**Detection:**
```typescript
const isPro =
  customerInfo.entitlements.active['pro_features'] !== undefined;

// If false, subscription is expired or never existed
```

**Handling:**
```typescript
useEffect(() => {
  if (!isPro && previouslyWasPro) {
    // Show grace period message (if in grace period)
    if (customerInfo.entitlements.all['pro_features']?.isActive === false) {
      const expirationDate = customerInfo.entitlements.all['pro_features']?.expirationDate;
      alert(`Your Pro subscription expired on ${expirationDate}. Renew to continue using Pro features.`);
    }

    // Remove Pro features
    setPro(false);
  }
}, [isPro]);
```

**User Experience:**
- ✅ Gracefully lock Pro features
- ✅ Show renewal prompt
- ✅ Allow restore purchases
- ✅ Keep user data intact

### 2. Trial Periods

**Scenario:** User starts 7-day free trial

**Configuration:**
- Set up in App Store Connect / Google Play Console
- RevenueCat automatically detects trial status

**Checking Trial Status:**
```typescript
const isInTrial =
  customerInfo.entitlements.active['pro_features']?.periodType === 'TRIAL';

if (isInTrial) {
  const trialEndDate = customerInfo.entitlements.active['pro_features']?.expirationDate;
  console.log(`Trial ends: ${trialEndDate}`);
}
```

**User Experience:**
- ✅ Show "Trial Active" badge
- ✅ Display trial end date
- ✅ Remind user 1 day before trial ends
- ✅ Seamless conversion to paid

### 3. Network Errors

**Scenario:** User has no internet connection during purchase

**Detection:**
```typescript
try {
  await Purchases.purchasePackage(pkg);
} catch (error) {
  if (error.message.includes('network') || error.message.includes('offline')) {
    // Network error
  }
}
```

**Handling:**
```typescript
// Retry logic
const purchaseWithRetry = async (pkg: PurchasesPackage, retries = 3): Promise<boolean> => {
  for (let i = 0; i < retries; i++) {
    try {
      const { customerInfo } = await Purchases.purchasePackage(pkg);
      return customerInfo.entitlements.active['pro_features'] !== undefined;
    } catch (error) {
      if (i === retries - 1) {
        alert('Network error. Please check your connection and try again.');
        return false;
      }
      await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2s
    }
  }
  return false;
};
```

**User Experience:**
- ✅ Show "Checking connection..." message
- ✅ Auto-retry up to 3 times
- ✅ Provide manual retry button
- ✅ Cache purchase attempt locally

### 4. Subscription Downgrade/Upgrade

**Scenario:** User switches from yearly to monthly (or vice versa)

**iOS Behavior:**
- Downgrade: Takes effect at end of current period
- Upgrade: Takes effect immediately, prorated credit applied

**Android Behavior:**
- Configure proration mode in Google Play Console
- Can be immediate, deferred, or with refund

**RevenueCat Handling:**
```typescript
// RevenueCat automatically handles upgrade/downgrade
// No additional code needed

// Check current subscription tier
const activeProduct = customerInfo.entitlements.active['pro_features']?.productIdentifier;
console.log(`Current plan: ${activeProduct}`); // 'monthly', 'yearly', or 'lifetime'
```

### 5. Refund Handling

**Scenario:** User requests refund from Apple/Google

**Detection:**
RevenueCat webhook receives `CANCELLATION` event

**Automatic Handling:**
- RevenueCat revokes entitlement
- `customerInfo.entitlements.active['pro_features']` becomes `undefined`
- Next app launch: `isPro` becomes `false`

**User Experience:**
- ✅ Pro features locked automatically
- ✅ No manual intervention needed
- ✅ User can re-subscribe anytime

### 6. Family Sharing (iOS)

**Scenario:** User shares subscription with family members

**Configuration:**
- Enable in App Store Connect
- RevenueCat automatically detects shared subscriptions

**Handling:**
```typescript
// RevenueCat handles family sharing automatically
// Family members get same entitlements

const isFamilyShared = customerInfo.entitlements.active['pro_features']?.ownershipType === 'FAMILY_SHARED';
```

---

## Compliance

### Apple App Store Review Guidelines

#### 3.1.1 In-App Purchase
✅ **Requirement:** Use Apple's IAP system for digital goods

**Compliance:**
- ✅ All subscriptions use StoreKit via RevenueCat
- ✅ No external payment links
- ✅ No mention of pricing outside App Store

#### 3.1.2 Subscriptions
✅ **Requirement:** Clearly describe subscription terms

**Implementation:**
[src/app/paywall.tsx](../src/app/paywall.tsx:50) includes:
- ✅ Subscription duration (Monthly/Yearly)
- ✅ Renewal information
- ✅ Cancellation policy

**Paywall Text (Compliant):**
```
"Your subscription will automatically renew unless cancelled at least 24 hours
before the end of the current period. Manage subscriptions in Settings."
```

#### 5.1.1 Data Collection and Storage
✅ **Requirement:** Non-medical, wellness-focused language

**FELI Compliance:**
- ✅ "Emotional state interpretation" (NOT "diagnosis")
- ✅ "Behavioral cues" (NOT "symptoms")
- ✅ "General wellness insights" (NOT "medical advice")
- ✅ Disclaimer: "Not a substitute for veterinary care"

**Example Disclaimer:**
```
"FELI provides general insights into cat behavior and emotional states based on
visual cues. This is not medical advice and does not replace professional
veterinary consultation."
```

### Google Play Store Policies

#### Payments Policy
✅ **Requirement:** Use Google Play Billing for in-app purchases

**Compliance:**
- ✅ All subscriptions use Google Play Billing via RevenueCat
- ✅ No alternative payment methods
- ✅ Clear pricing display

#### Subscription Policy
✅ **Requirement:** Free trials must clearly state terms

**Implementation:**
```
"Start your 7-day free trial. After trial, you'll be charged $39.99/year.
Cancel anytime before trial ends to avoid charges."
```

#### Metadata & Privacy
✅ **Requirement:** Accurate app description

**FELI Description (Compliant):**
```
FELI helps you understand your cat's emotional state through photo analysis.
Upload a photo and receive insights into behavioral cues, mood indicators,
and wellness suggestions. FELI is a companion tool for cat owners and does
not provide veterinary medical advice.
```

---

## Testing Strategy

### 1. Sandbox Testing

**iOS Sandbox Testers:**
1. Create in App Store Connect → Users and Access → Sandbox Testers
2. Use test Apple ID on device
3. Test purchases (no real charges)

**Android License Testers:**
1. Add in Google Play Console → Setup → License Testing
2. Use test Google account
3. Test purchases (no real charges)

### 2. Test Scenarios

**Core Flows:**
- [ ] Purchase monthly subscription
- [ ] Purchase yearly subscription
- [ ] Purchase lifetime
- [ ] Restore purchases after reinstall
- [ ] Cancel subscription
- [ ] Subscription expires (simulate)
- [ ] Payment declined (test card)
- [ ] Network failure during purchase
- [ ] Upgrade from monthly to yearly
- [ ] Downgrade from yearly to monthly

**Edge Cases:**
- [ ] Multiple quick taps on purchase button
- [ ] App force-quit during purchase
- [ ] Purchase on one device, restore on another
- [ ] Refund via App Store/Play Store
- [ ] Trial period start/end
- [ ] Family sharing (iOS)

### 3. Production Monitoring

**RevenueCat Dashboard Metrics:**
- Active subscriptions count
- Monthly recurring revenue (MRR)
- Churn rate
- Trial conversion rate
- Refund rate

**Webhook Events to Monitor:**
```
INITIAL_PURCHASE      → Track new subscribers
RENEWAL               → Track successful renewals
CANCELLATION          → Track churn
BILLING_ISSUE         → Alert for payment failures
PRODUCT_CHANGE        → Track upgrades/downgrades
```

---

## Integration Checklist

### Pre-Launch

- [ ] Products created in App Store Connect
- [ ] Products created in Google Play Console
- [ ] Products linked in RevenueCat dashboard
- [ ] Entitlement `pro_features` created
- [ ] Offering `default` configured
- [ ] Paywall designed in RevenueCat
- [ ] Environment variables set (production keys)
- [ ] Sandbox testing completed
- [ ] Compliance review passed
- [ ] Terms of Service reviewed by legal
- [ ] Privacy Policy updated

### Post-Launch

- [ ] Monitor purchase success rate
- [ ] Track subscription renewals
- [ ] Monitor webhook events
- [ ] A/B test pricing (via RevenueCat)
- [ ] Review customer support tickets
- [ ] Analyze churn reasons
- [ ] Optimize paywall conversion

---

## Support & Resources

- **RevenueCat Docs:** https://docs.revenuecat.com
- **App Store Review Guidelines:** https://developer.apple.com/app-store/review/guidelines/
- **Google Play Policies:** https://support.google.com/googleplay/android-developer/topic/9858052
- **FELI Integration Docs:** [REVENUECAT_INTEGRATION.md](./REVENUECAT_INTEGRATION.md)
- **Quick Start Guide:** [REVENUECAT_QUICKSTART.md](./REVENUECAT_QUICKSTART.md)

---

**Last Updated:** 2025-12-28
**Version:** 1.0.0
