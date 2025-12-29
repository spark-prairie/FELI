# FELI Beta Feedback Log

**Purpose:** Track all beta tester feedback, bugs, and feature requests during internal testing.

**Testing Period:** December 30, 2025 - January 19, 2026

---

## Feedback Summary

**Total Feedback Items:** 5 (placeholder)
**Critical Bugs:** 0
**High Priority:** 0
**Medium Priority:** 0
**Low Priority / Feature Requests:** 0

**Status Legend:**
- 🟢 **Resolved** - Fixed and deployed
- 🟡 **In Progress** - Actively being worked on
- 🔴 **Open** - Not yet started
- 🔵 **Pending Review** - Waiting for more info or testing
- ⚪ **Won't Fix** - Not applicable or out of scope

---

## Feedback Entries

| Date       | Tester ID | Device            | Issue/Feedback                                                                 | Category  | Priority | Status          | Assigned To | Notes                          |
|------------|-----------|-------------------|--------------------------------------------------------------------------------|-----------|----------|-----------------|-------------|--------------------------------|
| 2025-12-30 | BETA-001  | iPhone 13 Pro     | [Placeholder] App crashed when tapping "Analyze" button                        | Bug       | Critical | 🔴 Open         | -           | Awaiting repro steps           |
| 2025-12-30 | BETA-002  | Pixel 6           | [Placeholder] Text on result screen is cut off in landscape mode               | UI/UX     | Medium   | 🔴 Open         | -           | Need screenshot                |
| 2025-12-31 | BETA-003  | iPhone 12         | [Placeholder] Would love to see a comparison chart for historical mood trends  | Feature   | Low      | 🔵 Pending      | -           | Future enhancement             |
| 2025-12-31 | BETA-004  | Samsung Galaxy S22| [Placeholder] Dark mode colors are too bright, hard to read                    | UI/UX     | Medium   | 🔴 Open         | -           | Design review needed           |
| 2026-01-02 | BETA-005  | iPhone 14 Pro Max | [Placeholder] Spanish translation has a typo in the "Analyze" button           | Localization | Low   | 🔴 Open         | -           | Check es.json file             |

---

## Detailed Feedback Entries

### BETA-001: App crashed when tapping "Analyze" button
**Date:** 2025-12-30
**Tester:** BETA-001 (John D.)
**Device:** iPhone 13 Pro, iOS 17.2
**Category:** Bug
**Priority:** Critical
**Status:** 🔴 Open

**Description:**
[Placeholder] After selecting a photo from the gallery and tapping "Analyze", the app immediately crashes to the home screen. Happens every time.

**Steps to Reproduce:**
1. Open app
2. Tap "Take or Choose Photo"
3. Select "Choose from Gallery"
4. Select any photo
5. Tap "Analyze"
6. App crashes

**Expected Behavior:**
Analysis should complete and show results.

**Actual Behavior:**
App crashes.

**Screenshots/Logs:**
[Awaiting]

**Action Items:**
- [ ] Request crash logs from TestFlight
- [ ] Attempt to reproduce locally
- [ ] Check image processing pipeline

---

### BETA-002: Text cut off in landscape mode
**Date:** 2025-12-30
**Tester:** BETA-002 (Sarah L.)
**Device:** Pixel 6, Android 13
**Category:** UI/UX
**Priority:** Medium
**Status:** 🔴 Open

**Description:**
[Placeholder] When viewing analysis results in landscape orientation, some text on the emotion card is cut off at the edges.

**Steps to Reproduce:**
1. Complete an analysis
2. Rotate device to landscape
3. Observe text truncation

**Expected Behavior:**
All text should be fully visible in landscape mode.

**Actual Behavior:**
Text is cut off.

**Screenshots/Logs:**
[Awaiting]

**Action Items:**
- [ ] Request screenshot
- [ ] Test landscape layouts
- [ ] Review responsive design for result screen

---

### BETA-003: Historical mood trend chart (Feature Request)
**Date:** 2025-12-31
**Tester:** BETA-003 (Mike T.)
**Device:** iPhone 12, iOS 17.1
**Category:** Feature Request
**Priority:** Low
**Status:** 🔵 Pending Review

**Description:**
[Placeholder] It would be great to see a visual chart showing my cat's mood trends over time (e.g., past 7 days, past month).

**Rationale:**
Would help identify patterns and changes in behavior.

**Action Items:**
- [ ] Add to roadmap for v1.1 or v1.2
- [ ] Design mockup
- [ ] Estimate effort

---

### BETA-004: Dark mode readability issue
**Date:** 2025-12-31
**Tester:** BETA-004 (Emily R.)
**Device:** Samsung Galaxy S22, Android 13
**Category:** UI/UX
**Priority:** Medium
**Status:** 🔴 Open

**Description:**
[Placeholder] In dark mode, some of the text colors are too bright/washed out, making it hard to read comfortably at night.

**Steps to Reproduce:**
1. Enable dark mode on device
2. Open FELI
3. Navigate to any screen (especially result screen)
4. Observe text colors

**Expected Behavior:**
Dark mode should be comfortable for reading in low light.

**Actual Behavior:**
Some text is too bright.

**Screenshots/Logs:**
[Awaiting]

**Action Items:**
- [ ] Review dark mode color palette
- [ ] Test on multiple devices
- [ ] Adjust neutral-400/neutral-500 shades

---

### BETA-005: Spanish translation typo
**Date:** 2026-01-02
**Tester:** BETA-005 (Carlos M.)
**Device:** iPhone 14 Pro Max, iOS 17.3
**Category:** Localization
**Priority:** Low
**Status:** 🔴 Open

**Description:**
[Placeholder] In Spanish, the "Analyze" button says "Analisar" but it should be "Analizar" (with 'z').

**Steps to Reproduce:**
1. Go to Settings → Language
2. Select Spanish
3. Return to Home
4. Observe "Analyze" button text

**Expected Behavior:**
Button should say "Analizar"

**Actual Behavior:**
Button says "Analisar" (typo)

**Action Items:**
- [ ] Review `src/translations/es.json`
- [ ] Correct typo
- [ ] Test Spanish translations thoroughly

---

## Categorized Feedback Summary

### Bugs (Critical/High Priority)
1. **BETA-001:** App crash on Analyze (Critical)

### UI/UX Issues
1. **BETA-002:** Text cut off in landscape (Medium)
2. **BETA-004:** Dark mode too bright (Medium)

### Localization Issues
1. **BETA-005:** Spanish typo (Low)

### Feature Requests
1. **BETA-003:** Mood trend chart (Low)

---

## Action Plan for Day 21 (Fixing Beta Issues)

**Priority Order:**
1. **Critical Bugs** → Fix immediately
2. **High Priority** → Fix within 24 hours
3. **Medium Priority** → Fix within 48 hours
4. **Low Priority** → Fix within 1 week or defer to next release

**Next Steps:**
1. Collect at least 10-15 feedback entries from beta testers
2. Categorize and prioritize all feedback
3. Create tasks for critical and high-priority issues
4. Schedule fixes for Day 21

---

**Log Maintained By:** FELI Development Team
**Last Updated:** 2025-12-29
