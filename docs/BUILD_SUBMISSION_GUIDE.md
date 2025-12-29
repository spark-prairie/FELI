# Build & Submission Guide - TestFlight & Google Play Internal Testing

**Version:** 1.0.0
**Last Updated:** 2025-12-29
**Target:** Internal Beta Distribution

---

## Overview

This guide provides step-by-step instructions for building and submitting FELI to TestFlight (iOS) and Google Play Internal Testing (Android) for beta testing.

---

## Prerequisites

### 1. EAS CLI Setup

Ensure you have EAS CLI installed and authenticated:

```bash
# Install EAS CLI globally (if not already installed)
npm install -g eas-cli

# Login to your Expo account
eas login
```

**Expected Output:**
```
✔ Logged in as sparkprairie
```

### 2. Environment Variables

Ensure `.env.production` exists with all required variables:

```bash
# Check if .env.production exists
ls -la .env.production
```

**Required Variables:**
- `API_URL` - Production API endpoint
- `SECRET_KEY` - Production secret key
- `VAR_NUMBER` - Example numeric variable
- `VAR_BOOL` - Example boolean variable

**Note:** RevenueCat keys are configured in the code (see `src/stores/subscription-store.ts`).

### 3. App Store Connect / Google Play Console Access

- **iOS:** Ensure you have access to App Store Connect with TestFlight permissions
- **Android:** Ensure you have access to Google Play Console with Internal Testing permissions

---

## Pre-Build Checklist

Before running builds, verify the following:

- [ ] ✅ TypeScript compilation passes: `npx tsc --noEmit`
- [ ] ✅ App icon exists: `./assets/icon.png` (1024x1024px)
- [ ] ✅ Adaptive icon exists: `./assets/adaptive-icon.png` (1024x1024px)
- [ ] ✅ Splash screen exists: `./assets/splash-icon.png`
- [ ] ✅ Bundle ID is correct in `env.js`: `com.feli`
- [ ] ✅ Version is correct in `package.json`: `1.0.0`
- [ ] ✅ EAS Project ID is set: `efe4c6ac-1f13-4b1b-998a-b6ce2f800a18`
- [ ] ✅ `.env.production` file exists with all required variables
- [ ] ✅ Git working directory is clean (no uncommitted changes)

**Run Pre-flight Check:**
```bash
npx expo-doctor
```

**Known Issues (Non-blocking):**
- Multiple lock files warning (pnpm + npm) - can be ignored
- Outdated dependency warnings - EAS Build uses fresh install

---

## iOS Build & Submission

### Step 1: Configure App Store Connect

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **"My Apps"** → **"+"** → **"New App"**
3. Fill in app information:
   - **Platform:** iOS
   - **Name:** FELI
   - **Primary Language:** English (US)
   - **Bundle ID:** `com.feli` (must match `env.js`)
   - **SKU:** `com.feli.1.0.0` (or any unique identifier)
   - **User Access:** Full Access

4. Set up TestFlight:
   - Navigate to **TestFlight** tab
   - Create **Internal Testing Group** (e.g., "FELI Beta Team")
   - Add internal testers (emails of team members)

### Step 2: Build for iOS Production

Run the production build command:

```bash
eas build --platform ios --profile production
```

**What Happens:**
1. EAS Build reads `eas.json` production profile
2. Installs dependencies fresh in cloud environment
3. Compiles iOS app with production configuration
4. Auto-increments build number (from previous builds)
5. Generates `.ipa` file
6. Uploads to EAS servers

**Expected Output:**
```
✔ Build started, it may take a few minutes to complete.
✔ You can monitor the build at https://expo.dev/accounts/sparkprairie/projects/feli/builds/...

Build Metadata:
  App: FELI
  Bundle ID: com.feli
  Version: 1.0.0
  Build Number: 1 (auto-incremented)
  Profile: production
```

**Build Time:** Approximately 10-20 minutes

### Step 3: Submit to TestFlight

Once the iOS build completes:

```bash
eas submit --platform ios --profile production
```

**Interactive Prompts:**
1. **Select build:** Choose the build you just created (most recent)
2. **App Store Connect API Key:** Use existing credentials or create new
3. **Confirm submission:** Yes

**Alternative (Non-interactive):**
```bash
eas submit --platform ios --latest --profile production --non-interactive
```

**What Happens:**
1. Downloads `.ipa` from EAS servers
2. Validates app with App Store Connect
3. Uploads to TestFlight
4. Processes build (Apple's servers, ~5-15 minutes)

**Expected Output:**
```
✔ Submitted to App Store Connect!
✔ Build is processing on Apple's servers
✔ You'll receive an email when it's ready for testing
```

### Step 4: Distribute to Testers

1. Go to [App Store Connect](https://appstoreconnect.apple.com/)
2. Navigate to **TestFlight** → **iOS** → Select your build
3. Wait for **"Ready to Test"** status (Apple review, ~5 minutes - 24 hours)
4. Select **Internal Testing Group**
5. Click **"Add Build"** → Select your build → Save
6. Testers receive TestFlight invitation email

**TestFlight Invite Email Contains:**
- Download link to TestFlight app
- Redemption code (if required)
- Instructions to install FELI beta

---

## Android Build & Submission

### Step 1: Configure Google Play Console

1. Go to [Google Play Console](https://play.google.com/console/)
2. Click **"Create app"**
3. Fill in app details:
   - **App name:** FELI: Cat Emotion Reader
   - **Default language:** English (United States)
   - **App or game:** App
   - **Free or paid:** Free
   - **Declarations:** Accept policies

4. Complete **Store Presence:**
   - App category: Lifestyle
   - Contact email: support@feliapp.com
   - Privacy policy URL: https://feliapp.com/privacy

5. Set up **Internal Testing:**
   - Navigate to **Testing** → **Internal testing**
   - Create **"Internal Testing Track"**
   - Create **Testers List** (add emails)

### Step 2: Build for Android Production

Run the production build command:

```bash
eas build --platform android --profile production
```

**What Happens:**
1. EAS Build reads `eas.json` production profile
2. Installs dependencies fresh in cloud environment
3. Compiles Android app with production configuration
4. Auto-increments version code (from previous builds)
5. Generates `.aab` file (App Bundle - required for Play Store)
6. Signs with your credentials
7. Uploads to EAS servers

**Expected Output:**
```
✔ Build started, it may take a few minutes to complete.
✔ You can monitor the build at https://expo.dev/accounts/sparkprairie/projects/feli/builds/...

Build Metadata:
  App: FELI
  Package: com.feli
  Version Name: 1.0.0
  Version Code: 1 (auto-incremented)
  Profile: production
```

**Build Time:** Approximately 10-20 minutes

### Step 3: Submit to Google Play Internal Testing

Once the Android build completes:

```bash
eas submit --platform android --profile production
```

**Interactive Prompts:**
1. **Select build:** Choose the build you just created (most recent)
2. **Google Service Account Key:** Upload JSON key file (from Play Console)
3. **Track:** Select "internal" (for internal testing)
4. **Confirm submission:** Yes

**Alternative (Non-interactive):**
```bash
eas submit --platform android --latest --track internal --profile production --non-interactive
```

**What Happens:**
1. Downloads `.aab` from EAS servers
2. Validates app bundle
3. Uploads to Google Play Console
4. Assigns to Internal Testing track
5. Processes build (Google's servers, ~5-30 minutes)

**Expected Output:**
```
✔ Submitted to Google Play!
✔ Build is processing on Google's servers
✔ Track: internal
✔ Release status: Draft → Review → Published
```

### Step 4: Distribute to Testers

1. Go to [Google Play Console](https://play.google.com/console/)
2. Navigate to **Testing** → **Internal testing**
3. **Review Release:**
   - Release name: "FELI 1.0.0 - Internal Beta 1"
   - Release notes: Copy from `docs/BETA_RELEASE_NOTES.md` (summary)
4. Click **"Review release"** → **"Start rollout to Internal testing"**
5. Testers access app via **Internal Testing Link**

**Internal Testing Link:**
```
https://play.google.com/apps/internaltest/XXXXXXXXXXXXXXXX
```

Share this link with testers to install the beta.

---

## Build Commands Quick Reference

### iOS

```bash
# Production build
eas build --platform ios --profile production

# Submit to TestFlight
eas submit --platform ios --latest

# Monitor build status
eas build:list --platform ios
```

### Android

```bash
# Production build
eas build --platform android --profile production

# Submit to Internal Testing
eas submit --platform android --latest --track internal

# Monitor build status
eas build:list --platform android
```

### Both Platforms (Parallel)

```bash
# Build both iOS and Android simultaneously
eas build --platform all --profile production
```

**Note:** This creates two separate builds in parallel, reducing total wait time.

---

## Troubleshooting Common Issues

### Issue 1: Build Fails with "Invalid Bundle ID"

**Symptom:**
```
✖ Error: Invalid bundle identifier: com.feli.development
```

**Solution:**
Ensure you're using the production profile:
```bash
eas build --platform ios --profile production
```

The production profile uses `com.feli` (no suffix).

---

### Issue 2: "No credentials configured"

**Symptom:**
```
✖ Error: No credentials found for com.feli
```

**Solution:**
Generate credentials automatically:
```bash
eas credentials
```

Select:
1. **iOS** or **Android**
2. **Production** profile
3. **"Set up new credentials"**
4. Follow prompts to generate/upload certificates

---

### Issue 3: Build Fails with "ENOENT: Icon not found"

**Symptom:**
```
✖ Error: ENOENT: no such file or directory, open './assets/icon.png'
```

**Solution:**
Verify icon files exist:
```bash
ls -la assets/
```

Ensure these files are present:
- `icon.png` (1024x1024px)
- `adaptive-icon.png` (1024x1024px)
- `splash-icon.png` (1284x2778px recommended)

---

### Issue 4: Submission Fails with "Invalid App Store Connect API Key"

**Symptom:**
```
✖ Error: Invalid App Store Connect API Key
```

**Solution:**
Generate a new API key in App Store Connect:
1. Go to **Users and Access** → **Integrations** → **App Store Connect API**
2. Generate new key with **"App Manager"** role
3. Download `.p8` file
4. Upload to EAS: `eas submit --platform ios` (follow prompts)

---

### Issue 5: Android Submission Fails with "Service Account Error"

**Symptom:**
```
✖ Error: Invalid service account credentials
```

**Solution:**
Generate Google Service Account JSON:
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create new service account with **"Service Account User"** role
3. Download JSON key file
4. Upload to EAS: `eas submit --platform android` (follow prompts)

---

### Issue 6: "Version code must be greater than previous version"

**Symptom:**
```
✖ Error: Version code 1 has already been used
```

**Solution:**
The `autoIncrement: true` setting in `eas.json` should handle this automatically. If it doesn't:

1. Manually increment build number:
   - **iOS:** Update `ios.buildNumber` in `app.config.ts`
   - **Android:** Update `android.versionCode` in `app.config.ts`

2. Or force a fresh build:
```bash
eas build --platform android --profile production --clear-cache
```

---

## Post-Submission Monitoring

### iOS TestFlight Status

Track build status in App Store Connect:
1. Go to **TestFlight** → **iOS**
2. Check build status:
   - **Processing:** Apple is reviewing the build
   - **Waiting for Review:** Internal testing ready, external testing pending
   - **Ready to Test:** Available for distribution

**Typical Timeline:**
- **Internal Testing:** 5 minutes - 2 hours
- **External Testing:** 24-48 hours (Apple review)

### Android Internal Testing Status

Track build status in Google Play Console:
1. Go to **Testing** → **Internal testing**
2. Check release status:
   - **Draft:** Not yet published
   - **In review:** Google is reviewing
   - **Published:** Available to testers

**Typical Timeline:**
- **Internal Testing:** 5-30 minutes (no Google review required)
- **Open Testing / Production:** 1-7 days (Google review)

---

## Distribution to Testers

### iOS TestFlight Instructions for Testers

**Email Template:**
```
Subject: FELI Beta Testing - TestFlight Invitation

Hi [Tester Name],

You've been invited to test FELI, our AI-powered cat emotion analysis app!

To get started:
1. Install TestFlight from the App Store: https://apps.apple.com/app/testflight/id899247664
2. Open the invitation email from Apple
3. Tap "View in TestFlight" or "Start Testing"
4. Install FELI from TestFlight

Testing Guide:
Please refer to the attached "BETA_RELEASE_NOTES.md" for what to test and how to report issues.

Questions?
Contact us at support@feliapp.com

Thank you for helping us improve FELI!
```

### Android Internal Testing Instructions for Testers

**Email Template:**
```
Subject: FELI Beta Testing - Google Play Internal Testing

Hi [Tester Name],

You've been invited to test FELI, our AI-powered cat emotion analysis app!

To get started:
1. Visit this link: [Insert Internal Testing Link]
2. Sign in with your Google account (must be the email we invited)
3. Accept the invitation
4. Download FELI from Google Play

Testing Guide:
Please refer to the attached "BETA_RELEASE_NOTES.md" for what to test and how to report issues.

Questions?
Contact us at support@feliapp.com

Thank you for helping us improve FELI!
```

---

## Version Management

### When to Increment Version

**Patch Version (1.0.X):**
- Bug fixes
- Minor UI tweaks
- Performance improvements
- No new features

**Minor Version (1.X.0):**
- New features added
- Significant UI changes
- New functionality

**Major Version (X.0.0):**
- Complete redesigns
- Breaking changes
- Major architectural changes

### How to Increment Version

1. Update `package.json`:
```json
{
  "version": "1.0.1"
}
```

2. Build number auto-increments via `eas.json`:
```json
{
  "production": {
    "autoIncrement": true
  }
}
```

**Result:**
- **Version:** 1.0.1 (from package.json)
- **Build Number:** 2, 3, 4... (auto-incremented)

---

## Testing Timeline Recommendation

Based on the beta testing guide in `docs/BETA_RELEASE_NOTES.md`:

### Week 1 (2025-12-30 to 2026-01-05): Internal Team Testing
- **Focus:** Critical flows, crashes, core functionality
- **Testers:** Internal team (5-10 people)
- **Goal:** Identify showstopper bugs

### Week 2 (2026-01-06 to 2026-01-12): External Beta Testing
- **Focus:** Usability, edge cases, diverse devices
- **Testers:** Friends, family, trusted users (20-50 people)
- **Goal:** Gather UX feedback, test on various devices

### Week 3 (2026-01-13 to 2026-01-19): Bug Fixes & Polish
- **Focus:** Fix reported issues, polish UI
- **Testers:** Continue external testing with updated builds
- **Goal:** Achieve "zero critical bugs" status

### Production Release: January 20, 2026
- Submit to App Store / Google Play for public release
- Monitor reviews and crash reports
- Prepare hotfix pipeline

---

## Success Criteria

Before submitting to production, ensure:

- [ ] ✅ **Zero crashes** in normal usage (crash-free rate >99%)
- [ ] ✅ **Core flow works** (photo → analysis → results → history)
- [ ] ✅ **Pro upgrade works** (mock purchase for testing, real RevenueCat for production)
- [ ] ✅ **History persists** across app restarts
- [ ] ✅ **UI is polished** (no visual bugs, dark mode works)
- [ ] ✅ **Permissions work** correctly
- [ ] ✅ **Performance is smooth** (no lag, fast load times)
- [ ] ✅ **All critical feedback addressed** from beta testing

---

## Next Steps After Beta

Once beta testing is successful:

1. **Update Marketing Assets:**
   - Finalize screenshots (see `store_metadata/marketing/screenshots_plan.md`)
   - Record 30-second preview video
   - Finalize app descriptions (see `store_metadata/marketing/ios_metadata.txt` and `android_metadata.txt`)

2. **Submit for Production Review:**
   - **iOS:** Submit to App Store Review (typically 1-3 days)
   - **Android:** Submit to Production (typically 3-7 days)

3. **Monitor Launch:**
   - Track installs, crashes, reviews
   - Respond to user feedback within 24 hours
   - Prepare hotfix builds for critical issues

4. **Plan Updates:**
   - Collect feature requests
   - Prioritize next sprint
   - Schedule regular update cadence (bi-weekly or monthly)

---

## Contact & Support

**Developer Email:** support@feliapp.com
**EAS Dashboard:** https://expo.dev/accounts/sparkprairie/projects/feli
**App Store Connect:** https://appstoreconnect.apple.com/
**Google Play Console:** https://play.google.com/console/

---

**Last Updated:** 2025-12-29
**Document Version:** 1.0
**Build:** 1.0.0 (1)
