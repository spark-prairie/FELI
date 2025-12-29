# FELI Beta Testing Guide

**Welcome, Beta Tester!** 🎉

Thank you for helping us test FELI before our public launch. Your feedback is invaluable in making this the best cat emotion analysis app possible.

---

## 📲 How to Install FELI

### iOS (TestFlight)

1. **Install TestFlight** from the App Store (if you haven't already)
   - Download: https://apps.apple.com/app/testflight/id899247664

2. **Open your invitation email** from Apple

3. **Tap "View in TestFlight"** or **"Start Testing"**

4. **Install FELI** from TestFlight
   - The app will appear in TestFlight with a yellow dot indicating it's a beta

5. **Open FELI** from your home screen

**Troubleshooting:**
- Didn't receive the invitation? Check your spam folder or contact us at support@feliapp.com
- Invitation expired? Let us know and we'll send a fresh one

---

### Android (Google Play Internal Testing)

1. **Open your invitation email** with the Internal Testing link

2. **Tap the link** and sign in with your Google account
   - Make sure you're using the same email we invited

3. **Accept the invitation** to become a tester

4. **Download FELI** from Google Play
   - It will appear as a regular Play Store download

5. **Open FELI** from your app drawer

**Troubleshooting:**
- "You're not eligible to test this app"? Make sure you're signed in with the invited email
- Can't find the app? Try the link again or contact support@feliapp.com

---

## 🐱 The Main Path to Test

We'd like you to test the **core user journey** from start to finish:

### Step 1: Capture
1. Open FELI
2. Tap **"Take or Choose Photo"**
3. When prompted for permissions, tap **"Allow"** (Camera and Photos)
4. Choose one of:
   - **📷 Take Photo** - Use your camera to snap a picture of your cat
   - **🖼️ Choose from Gallery** - Select an existing cat photo

**What to look for:**
- Does the camera launch smoothly?
- Is the gallery accessible?
- Does the app crash or freeze?

---

### Step 2: Preview & Analyze
1. Review the photo on the Preview screen
2. Tap **"Analyze"**
3. Wait for the AI to process (1-1.5 seconds)

**What to look for:**
- Is the Preview screen clear and functional?
- Does the loading indicator appear during analysis?
- Does the analysis complete, or does it get stuck?

---

### Step 3: View Results
1. Review the emotion analysis result:
   - Primary emotion (e.g., 😌 Relaxed)
   - Confidence level (e.g., "High confidence")
   - Behavioral observations (3 cues for Free users)
   - Suggested actions (2 suggestions for Free users)

2. Scroll through all the details

**What to look for:**
- Is all text readable and properly formatted?
- Are emojis displaying correctly?
- Does dark mode work well? (Test by toggling device dark mode)
- Is the information helpful and clear?

---

### Step 4: Save to History
1. Tap **"Back to Home"** (this automatically saves the result)
2. Navigate to the **"History"** tab
3. Verify your analysis appears in the list
4. Tap on the saved entry to view full details again

**What to look for:**
- Does the analysis save successfully?
- Does it appear in History?
- Can you re-open saved analyses?
- Do saved analyses persist after force-quitting the app?

---

## 🔄 Additional Flows to Test

### Test Daily Limits (Free Tier)
1. Run **2 analyses** (use any cat photos)
2. Try to run a **3rd analysis**
3. You should see a "Daily Limit Reached" alert

**What to check:**
- Does the button disable after 2 uses?
- Is the alert clear and helpful?
- Does the usage banner update correctly (e.g., "2/2 analyses used today")?

---

### Test Mock Pro Upgrade (Internal Build Only)
1. Go to **Settings** → **Subscription** → **Manage Subscription**
2. Tap **"Mock Purchase (Dev Only)"**
3. Verify the status changes to **"Pro Member"**
4. Run another analysis
5. Verify Pro features appear:
   - **Exact confidence percentage** (e.g., "87% confidence")
   - **Purple Pro badge** on emotion card
   - **Secondary Emotion visible** (no lock icon)
   - **6 behavioral observations** (instead of 3)
   - **4 action suggestions** (instead of 2)

**What to check:**
- Does the mock purchase work instantly?
- Do Pro features unlock correctly?
- Does the UI clearly differentiate Pro from Free?

---

### Test Language Support (Optional)
1. Go to **Settings** → **Language**
2. Select a different language (e.g., Spanish, French, Chinese)
3. Navigate through the app

**What to check:**
- Does all text translate correctly?
- Are there any untranslated strings?
- Does text fit properly in buttons and cards?
- For Arabic: Does the text display right-to-left correctly?

---

### Test Accessibility (Optional)
**iOS:**
1. Enable VoiceOver: Settings → Accessibility → VoiceOver → ON
2. Navigate through FELI using VoiceOver

**Android:**
1. Enable TalkBack: Settings → Accessibility → TalkBack → ON
2. Navigate through FELI using TalkBack

**What to check:**
- Are all buttons and controls labeled?
- Does the screen reader announce results clearly?
- Is navigation logical?

---

## ❓ Specific Questions We Need Answers To

Please provide feedback on these specific areas:

### 1. **First Impression (1-10 rating)**
- How would you rate the home screen design and clarity?
- Did you immediately understand what the app does?
- Was the "Take or Choose Photo" button obvious?

### 2. **Ease of Use (1-10 rating)**
- How easy was it to take/choose a photo?
- Was the analysis process smooth?
- Were the results easy to understand?

### 3. **Result Quality**
- Did the emotion analysis make sense based on the photo?
- Were the behavioral observations relevant?
- Were the suggested actions helpful?
- ⚠️ **Note:** We're currently using mock AI (all results are pre-determined), so focus on whether the **format** and **presentation** of results is clear.

### 4. **Visual Design**
- Does the app look polished and professional?
- Are colors, fonts, and spacing pleasant?
- How does dark mode look?
- Any visual bugs or glitches?

### 5. **Performance**
- Does the app feel fast and responsive?
- Any lag, stuttering, or freezing?
- Does the analysis complete in a reasonable time?

### 6. **Bugs & Issues**
- Did the app crash? If so, when?
- Any features that didn't work as expected?
- Any confusing error messages?

### 7. **Missing Features**
- Is there anything you expected to see but didn't?
- Any features you wish the app had?

### 8. **Overall Satisfaction (1-10 rating)**
- Would you recommend this app to other cat owners?
- Would you pay $4.99/month for Pro features?
- Any other general feedback?

---

## 📧 How to Submit Feedback

### Option 1: TestFlight Feedback (iOS)
1. Shake your device while using FELI
2. Tap **"Send Beta Feedback"**
3. Include:
   - What you were trying to do
   - What happened (vs what you expected)
   - Screenshots (if applicable)

### Option 2: Google Play Feedback (Android)
1. Open FELI → Menu → **"Send Feedback"**
2. Describe the issue or feedback
3. Include screenshots if possible

### Option 3: Email Us
📧 **support@feliapp.com**

**Please include:**
- Your device model (e.g., iPhone 13 Pro, Pixel 6)
- OS version (e.g., iOS 17.2, Android 13)
- App version (shown in Settings → About)
- Detailed description of the issue or feedback
- Screenshots or screen recordings (very helpful!)

---

## 🙏 Thank You!

Your time and feedback are incredibly valuable. We're excited to build the best cat emotion analysis app with your help!

**Questions?** Don't hesitate to reach out at support@feliapp.com

Happy testing! 🐾✨

---

**FELI Beta Team**
Version: 1.0.0 (Build 1)
Last Updated: 2025-12-29
