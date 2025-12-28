# FELI Compliance Guide

**App Store Review & Legal Compliance**
**Last Updated:** 2025-12-28

---

## Table of Contents

1. [Non-Medical Language Audit](#non-medical-language-audit)
2. [Cancellation Policy](#cancellation-policy)
3. [Privacy & Data Handling](#privacy--data-handling)
4. [App Store Submission](#app-store-submission)
5. [Legal Templates](#legal-templates)

---

## Non-Medical Language Audit

### ✅ Approved Language (Use These)

| Instead of Medical Term | Use Wellness Term |
|------------------------|-------------------|
| ❌ "Diagnosis" | ✅ "Interpretation" |
| ❌ "Symptoms" | ✅ "Behavioral cues" |
| ❌ "Medical condition" | ✅ "Emotional state" |
| ❌ "Prescribe" | ✅ "Suggest" |
| ❌ "Treatment" | ✅ "Care approach" |
| ❌ "Clinical assessment" | ✅ "Behavioral analysis" |
| ❌ "Pathology" | ✅ "Behavioral pattern" |
| ❌ "Prognosis" | ✅ "Observation" |

### Current App Text Review

**✅ Compliant Examples:**

```typescript
// Paywall description
"Get deeper insights into your cat's emotional state"
✅ Uses "emotional state" not "diagnosis"

// Analysis result disclaimer
"This analysis provides general insights based on visual cues and is not a
substitute for professional veterinary care."
✅ Clear non-medical disclaimer

// Feature descriptions
"Understand nuanced emotional states with secondary emotion analysis"
✅ Uses "emotional states" not "conditions"
```

**Required Disclaimers:**

```typescript
// Main app disclaimer (display prominently)
export const MEDICAL_DISCLAIMER = `
FELI is a companion app for cat owners that provides general insights into
feline behavior and emotional states based on visual analysis. This app does
not provide medical advice, diagnosis, or treatment recommendations.

For health concerns, always consult a licensed veterinarian.
`;

// Analysis result disclaimer (shown with every result)
export const ANALYSIS_DISCLAIMER = `
This analysis is based on observable behavioral cues and general patterns.
It is not a medical assessment and should not replace professional
veterinary consultation.
`;
```

---

## Cancellation Policy

### Apple App Store Requirements

**Auto-Renewable Subscriptions:**

```
Cancellation Policy

Your subscription will automatically renew unless cancelled at least 24 hours
before the end of the current period.

How to Cancel:
1. Open the Settings app on your iPhone or iPad
2. Tap your name at the top
3. Tap Subscriptions
4. Select FELI Pro
5. Tap Cancel Subscription

You can also manage subscriptions in the App Store app:
- Open App Store
- Tap your profile icon
- Tap Subscriptions
- Select FELI Pro

Refunds:
- Refunds are handled by Apple
- Contact Apple Support for refund requests
- Refund eligibility determined by Apple's policies

After cancellation, you will continue to have access to Pro features until
the end of the current billing period.
```

### Google Play Store Requirements

**Auto-Renewing Subscriptions:**

```
Cancellation Policy

Your subscription will automatically renew unless cancelled before the renewal
date.

How to Cancel:
1. Open the Google Play Store app
2. Tap Menu → Subscriptions
3. Select FELI Pro
4. Tap Cancel subscription

You can also manage subscriptions on the web:
- Visit play.google.com/store/account/subscriptions
- Select FELI Pro
- Click Cancel subscription

Refunds:
- Refunds are handled by Google
- You may be eligible for a refund within a specific time period
- Contact Google Play Support for refund requests

After cancellation, you will retain access to Pro features until the end of
the current billing period.
```

### In-App Display

**Location:** [src/app/paywall.tsx](../src/app/paywall.tsx)

Add this section before the subscribe buttons:

```tsx
<View className="mb-4 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
  <Text className="mb-2 text-xs font-semibold text-neutral-700 dark:text-neutral-300">
    Subscription Terms
  </Text>
  <Text className="text-xs text-neutral-600 dark:text-neutral-400">
    • Automatically renews unless cancelled 24 hours before renewal
    • Manage or cancel anytime in device settings
    • No refunds for partial periods
    • Pro access continues until end of billing period after cancellation
  </Text>
</View>
```

---

## Privacy & Data Handling

### Data Collection Statement

```
FELI Privacy Commitment

What We Collect:
- Cat photos (processed locally, not stored on servers)
- Analysis history (stored locally on your device)
- Purchase receipts (managed by Apple/Google and RevenueCat)

What We Don't Collect:
- Personal identifying information beyond purchase data
- Location data
- Contact information
- Health records

Data Storage:
- All photo analysis happens on-device or via secure API
- Analysis history stored locally using encrypted storage (MMKV)
- Photos are never uploaded to our servers without explicit consent

Third-Party Services:
- RevenueCat: Subscription management (processes purchase data only)
- [AI Provider]: Photo analysis (photos sent securely, not stored)

Your Rights:
- Delete all local data: Settings → Clear History
- Export data: [Export feature if implemented]
- Request data deletion: privacy@feliapp.com
```

### Required Privacy Policy Sections

**1. Information Collection:**
```
We collect:
- Device identifiers (for subscription management)
- Purchase history (for subscription verification)
- Cat photos uploaded for analysis (processed but not permanently stored)
- Local analysis history (stored only on your device)
```

**2. How We Use Information:**
```
- Process photo analysis requests
- Manage subscription status
- Improve analysis accuracy
- Provide customer support
```

**3. Data Sharing:**
```
We share data with:
- RevenueCat (subscription management only)
- [AI Provider] (photo analysis only, photos not retained)
- Apple/Google (purchase processing only)

We never sell your data.
```

**4. User Rights (GDPR/CCPA):**
```
You have the right to:
- Access your data
- Delete your data
- Export your data
- Opt out of data processing
```

---

## App Store Submission

### Apple App Store Checklist

**App Information:**
- [ ] App Name: FELI - Cat Emotion Insights
- [ ] Subtitle: Understand Your Cat's Feelings
- [ ] Category: Lifestyle or Utilities
- [ ] Age Rating: 4+ (no sensitive content)

**Screenshots Required:**
- [ ] 6.7" iPhone (1290 x 2796)
- [ ] 5.5" iPhone (1242 x 2208)
- [ ] iPad Pro (2048 x 2732)

**App Description (Compliant):**
```
FELI helps you better understand your cat's emotional state through visual
behavior analysis.

Features:
• Photo analysis of feline facial expressions and body language
• Insights into emotional states (relaxed, alert, anxious, etc.)
• Behavior pattern tracking
• Care suggestions based on observed cues

Pro Features:
• Unlimited daily analyses
• Detailed confidence metrics
• Secondary emotion insights
• Extended behavioral observations

Important Notice:
FELI is a companion tool for cat owners and does not provide veterinary
medical advice. Always consult a licensed veterinarian for health concerns.

Subscription Information:
• Monthly and yearly plans available
• Free trial: [if offered] 7 days
• Auto-renewal: Manage in Settings
• Cancel anytime before renewal
```

**App Review Notes:**
```
Reviewer Notes:

Test Account (if needed):
- Email: reviewer@feliapp.com
- Password: [provide if auth required]

Features to Test:
1. Photo Upload → Analysis
2. Free tier (2 analyses/day limit)
3. Pro tier (subscribe via sandbox)
4. Restore purchases
5. Subscription management

Non-Medical Compliance:
- All language is wellness-focused
- Clear disclaimers throughout app
- "Not medical advice" stated prominently
- No diagnostic claims made

Subscription Testing:
- Use App Store sandbox account
- Test monthly and yearly plans
- Verify restore purchases works
- Check cancellation flow
```

### Google Play Store Checklist

**App Details:**
- [ ] App Name: FELI - Cat Emotion Insights
- [ ] Short Description: Understand your cat's emotional state
- [ ] Full Description: (similar to Apple, 4000 char max)
- [ ] Category: Lifestyle

**Screenshots Required:**
- [ ] Phone: 1080 x 1920 (min 2, max 8)
- [ ] Tablet: 1440 x 2560 (recommended)

**Content Rating:**
- [ ] Complete questionnaire
- [ ] Expected rating: Everyone

**Privacy Policy:**
- [ ] URL to hosted privacy policy (required)
- [ ] Data safety form completed

**Subscription Declaration:**
```
This app offers auto-renewing subscriptions.

Subscription Benefits:
- Unlimited photo analyses
- Detailed emotional insights
- Advanced behavioral metrics

Pricing:
- Monthly: $4.99
- Yearly: $39.99

Terms:
- Automatically renews unless cancelled
- Payment charged to Google Play account
- Manage/cancel in Google Play subscriptions
- No refunds for partial periods
```

---

## Legal Templates

### Terms of Service (Key Sections)

```markdown
# FELI Terms of Service

## 1. Acceptance of Terms
By using FELI, you agree to these terms and our Privacy Policy.

## 2. Description of Service
FELI provides behavioral insights for cats based on photo analysis.
This is NOT medical advice.

## 3. Medical Disclaimer
FELI does not diagnose, treat, or prevent any medical condition.
Always consult a licensed veterinarian for health concerns.

## 4. Subscription Terms
- Subscriptions auto-renew
- Cancel 24 hours before renewal to avoid charges
- Refunds per Apple/Google policy
- No partial refunds

## 5. User Responsibilities
- Provide accurate information
- Use service lawfully
- Do not misuse analysis results
- Seek professional help when needed

## 6. Limitation of Liability
FELI is provided "as is" without warranties. We are not liable for
decisions made based on app insights.

## 7. Changes to Terms
We may update these terms. Continued use means acceptance.
```

### Subscription Terms Template

```markdown
# Subscription Agreement

## Monthly Subscription
- Price: $4.99/month
- Renews automatically each month
- Cancel anytime in device settings
- Access until end of billing period after cancellation

## Yearly Subscription
- Price: $39.99/year (33% savings)
- Renews automatically each year
- Cancel anytime in device settings
- Access until end of billing period after cancellation

## Free Trial (if offered)
- 7-day free trial on yearly plan
- Cancel before trial ends: no charge
- Auto-converts to paid subscription after trial
- Trial available to new subscribers only

## Cancellation
Cancel anytime:
- iOS: Settings → [Your Name] → Subscriptions
- Android: Play Store → Menu → Subscriptions
- No refunds for partial billing periods

## Refunds
- Handled by Apple/Google per their policies
- Contact platform support for refund requests
- Refund eligibility determined by platform

## Changes
We reserve the right to change subscription pricing with 30 days notice.
```

---

## Compliance Checklist

### Pre-Launch Legal Review

- [ ] Privacy Policy reviewed by legal counsel
- [ ] Terms of Service reviewed by legal counsel
- [ ] Medical disclaimer approved
- [ ] Cancellation policy clear and accessible
- [ ] Refund policy compliant with Apple/Google
- [ ] Age rating appropriate
- [ ] Content rating accurate
- [ ] No medical claims in marketing
- [ ] Subscription terms transparent

### App Store Compliance

- [ ] All text uses wellness language (not medical)
- [ ] Disclaimers prominent and clear
- [ ] Subscription auto-renewal disclosed
- [ ] Cancellation instructions provided
- [ ] No external payment links
- [ ] Privacy policy linked
- [ ] Terms of service linked
- [ ] Contact information provided

### Testing

- [ ] Disclaimer shown on first launch
- [ ] Terms must be accepted before use
- [ ] Privacy policy accessible from settings
- [ ] Cancellation instructions in app
- [ ] Restore purchases works correctly
- [ ] Subscription status updates properly

---

## Support Documentation

### Customer Support Template

**Common Questions:**

**Q: Is FELI a medical app?**
A: No. FELI provides general behavioral insights based on visual cues.
It does not diagnose medical conditions. Always consult a vet for health issues.

**Q: How accurate is the analysis?**
A: FELI provides insights based on observable behavior patterns. Accuracy
varies based on photo quality and cat's visible cues. This is not diagnostic.

**Q: Can I cancel my subscription?**
A: Yes, anytime. Go to Settings → Subscriptions on your device.
You'll keep Pro access until the end of your billing period.

**Q: Will I be charged after my trial?**
A: Yes, unless you cancel before the trial ends. Cancel in device settings.

**Q: Do you share my cat's photos?**
A: Photos are processed for analysis but not permanently stored or shared
with third parties beyond our secure analysis provider.

---

**Last Review:** 2025-12-28
**Next Review:** Before app store submission
**Legal Counsel:** [To be completed]
