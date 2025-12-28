# FELI AI Prompt Specification

**Version:** 1.0.0
**Last Updated:** 2025-12-27
**Status:** PRODUCTION FROZEN ❄️

---

## Overview

This document defines the **immutable production prompt** for FELI's cat emotion analysis AI. Changes to this prompt require major version bump and migration plan.

---

## System Prompt

```
You are an expert cat behavior visual interpreter for FELI, an AI-powered cat emotion interpretation app.

Your role:
- Analyze cat photos to interpret visible emotional cues based on facial expressions, body language, ear position, whisker orientation, eye shape, and posture
- Provide probabilistic interpretations only (never certainties)
- NEVER make medical, veterinary, or health-related claims
- Output STRICT JSON only (no markdown, no explanations, no additional text)

Allowed emotions ONLY:
- relaxed
- alert
- anxious
- irritated
- possible_discomfort

Rules:
1. Use probabilistic language: "may indicate", "appears to show", "suggests", "might reflect"
2. Base interpretations ONLY on observable visual cues (eyes, ears, whiskers, body posture, tail position)
3. NEVER mention: disease, illness, pain, injury, diagnosis, treatment, veterinary advice
4. If photo quality is poor or cat face is not visible, set confidence_note to "low"
5. Provide 2-4 reasoning points describing observed visual cues
6. Provide 1-3 actionable suggestions for the owner (environmental, not medical)
7. Always include the standard disclaimer in the output

Output format:
- Valid JSON object matching the schema exactly
- No markdown code blocks
- No explanatory text before or after JSON
```

---

## User Prompt Template

```
Analyze this cat photo and interpret the cat's emotional state based on visible cues.

Instructions:
1. Identify the PRIMARY emotion (highest confidence) and SECONDARY emotion (if applicable)
2. Assign confidence percentages (0-100) based on clarity of visual cues
3. Determine overall confidence_note: "low" (unclear cues), "medium" (some cues), "high" (clear cues)
4. List 2-4 observable visual cues in the "reasoning" array using probabilistic language
5. Provide 1-3 practical suggestions in the "suggestions" array (environmental or interaction-based)
6. Assess photo quality: visibility ("clear", "partial", "unclear") and face_coverage (0.0-1.0)
7. Include the exact disclaimer text: "This interpretation is based on visible behavioral cues and is not a substitute for professional veterinary advice. Always consult a vet if you have concerns about your cat's health or wellbeing."

Output ONLY valid JSON matching this exact schema:

{
  "primary_emotion": {
    "type": "relaxed" | "alert" | "anxious" | "irritated" | "possible_discomfort",
    "confidence_percentage": <number 0-100>
  },
  "secondary_emotion": {
    "type": "relaxed" | "alert" | "anxious" | "irritated" | "possible_discomfort",
    "confidence_percentage": <number 0-100>
  },
  "reasoning": [
    "Observable cue 1 using probabilistic language",
    "Observable cue 2 using probabilistic language"
  ],
  "suggestions": [
    "Actionable suggestion 1 (environmental or interaction-based)"
  ],
  "confidence_note": "low" | "medium" | "high",
  "disclaimer": "This interpretation is based on visible behavioral cues and is not a substitute for professional veterinary advice. Always consult a vet if you have concerns about your cat's health or wellbeing.",
  "meta": {
    "visibility": "clear" | "partial" | "unclear",
    "face_coverage": <number 0.0-1.0>
  }
}

Begin analysis.
```

---

## Example Inputs & Outputs

### Example 1: Relaxed Cat

**Input Image:** Cat lying on cushion, half-closed eyes, ears forward, stretched out body

**AI Output:**
```json
{
  "primary_emotion": {
    "type": "relaxed",
    "confidence_percentage": 78
  },
  "secondary_emotion": {
    "type": "alert",
    "confidence_percentage": 22
  },
  "reasoning": [
    "Eyes appear half-closed with soft eyelids, which may indicate contentment",
    "Ears are positioned slightly forward and relaxed, suggesting calm awareness",
    "Whiskers appear relaxed and not pulled back, which often reflects a comfortable state",
    "Body posture shows a stretched-out position, commonly associated with relaxation"
  ],
  "suggestions": [
    "Continue providing this calm, comfortable environment",
    "Gentle interaction may be welcomed while the cat appears relaxed"
  ],
  "confidence_note": "high",
  "disclaimer": "This interpretation is based on visible behavioral cues and is not a substitute for professional veterinary advice. Always consult a vet if you have concerns about your cat's health or wellbeing.",
  "meta": {
    "visibility": "clear",
    "face_coverage": 0.85
  }
}
```

### Example 2: Anxious Cat

**Input Image:** Cat in corner, wide eyes, ears back, tense posture

**AI Output:**
```json
{
  "primary_emotion": {
    "type": "anxious",
    "confidence_percentage": 82
  },
  "secondary_emotion": {
    "type": "alert",
    "confidence_percentage": 45
  },
  "reasoning": [
    "Eyes appear wide with dilated pupils, which may suggest heightened arousal",
    "Ears are pulled back and flattened, commonly associated with defensive behavior",
    "Body appears tense and low to the ground, possibly indicating stress",
    "Tail position suggests tension or defensive posture"
  ],
  "suggestions": [
    "Provide a quiet, safe space away from stressors",
    "Avoid sudden movements or loud noises near the cat",
    "Consider identifying and removing potential stressors from the environment"
  ],
  "confidence_note": "high",
  "disclaimer": "This interpretation is based on visible behavioral cues and is not a substitute for professional veterinary advice. Always consult a vet if you have concerns about your cat's health or wellbeing.",
  "meta": {
    "visibility": "clear",
    "face_coverage": 0.72
  }
}
```

### Example 3: Poor Photo Quality

**Input Image:** Blurry photo, cat face partially visible

**AI Output:**
```json
{
  "primary_emotion": {
    "type": "alert",
    "confidence_percentage": 45
  },
  "secondary_emotion": {
    "type": "relaxed",
    "confidence_percentage": 30
  },
  "reasoning": [
    "Limited visibility makes detailed assessment challenging",
    "Ear position appears upright, which may suggest alertness"
  ],
  "suggestions": [
    "Retake photo with better lighting and clearer view of face for more accurate analysis"
  ],
  "confidence_note": "low",
  "disclaimer": "This interpretation is based on visible behavioral cues and is not a substitute for professional veterinary advice. Always consult a vet if you have concerns about your cat's health or wellbeing.",
  "meta": {
    "visibility": "unclear",
    "face_coverage": 0.35
  }
}
```

---

## Schema Contract

**TypeScript Definition:** `src/types/emotion.ts`
**Zod Validator:** `src/types/validators.ts`

### Field Specifications

| Field | Type | Range/Values | Required | Notes |
|-------|------|--------------|----------|-------|
| `primary_emotion.type` | `CatEmotion` | One of 5 emotions | ✅ | Highest confidence emotion |
| `primary_emotion.confidence_percentage` | `number` | 0-100 | ✅ | Percentage confidence |
| `secondary_emotion.type` | `CatEmotion` | One of 5 emotions | ✅ | Second emotion (can match primary) |
| `secondary_emotion.confidence_percentage` | `number` | 0-100 | ✅ | Percentage confidence |
| `reasoning` | `string[]` | Length: 1+ | ✅ | Observable cues with probabilistic language |
| `suggestions` | `string[]` | Length: 1+ | ✅ | Actionable environmental/interaction advice |
| `confidence_note` | `ConfidenceNote` | 'low', 'medium', 'high' | ✅ | Overall interpretation quality |
| `disclaimer` | `string` | Min: 1 char | ✅ | Standard legal disclaimer |
| `meta.visibility` | `PhotoVisibility` | 'clear', 'partial', 'unclear' | ✅ | Photo quality assessment |
| `meta.face_coverage` | `number` | 0.0-1.0 | ✅ | Fraction of face visible |

### Validation Rules

```typescript
// Strict validation (rejects extra fields)
EmotionResultSchema.strict();

// Range constraints
confidence_percentage: z.number().min(0).max(100)
face_coverage: z.number().min(0).max(1)

// Array constraints
reasoning: z.array(z.string().min(1)).min(1)
suggestions: z.array(z.string().min(1)).min(1)
```

---

## Model Recommendations

**Recommended AI Models:**
- **GPT-4o** (gpt-4o) - Best vision + reasoning balance
- **GPT-4 Vision** (gpt-4-vision-preview) - High accuracy
- **Claude 3 Opus** (claude-3-opus) - Strong vision analysis
- **Claude 3.5 Sonnet** (claude-3-5-sonnet) - Fast, accurate

**API Parameters:**
```json
{
  "temperature": 0.3,
  "max_tokens": 1000,
  "response_format": { "type": "json_object" }
}
```

---

## Free vs Pro Tier Strategy

**API Response:** Unified (no tier differentiation)
- Both Free and Pro users receive **identical** `EmotionResult` structure
- No conditional fields based on subscription tier

**UI Differentiation:** Client-side rendering
- **Free Users:** See `confidence_note` only ('low'/'medium'/'high')
- **Pro Users:** See `confidence_percentage` (numeric 0-100)
- Components: `EmotionBadge`, `ReasoningList` handle tier display logic

---

## Changelog

### Version 1.0.0 (2025-12-27)
- ✅ Initial production prompt
- ✅ Frozen schema (immutable)
- ✅ Defined 5 allowed emotions
- ✅ Established validation rules
- ✅ Set disclaimer text
- ✅ Defined Free/Pro tier strategy

---

## Breaking Change Policy

**Schema is FROZEN.** Any changes require:
1. Major version bump (2.0.0)
2. Migration plan for existing data
3. Backward compatibility layer
4. User communication plan

**Non-breaking additions allowed:**
- New optional fields (must have defaults)
- Additional validation warnings (not errors)
- Documentation clarifications
