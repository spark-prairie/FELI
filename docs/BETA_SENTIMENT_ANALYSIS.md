# FELI Beta Sentiment Analysis Framework

**Purpose:** Systematically categorize and analyze beta tester feedback to inform Day 21 bug fixing priorities.

**Created:** 2025-12-29
**Testing Period:** December 30, 2025 - January 19, 2026

---

## Overview

This document provides a framework for analyzing raw feedback from beta testers. All feedback will be categorized into three primary buckets: **UI/UX**, **Accuracy**, and **Bugs**. From there, we'll prioritize fixes for Day 21.

---

## Feedback Categories

### 1. **UI/UX** - User Interface & Experience Issues
Feedback related to visual design, usability, clarity, and user experience.

**Examples:**
- "The button is hard to see in dark mode"
- "I didn't know where to find the History tab"
- "Text is too small on my device"
- "The Pro badge is confusing"
- "Animation feels laggy"

**Sub-categories:**
- **Visual Design** - Colors, fonts, spacing, icons
- **Navigation** - Difficulty finding features, unclear flow
- **Clarity** - Confusing labels, unclear instructions
- **Accessibility** - Screen reader issues, contrast problems
- **Performance** - UI lag, slow animations, stuttering

---

### 2. **Accuracy** - AI Analysis Quality & Relevance
Feedback related to the quality, relevance, or accuracy of emotion analysis results.

**Examples:**
- "The result didn't match my cat's actual mood"
- "Behavioral observations were vague"
- "Suggestions weren't helpful"
- "AI seems to always say 'Relaxed'"

**Sub-categories:**
- **Emotion Detection** - Incorrect or unexpected primary emotion
- **Behavioral Cues** - Observations don't match the photo
- **Suggestions** - Recommendations aren't relevant or useful
- **Confidence Scores** - Percentages seem off or inconsistent

**Note:** During beta testing with mock AI, accuracy feedback is mostly about **presentation format** rather than true AI performance. We're looking for:
- "Are the results **understandable**?"
- "Is the **format** clear and helpful?"
- "Do the **explanations** make sense?"

---

### 3. **Bugs** - Technical Issues & Errors
Feedback related to crashes, errors, broken features, or unexpected behavior.

**Examples:**
- "App crashed when I tapped Analyze"
- "Photo doesn't load in the Preview screen"
- "History doesn't save after closing the app"
- "Mock Purchase button doesn't respond"
- "Translation missing in French"

**Sub-categories:**
- **Critical Bugs** - App crashes, data loss, complete feature failure
- **High Priority Bugs** - Feature doesn't work as expected, blocks user flow
- **Medium Priority Bugs** - Minor issues, workarounds available
- **Low Priority Bugs** - Cosmetic issues, rare edge cases
- **Localization Bugs** - Translation errors, text overflow

---

## Priority Matrix

| Priority   | Criteria                                                                 | Action Timeline       |
|------------|--------------------------------------------------------------------------|-----------------------|
| **P0**     | App crashes, data loss, critical flow blocked (e.g., can't analyze)     | Fix immediately       |
| **P1**     | Major feature broken, significant UX blocker                             | Fix within 24 hours   |
| **P2**     | Medium UX issue, minor feature bug, non-critical flow affected           | Fix within 48 hours   |
| **P3**     | Minor visual glitch, rare edge case, enhancement request                 | Fix within 1 week     |
| **P4**     | Feature request, nice-to-have, defer to future release                   | Add to roadmap        |

---

## Sentiment Analysis Template

### Step 1: Collect Raw Feedback
Gather all feedback from:
- TestFlight Beta Feedback (iOS)
- Google Play Console Feedback (Android)
- Email submissions (support@feliapp.com)
- Direct messages from testers

### Step 2: Categorize Each Item
For each feedback entry, determine:
1. **Category:** UI/UX, Accuracy, or Bug
2. **Sub-category:** Specific area (e.g., Visual Design, Critical Bug)
3. **Priority:** P0, P1, P2, P3, or P4
4. **Sentiment:** Positive, Neutral, or Negative
5. **Actionable?** Yes or No

### Step 3: Log in BETA_FEEDBACK_LOG.md
Add each entry to the feedback log with:
- Date
- Tester ID
- Device
- Issue/Feedback description
- Category
- Priority
- Status

### Step 4: Generate Action Plan
Based on categorized feedback, create a prioritized task list for Day 21.

---

## Sample Sentiment Analysis

### Example 1: Raw Feedback
**Tester:** BETA-006
**Feedback:** "I love the design, but the app crashed twice when I tried to analyze a photo from my gallery. Also, the dark mode colors are a bit too bright for my eyes at night."

**Analysis:**
- **Sentiment:** Mixed (Positive + Negative)
- **Item 1:**
  - Category: Bug
  - Sub-category: Critical Bug (crash)
  - Priority: P0 (crashes are critical)
  - Actionable: Yes
  - Action: Investigate gallery photo analysis crash

- **Item 2:**
  - Category: UI/UX
  - Sub-category: Visual Design (dark mode)
  - Priority: P2 (medium UX issue)
  - Actionable: Yes
  - Action: Review and adjust dark mode color palette

---

### Example 2: Raw Feedback
**Tester:** BETA-007
**Feedback:** "The analysis results are very clear and easy to understand! I'd love to see a feature that compares my cat's mood over time with a chart."

**Analysis:**
- **Sentiment:** Positive
- **Item 1:**
  - Category: UI/UX (compliment)
  - Sub-category: Clarity
  - Priority: N/A (positive feedback)
  - Actionable: No (but note in summary)

- **Item 2:**
  - Category: Feature Request
  - Sub-category: Data Visualization
  - Priority: P4 (nice-to-have, future enhancement)
  - Actionable: Yes (add to roadmap for v1.1)
  - Action: Design mood trend chart feature

---

### Example 3: Raw Feedback
**Tester:** BETA-008
**Feedback:** "The app always says my cat is 'Relaxed' no matter what photo I use. Is the AI working correctly?"

**Analysis:**
- **Sentiment:** Neutral / Concerned
- **Category:** Accuracy (but actually expected behavior)
- **Sub-category:** Emotion Detection
- **Priority:** P3 (clarification needed, not a real bug)
- **Actionable:** Yes
- **Action:** Add in-app notice during beta explaining mock AI behavior
- **Note:** This is expected because we're using mock AI. Consider adding a banner like "Beta Build - Using Simulated AI for Testing" on the result screen.

---

## Aggregation & Reporting

After collecting at least 10-15 feedback items, generate a summary report:

### Summary Report Template

```markdown
## Beta Feedback Summary Report

**Date:** [Date]
**Total Feedback Items:** [Count]

### By Category
- **Bugs:** [Count] (P0: X, P1: Y, P2: Z)
- **UI/UX:** [Count] (P1: X, P2: Y, P3: Z)
- **Accuracy:** [Count] (mostly informational during mock AI phase)
- **Feature Requests:** [Count] (defer to roadmap)

### By Sentiment
- **Positive:** [Count] - "[Example quote]"
- **Neutral:** [Count]
- **Negative:** [Count] - "[Example quote]"

### Top 3 Critical Issues (P0/P1)
1. [Issue 1] - [Category] - [Impact]
2. [Issue 2] - [Category] - [Impact]
3. [Issue 3] - [Category] - [Impact]

### Top 3 UX Improvements (P2)
1. [Issue 1] - [Description]
2. [Issue 2] - [Description]
3. [Issue 3] - [Description]

### Positive Highlights
- [Positive feedback 1]
- [Positive feedback 2]
- [Positive feedback 3]

### Action Plan for Day 21
**Immediate Fixes (Today):**
- [ ] Fix P0 issue 1
- [ ] Fix P0 issue 2

**High Priority (Next 24h):**
- [ ] Fix P1 issue 1
- [ ] Fix P1 issue 2

**Medium Priority (Next 48h):**
- [ ] Fix P2 issue 1
- [ ] Fix P2 issue 2

**Defer to Next Build:**
- [ ] P3 issue 1
- [ ] Feature request 1
```

---

## When You Send Me Feedback

When you provide raw feedback comments, please format them as:

```
BETA-[ID]: [Tester Name]
Device: [Device Model and OS]
Feedback: "[Raw feedback quote]"
```

**Example:**
```
BETA-009: Emily R.
Device: iPhone 13 Pro, iOS 17.2
Feedback: "The app looks great! But when I rotate my phone to landscape, some of the text gets cut off on the result screen. Also, I couldn't find the Settings tab at first—maybe make it more obvious?"
```

I will then:
1. **Categorize** the feedback into UI/UX, Accuracy, or Bugs
2. **Assign priority** (P0-P4)
3. **Propose actionable fixes** for Day 21
4. **Update BETA_FEEDBACK_LOG.md** with the entries

---

## Sample Day 21 Action Plan (Hypothetical)

Based on hypothetical beta feedback, here's what a Day 21 action plan might look like:

### Bugs to Fix (P0/P1)
1. **P0: App crashes on Analyze (3 reports)**
   - Investigation: Check image processing pipeline
   - Fix: Add error handling for corrupted images
   - Test: Reproduce with various image formats

2. **P1: History doesn't persist after force-quit (2 reports)**
   - Investigation: Review async storage logic
   - Fix: Ensure history saves immediately, not on app exit
   - Test: Force-quit app and verify history persists

### UX Improvements (P2)
1. **P2: Dark mode colors too bright (5 reports)**
   - Fix: Adjust neutral-400/neutral-500 shades to darker tones
   - Test: Review on multiple devices in low light

2. **P2: Text truncation in landscape mode (2 reports)**
   - Fix: Add responsive layout for landscape orientation
   - Test: Rotate device on all major screens

### Localization Fixes (P2/P3)
1. **P2: Spanish typo "Analisar" → "Analizar" (1 report)**
   - Fix: Correct typo in es.json
   - Test: Verify Spanish translations

### Feature Requests (P4 - Defer)
1. **P4: Mood trend chart (3 requests)**
   - Action: Add to roadmap for v1.1
   - Design: Create mockup for future sprint

---

## Tools for Sentiment Analysis

### Manual Analysis (Recommended for Beta)
- Use spreadsheet or markdown table
- Categorize feedback line by line
- Tag with priority and category
- Export to BETA_FEEDBACK_LOG.md

### Semi-Automated (Optional)
If you have 50+ feedback items, consider:
- Text analysis tools (e.g., sentiment analysis scripts)
- Keyword extraction (e.g., "crash", "bug", "love", "hate")
- Clustering similar feedback items

---

## Feedback Velocity Tracking

Monitor how quickly feedback is coming in:

| Week | Feedback Count | Bugs | UI/UX | Accuracy | Feature Requests |
|------|----------------|------|-------|----------|------------------|
| 1    | TBD            | TBD  | TBD   | TBD      | TBD              |
| 2    | TBD            | TBD  | TBD   | TBD      | TBD              |
| 3    | TBD            | TBD  | TBD   | TBD      | TBD              |

**Target Metrics:**
- Week 1: 10-20 feedback items (internal team)
- Week 2: 30-50 feedback items (external beta)
- Week 3: Declining feedback (issues resolved)

**Success Indicators:**
- Increasing positive sentiment over time
- Decreasing P0/P1 bugs week over week
- More feature requests (indicates core functionality is solid)

---

## Next Steps

1. **Wait for real beta tester feedback** (starting Dec 30, 2025)
2. **Collect and categorize** all feedback using this framework
3. **Generate summary report** after 10-15 items
4. **Create Day 21 action plan** based on priorities
5. **Execute fixes** in priority order (P0 → P1 → P2)
6. **Deploy updated build** to beta testers
7. **Repeat** until success criteria met

---

**Framework Maintained By:** FELI Development Team
**Ready to Analyze:** Send me raw feedback and I'll categorize it!
**Last Updated:** 2025-12-29
