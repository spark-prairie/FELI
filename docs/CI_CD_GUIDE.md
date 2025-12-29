# CI/CD Guide - FELI App

**Last Updated:** 2025-12-28
**EAS CLI Version:** >= 3.8.1

---

## Overview

This guide explains how to use the CI/CD pipeline and trigger builds for the FELI app using GitHub Actions and Expo Application Services (EAS).

---

## Table of Contents

1. [CI Pipeline](#ci-pipeline)
2. [EAS Build Profiles](#eas-build-profiles)
3. [Setting Up GitHub Secrets](#setting-up-github-secrets)
4. [Triggering Builds](#triggering-builds)
5. [OTA Updates](#ota-updates)
6. [Troubleshooting](#troubleshooting)

---

## CI Pipeline

### **Workflow: `.github/workflows/ci.yml`**

The unified CI pipeline runs automatically on:
- **Pull Requests** to `main` or `develop` branches
- **Pushes** to `main` or `develop` branches

### **Jobs Executed (in parallel):**

1. **🏥 Expo Doctor** - Verifies project health
2. **🧹 Lint** - ESLint + Prettier checks
3. **🔍 Type Check** - TypeScript compilation
4. **🧪 Tests** - Jest unit tests with coverage

All jobs must pass for the CI to succeed.

### **Local Testing:**

Before pushing, run locally to catch issues:

```bash
# Run all checks
pnpm run check-all

# Or run individually
pnpm run lint           # ESLint
pnpm type-check         # TypeScript
pnpm test               # Jest tests
pnpm doctor             # Expo Doctor
```

---

## EAS Build Profiles

The app has **3 build profiles** configured in `eas.json`:

### **1. Development Profile**

**Purpose:** Development builds with Expo Dev Client
**Distribution:** Internal testing
**Channel:** `development` (for OTA updates)

**Features:**
- Development client enabled
- Fast refresh
- Dev tools enabled

**Build Commands:**
```bash
# iOS
pnpm run build:development:ios

# Android
pnpm run build:development:android
```

---

### **2. Preview Profile**

**Purpose:** Testing builds for QA and stakeholders
**Distribution:** Internal (TestFlight, Google Play Internal)
**Channel:** `preview` (for OTA updates)

**Features:**
- iOS: Simulator builds (for testing on Mac)
- Android: APK builds (for direct installation)
- Production-like environment (staging API)

**Build Commands:**
```bash
# iOS (simulator)
pnpm run build:preview:ios

# Android (APK)
pnpm run build:preview:android
```

**Note:** iOS simulator builds can be installed on any Mac for testing without provisioning profiles.

---

### **3. Production Profile**

**Purpose:** App Store / Google Play releases
**Distribution:** Store
**Channel:** `production` (for OTA updates)

**Features:**
- Auto-increment build numbers
- App bundle for Android (smaller downloads)
- Production API environment
- Optimized builds

**Build Commands:**
```bash
# iOS (App Store)
pnpm run build:production:ios

# Android (Google Play)
pnpm run build:production:android
```

---

## Setting Up GitHub Secrets

To enable automated builds via GitHub Actions, you need to set up the `EXPO_TOKEN` secret.

### **Step 1: Generate Expo Access Token**

1. Go to [https://expo.dev/accounts/[account]/settings/access-tokens](https://expo.dev/accounts/[account]/settings/access-tokens)
2. Click **"Create Token"**
3. Name it: `GITHUB_ACTIONS_TOKEN`
4. Copy the generated token

### **Step 2: Add Secret to GitHub**

1. Go to your GitHub repository
2. Navigate to **Settings** → **Secrets and variables** → **Actions**
3. Click **"New repository secret"**
4. Name: `EXPO_TOKEN`
5. Value: Paste the token from Step 1
6. Click **"Add secret"**

### **Step 3: Verify Setup**

The token allows GitHub Actions to:
- Trigger EAS builds
- Publish OTA updates
- Access build artifacts

---

## Triggering Builds

### **Manual Builds (Local)**

Trigger builds from your local machine:

```bash
# Development builds
pnpm run build:development:ios
pnpm run build:development:android

# Preview builds (for QA)
pnpm run build:preview:ios
pnpm run build:preview:android

# Production builds (for App Store / Google Play)
pnpm run build:production:ios
pnpm run build:production:android
```

### **Automated Builds (GitHub Actions)**

**Existing Workflows:**
- `.github/workflows/eas-build-prod.yml` - Production builds
- `.github/workflows/eas-build-qa.yml` - Preview/QA builds

**Trigger Methods:**

1. **Manual Trigger:**
   - Go to **Actions** tab in GitHub
   - Select the workflow (e.g., "EAS Build - Production")
   - Click **"Run workflow"**
   - Select branch and platform

2. **Automatic on Tag:**
   - Production builds trigger on version tags (e.g., `v1.0.0`)

3. **Automatic on Push:**
   - QA builds can trigger on pushes to `develop` branch (configure in workflow)

---

## OTA Updates

Over-the-Air (OTA) updates allow you to push JavaScript/asset updates without going through app stores.

### **Channels:**

- **development:** Development updates
- **preview:** QA/testing updates
- **production:** Production updates

### **Publishing Updates:**

```bash
# Development channel
eas update --branch development --message "Fix login bug"

# Preview channel
eas update --branch preview --message "Add new feature for testing"

# Production channel
eas update --branch production --message "Hotfix: Fix crash on iOS"
```

### **Channel Assignment:**

Users on different build profiles receive updates from their respective channels:
- Development builds → `development` channel
- Preview builds → `preview` channel
- Production builds → `production` channel

### **Update Delivery:**

Updates are delivered automatically when:
- App is opened
- App comes to foreground
- Manual check is triggered

---

## Build Status & Artifacts

### **Check Build Status:**

```bash
# List recent builds
eas build:list

# View specific build
eas build:view [build-id]
```

### **Download Artifacts:**

After a build completes, you can download:
- **iOS:** `.ipa` file (for TestFlight or simulator)
- **Android:** `.apk` or `.aab` file

**Download via CLI:**
```bash
eas build:download [build-id]
```

**Download via Dashboard:**
1. Go to [https://expo.dev](https://expo.dev)
2. Navigate to your project
3. Go to **Builds**
4. Click on the build
5. Download the artifact

---

## Version Management

### **Automatic Build Number Increment:**

The **production** profile has `autoIncrement: true`, which automatically increments:
- iOS: `CFBundleVersion` (build number)
- Android: `versionCode`

**App version** is managed via `app.json` and should be updated manually:

```json
{
  "expo": {
    "version": "1.0.0"  // Update this manually
  }
}
```

### **Release Workflow:**

1. Update version in `app.json`:
   ```json
   "version": "1.1.0"
   ```

2. Trigger production build:
   ```bash
   pnpm run build:production:ios
   pnpm run build:production:android
   ```

3. Build number auto-increments (e.g., 1.1.0 (42))

4. Submit to stores:
   ```bash
   eas submit --platform ios
   eas submit --platform android
   ```

---

## Environment Variables

Each profile uses different environment variables (configured in `eas.json`):

| Variable | Development | Preview | Production |
|----------|-------------|---------|------------|
| `APP_ENV` | `development` | `staging` | `production` |
| `EXPO_NO_DOTENV` | `1` | `1` | `1` |
| `FLIPPER_DISABLE` | - | `1` | `1` |

These are set automatically based on the build profile.

---

## Troubleshooting

### **Build Fails with "Credentials not found"**

**Solution:**
```bash
# iOS: Generate new credentials
eas credentials

# Or use local credentials
eas build --profile production --platform ios --local
```

### **CI Fails on Type Check**

**Solution:**
```bash
# Run locally to see errors
pnpm type-check

# Fix TypeScript errors
# Then commit and push
```

### **OTA Update Not Received**

**Solution:**
1. Check channel matches build profile
2. Verify update was published successfully
3. Force-close and reopen app
4. Check Expo DevTools for update logs

### **Build Takes Too Long**

**Solution:**
- Use `--local` flag for local builds (faster but uses your machine)
- Upgrade to EAS Production plan for priority builds
- Use incremental builds (enabled by default)

---

## Quick Reference

### **Common Commands:**

```bash
# Check project health
pnpm doctor

# Run all CI checks locally
pnpm run check-all

# Trigger preview build
pnpm run build:preview:ios

# Trigger production build
pnpm run build:production:android

# Publish OTA update
eas update --branch production --message "Your message"

# Check build status
eas build:list

# Submit to App Store
eas submit --platform ios

# Submit to Google Play
eas submit --platform android
```

### **Useful Links:**

- **EAS Dashboard:** [https://expo.dev](https://expo.dev)
- **EAS Build Docs:** [https://docs.expo.dev/build/introduction/](https://docs.expo.dev/build/introduction/)
- **EAS Update Docs:** [https://docs.expo.dev/eas-update/introduction/](https://docs.expo.dev/eas-update/introduction/)
- **EAS Submit Docs:** [https://docs.expo.dev/submit/introduction/](https://docs.expo.dev/submit/introduction/)

---

## Support

For issues or questions:
1. Check [Expo Documentation](https://docs.expo.dev)
2. Visit [Expo Forums](https://forums.expo.dev)
3. Open an issue in this repository

---

**Happy Building! 🚀**
