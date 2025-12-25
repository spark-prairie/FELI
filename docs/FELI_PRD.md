# FELI_PRD.md — Product Requirements Document (one page)

## Mission (one sentence)
Help urban cat owners reduce anxiety and better understand their cat’s immediate emotional state by providing probabilistic, explainable insights from a single photo.

## Target users
- Urban cat owners (apartment dwellers)
- New cat parents (first 6–12 months)
- Owners who treat cats as family and feel anxious about interpreting behavior

## Top user problems
1. I can’t tell if my cat is stressed or just alert.  
2. I worry I might miss early signs of distress.  
3. I want quick, calm guidance I can act on now.

## MVP North Star
User can take/upload a photo and in ≤30 seconds see **1–2 probabilistic emotion labels + 2–3 clear human actions** that reduce uncertainty.

## MVP Feature list (strict)
- Photo capture / gallery selection
- Frontend minimal image-quality check (visibility / blur warning)
- Upload to AI analysis endpoint (mockable)
- Present Result: primary emotion (Free), secondary emotion & percentages (Pro)
- Reasoning: 2–4 visible-cue bullet points
- Actionable suggestions: 2–4 human actions
- Local history: last 10 analyses (save / delete)
- Free vs Pro gating (daily limits vs unlimited)
- Onboarding + short disclaimer + Privacy link

## Success metrics (first 90 days)
- Time-to-first-result: <= 30s (median)
- D7 retention >= 20% (target)
- Free → Pro conversion >= 1% (target)
- NPS (beta) >= 40

## Acceptance criteria (per feature)
- Photo flow: camera/gallery → preview → upload (mock) → result; success rate >= 95% on stable network.
- Result page: uses only probabilistic wording; exactly the defined JSON is rendered correctly.
- History: save and show up to 10 items; saved records can be deleted.
- Onboarding: shows disclaimer and camera permission; completion stored locally.
- Free limit enforcement: anonymous users limited to 2 analyses/day (local counter).
- No medical claims appear anywhere in UI strings or store metadata.

## Non-goals (MUST NOT)
- No video/real-time monitoring
- No diagnosis, no veterinary guidance
- No social features, no community, no marketplace
- No multi-pet or cross-species support in v1

## Quick roadmap (v1 → v2)
- v1: Cat-only, photo-based, Free+Pro subscription, offline history
- v2: Dog module (separate model/prompt), family plans, multi-pet
- v3: Smart tracking / multimodal (video + audio) — only after proven product-market fit

## Risk & mitigation
- Risk: App Store rejects medical-sounding copy — Mitigation: QA Agent review for all copy; include disclaimers in metadata.
- Risk: Hermes V1 incompatibility with some libs — Mitigation: test Hermes in staging before enabling in production.

## Day0 deliverables (this file + CLAUDE_CONSTITUTION.md + ai/analysis_prompt.md)
