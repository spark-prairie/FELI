# FELI Beta Release - Internal Testing Guide

**Current Version:** 1.0.1 (Build 2) - Day 21 Patch
**Initial Version:** 1.0.0 (Build 1)
**Release Date:** 2025-12-29
**Platform:** iOS (TestFlight) & Android (Play Internal Testing)
**Status:** 🧪 Internal Beta Testing

---

## 🆕 What's New in Build 2 (v1.0.1) - Day 21 Patch

**Release Date:** 2025-12-30

### Bug Fixes

✅ **Fixed error screen state management (Critical)**
- Error screen now properly resets analysis state before retrying
- "Try Again" button now correctly clears stale data and allows re-analysis
- "Back to Home" button properly cleans up state before navigation

✅ **Added multilingual support for error messages**
- Error screen now uses translation system (was hardcoded English)
- Supports all 10 app languages
- Improved accessibility with screen reader support for error emoji

✅ **Spanish language support (Complete)**
- Added complete Spanish translation file (`es.json`)
- All UI text now properly translates to Spanish
- Fixed "Analizar" button spelling (was showing as "Analisar")

✅ **Improved dark mode readability**
- Adjusted neutral-400 and neutral-500 colors for better dark mode contrast
- Text is now more comfortable to read in low light conditions
- Reduced eye strain from overly bright text colors

### Technical Improvements

- Enhanced state cleanup when navigating away from analysis flows
- Improved error handling with proper accessibility labels
- Better memory management for analysis state

### Known Issues

- ⚠️ Some subscription-gate tests failing (pre-existing, not related to this patch)
- ⚠️ Mock AI still returns pre-determined results (expected for beta)
- ⚠️ Developer tools still visible in Settings (will be hidden in production)

---

## 📱 What is FELI?

FELI (Feline Emotion & Life Insights) is an AI-powered mobile app that helps cat owners understand their cat's emotional state through facial expression and body language analysis.

**Key Features:**
- 📸 Instant AI-powered emotion analysis
- 🎯 Pro insights with exact confidence scores
- 📊 Mood history tracking
- 🌍 10-language support
- ♿ Full accessibility features

---

## 🎯 What to Test

This beta build is feature-complete and ready for real-world testing. Please focus on the following areas:

### **1. AI Analysis Flow** (Critical Path)

#### **Test Steps:**
1. Open the app → Home screen appears
2. Tap **"Take or Choose Photo"** button
3. Grant **Camera** and **Photos** permissions when prompted
4. Select photo option:
   - **Option A:** Tap "📷 Take Photo" → Use camera to capture cat photo
   - **Option B:** Tap "🖼️ Choose from Gallery" → Select existing cat photo

5. Review photo on Preview screen
6. Tap **"Analyze"** button
7. Wait for AI processing (1-1.5 seconds)
8. View results on Result screen

#### **Expected Result:**
- ✅ Analysis completes successfully
- ✅ Primary emotion displayed with emoji (😌 Relaxed, 👀 Alert, 😰 Anxious, 😾 Irritated, or 😿 Possible Discomfort)
- ✅ **Free tier:** General confidence level ("High", "Medium", or "Low")
- ✅ **Free tier:** 3 behavioral observations
- ✅ **Free tier:** 2 action suggestions
- ✅ **Free tier:** Secondary emotion shows lock icon 🔒
- ✅ Disclaimer message displayed at bottom

#### **What to Check:**
- [ ] Photo capture works smoothly
- [ ] Gallery selection works correctly
- [ ] Analysis loading indicator appears
- [ ] Results display correctly
- [ ] Text is readable and properly formatted
- [ ] Emojis render correctly
- [ ] **Dark Mode:** Results look good in dark mode (toggle in device settings)

#### **Known Behavior:**
- ⚠️ Currently using **mock AI** (no real backend) - results are simulated
- ⚠️ Analysis results are **pre-determined** for testing purposes
- ⚠️ All cat photos will return "Relaxed" emotion with 72% confidence (this is expected)

---

### **2. Mock Purchase Flow (Pro Upgrade)** (Critical)

#### **Test Steps:**
1. From Home screen, tap **"Settings"** tab
2. Scroll to **"Subscription"** section
3. Tap **"Manage Subscription"**
4. Tap **"Mock Purchase (Dev Only)"** button
5. Observe UI updates

#### **Expected Result:**
- ✅ Button changes to **"Mock Cancel"**
- ✅ Status changes to **"Pro Member"**
- ✅ Green checkmark ✓ appears
- ✅ Usage banner updates to show **"Unlimited analyses"**

#### **Test Pro Features:**
After mock purchase, run another analysis:

1. Return to Home screen
2. Take/choose another cat photo
3. Analyze the photo
4. **Verify Pro features appear:**
   - ✅ **Exact confidence percentage** (e.g., "87% confidence")
   - ✅ **Purple Pro badge** on emotion card
   - ✅ **Secondary Emotion card visible** (no lock icon)
   - ✅ **6 behavioral observations** (instead of 3)
   - ✅ **4 action suggestions** (instead of 2)
   - ✅ **Purple accent colors** throughout

#### **Test Mock Cancellation:**
1. Go back to Settings → Manage Subscription
2. Tap **"Mock Cancel"**
3. Verify status returns to **"Free Member"**
4. Run another analysis
5. Verify Free limitations are restored (3 cues, 2 suggestions, locked secondary emotion)

#### **What to Check:**
- [ ] Purchase flow is intuitive
- [ ] Pro status persists after app restart
- [ ] Pro badge appears on emotion cards
- [ ] Secondary emotion unlocks correctly
- [ ] Cancellation works and reverts to Free tier

#### **Known Behavior:**
- ⚠️ **This is a MOCK purchase** - no real money is charged
- ⚠️ Real in-app purchases are disabled in this build
- ⚠️ RevenueCat integration is in mock mode for testing

---

### **3. History Persistence** (Important)

#### **Test Steps:**
1. Complete 3-5 analyses (mix of Free and Pro if possible)
2. After each analysis, tap **"Back to Home"**
3. Navigate to **"History"** tab
4. View saved analyses

#### **Expected Result:**
- ✅ All analyses appear in chronological order (newest first)
- ✅ Each entry shows:
  - Emotion emoji
  - Date and time
  - "Free" or "Pro" badge (if applicable)
- ✅ Tap any entry → Shows full analysis detail
- ✅ **Pro records retain Pro data** (exact percentages, secondary emotion, all cues)
- ✅ **Free records show limited data** (general confidence, 3 cues, 2 suggestions)

#### **Test Persistence:**
1. **Force-quit the app** (swipe up from multitasking)
2. **Re-open the app**
3. Navigate to History
4. Verify all saved analyses are still there

#### **Test Pro Record Persistence:**
1. While in Pro mode, save 2 analyses
2. Mock Cancel (revert to Free)
3. View History
4. Tap on a Pro record saved earlier
5. **Verify:** Pro features are still visible (percentages, secondary emotion, 6 cues)

#### **What to Check:**
- [ ] History persists across app restarts
- [ ] Pro status is captured correctly at save time
- [ ] Historical Pro records retain Pro data even after downgrading
- [ ] Dates and times are accurate
- [ ] List scrolls smoothly

#### **Known Behavior:**
- ⚠️ Maximum 10 entries stored (oldest automatically removed)
- ⚠️ No images are saved (only analysis results)

---

### **4. Daily Usage Limits (Free Tier)** (Important)

#### **Test Steps:**
1. Ensure you're in **Free mode** (not Pro)
2. Run **2 analyses** (use any cat photos)
3. Try to run a **3rd analysis**

#### **Expected Result:**
- ✅ After 2nd analysis, usage banner shows **"2/2 analyses used today"**
- ✅ "Take or Choose Photo" button becomes **disabled** (grayed out)
- ✅ Tapping the disabled button shows alert:
  - Title: "Daily Limit Reached"
  - Message: "You've used 2/2 analyses today. Upgrade to Pro for unlimited analyses."
  - Buttons: "Cancel" and "Upgrade to Pro"

#### **Test Limit Reset:**
1. Go to Settings → Developer Tools
2. Tap **"Reset Daily Usage"**
3. Return to Home
4. Verify usage shows **"0/2 analyses used today"**
5. Verify button is enabled again

#### **What to Check:**
- [ ] Limit enforcement works correctly
- [ ] Alert message is clear and helpful
- [ ] "Upgrade to Pro" button navigates to paywall
- [ ] Developer reset tool works (dev builds only)

#### **Known Behavior:**
- ⚠️ Limit resets automatically at midnight (device local time)
- ⚠️ Pro users see "Unlimited analyses" and no limit

---

### **5. Permissions & Privacy** (Critical)

#### **Test Steps:**
1. **Fresh install:** Delete app if previously installed
2. Open app for the first time
3. Tap "Take or Choose Photo"
4. Observe permission prompts

#### **Expected Permissions:**
- **Camera:** "FELI would like to access the camera" (iOS) / "Allow FELI to take pictures and record video?" (Android)
- **Photos:** "FELI would like to access your photos" (iOS) / "Allow FELI to access photos and media?" (Android)

#### **Test Permission Denial:**
1. Tap **"Don't Allow"** / **"Deny"**
2. Try to use camera/gallery again
3. Verify app handles denial gracefully (shows alert or navigates to settings)

#### **Test Permission Grant After Denial:**
1. Go to device Settings → Apps → FELI → Permissions
2. Enable Camera and Photos
3. Return to app
4. Verify camera/gallery now works

#### **What to Check:**
- [ ] Permission prompts appear at appropriate times
- [ ] Purpose strings are clear and professional
- [ ] Denial is handled without crashing
- [ ] Re-enabling permissions works

#### **Known Behavior:**
- ⚠️ No photos are uploaded to servers (all processing is mock/local)
- ⚠️ No analytics or tracking in this beta build

---

### **6. Multilingual Support** (Nice to Have)

#### **Test Steps:**
1. Go to Settings → Language
2. Select a different language (e.g., Spanish, French, Chinese)
3. Navigate through the app

#### **Supported Languages:**
- English 🇺🇸
- Spanish 🇪🇸
- French 🇫🇷
- German 🇩🇪
- Italian 🇮🇹
- Portuguese 🇵🇹
- Chinese (Simplified) 🇨🇳
- Japanese 🇯🇵
- Korean 🇰🇷
- Arabic 🇸🇦

#### **Expected Result:**
- ✅ All UI text translates correctly
- ✅ Layouts adjust for text length
- ✅ Arabic displays right-to-left
- ✅ No truncated text
- ✅ Emotion names translate correctly

#### **What to Check:**
- [ ] Translations are accurate and natural
- [ ] No text overflow or truncation
- [ ] RTL languages (Arabic) display correctly
- [ ] Icons and emojis remain consistent

---

### **7. Accessibility Features** (Nice to Have)

#### **Test Steps (iOS):**
1. Enable VoiceOver: Settings → Accessibility → VoiceOver → ON
2. Navigate through FELI using VoiceOver
3. Test all major screens

#### **Test Steps (Android):**
1. Enable TalkBack: Settings → Accessibility → TalkBack → ON
2. Navigate through FELI using TalkBack
3. Test all major screens

#### **Expected Result:**
- ✅ All buttons have clear labels
- ✅ Screen reader announces emotion results
- ✅ Images have descriptive alt text
- ✅ Navigation is logical and sequential
- ✅ Focus indicators are visible

#### **What to Check:**
- [ ] VoiceOver/TalkBack reads all content
- [ ] No unlabeled buttons or controls
- [ ] Gestures work with screen readers
- [ ] Contrast is sufficient (WCAG AA)

---

## 🐛 Known Issues (Expected Behavior)

### **Not Bugs - Expected in Beta:**

1. **Mock AI Only**
   - All analyses return pre-determined results
   - Real AI backend is not connected yet
   - All cat photos will show "Relaxed - 72% confidence"

2. **Mock Purchases**
   - RevenueCat is in mock mode
   - No real purchases are processed
   - Mock Purchase button only appears in dev builds

3. **Limited Analysis Variance**
   - Because AI is mocked, results are predictable
   - This is intentional for testing consistency

4. **Developer Tools Visible**
   - Settings includes "Developer Tools" section
   - This section will be hidden in production builds

---

## 🚨 What to Report (PLEASE FLAG THESE)

### **Critical Issues (Report Immediately):**
- ❌ App crashes
- ❌ Cannot take or select photos
- ❌ Analysis never completes (stuck on loading)
- ❌ Pro features don't unlock after mock purchase
- ❌ History doesn't save or disappears
- ❌ Daily limit doesn't reset
- ❌ App freezes or becomes unresponsive

### **High Priority Issues:**
- ⚠️ Text is truncated or overlapping
- ⚠️ Dark mode looks broken
- ⚠️ Buttons don't respond to taps
- ⚠️ Navigation gets stuck
- ⚠️ Permissions don't work after granting
- ⚠️ Language translations are incorrect

### **Medium Priority Issues:**
- 🔶 Minor visual glitches
- 🔶 Animations are janky
- 🔶 Text is unclear or confusing
- 🔶 Icons are misaligned
- 🔶 Performance is slow

### **Low Priority (Nice to Have):**
- 💡 Suggestions for UX improvements
- 💡 Copywriting suggestions
- 💡 Feature requests
- 💡 Design feedback

---

## 📸 How to Report Issues

### **Use TestFlight Feedback (iOS):**
1. Take a screenshot when issue occurs
2. Shake your device → "Send Beta Feedback"
3. Include:
   - What you were trying to do
   - What happened (vs what you expected)
   - Steps to reproduce

### **Use Google Play Console (Android):**
1. Open app → Menu → "Send Feedback"
2. Include same details as above

### **Or Email Us:**
📧 support@feliapp.com

**Please include:**
- Device model (e.g., iPhone 13 Pro, Pixel 6)
- OS version (e.g., iOS 17.2, Android 13)
- App version (shown in Settings → About)
- Steps to reproduce
- Screenshots or screen recordings (if possible)

---

## ✅ Beta Testing Checklist

Use this checklist to ensure comprehensive testing:

### **Core Flows:**
- [ ] Install app from TestFlight / Play Store
- [ ] Grant camera and photos permissions
- [ ] Take photo with camera
- [ ] Select photo from gallery
- [ ] Complete analysis (Free tier)
- [ ] View result details
- [ ] Save result to history
- [ ] Mock purchase to Pro
- [ ] Complete analysis (Pro tier)
- [ ] Verify Pro features appear
- [ ] Mock cancel Pro
- [ ] Verify Free features restored

### **History & Persistence:**
- [ ] View history list
- [ ] Tap on saved analysis
- [ ] Verify Pro records retain Pro data
- [ ] Force-quit app
- [ ] Re-open app
- [ ] Verify history persists

### **Limits & Permissions:**
- [ ] Hit daily limit (2 analyses)
- [ ] Verify button disables
- [ ] Reset daily usage (Dev Tools)
- [ ] Deny camera permission
- [ ] Grant permission from settings
- [ ] Verify camera works after grant

### **UI & Localization:**
- [ ] Test dark mode
- [ ] Change language
- [ ] Check translations
- [ ] Test accessibility (VoiceOver/TalkBack)
- [ ] Verify layout on different screen sizes

### **Edge Cases:**
- [ ] Test with poor network connection
- [ ] Test airplane mode
- [ ] Test with battery saver mode
- [ ] Test after OS update
- [ ] Test with low storage

---

## 🎯 Success Criteria

This beta is considered successful if:

1. ✅ **Zero crashes** during normal usage
2. ✅ **Core flow works** (photo → analysis → results → history)
3. ✅ **Pro upgrade works** correctly
4. ✅ **History persists** across app restarts
5. ✅ **UI is polished** (no visual bugs)
6. ✅ **Permissions work** correctly
7. ✅ **Performance is smooth** (no lag or stuttering)

---

## 📅 Testing Timeline

**Week 1 (2025-12-30 to 2026-01-05):**
- Internal team testing
- Focus on critical flows and crashes

**Week 2 (2026-01-06 to 2026-01-12):**
- External beta testing (friends & family)
- Focus on usability and edge cases

**Week 3 (2026-01-13 to 2026-01-19):**
- Bug fixes and polish
- Prepare for production release

**Target Production Release:** January 20, 2026

---

## 🙏 Thank You!

Thank you for helping us test FELI! Your feedback is invaluable in making this the best cat emotion analysis app possible.

**Questions?** Contact us at support@feliapp.com

**Pro Tip:** Take notes as you test! Even small observations ("this button felt hard to tap") are incredibly useful.

Happy testing! 🐱✨

---

**Last Updated:** 2025-12-29
**Document Version:** 1.0
**Build:** 1.0.0 (1)
