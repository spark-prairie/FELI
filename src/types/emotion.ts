/**
 * FELI Emotion Analysis Types
 * Must match AI JSON output schema exactly
 */

/**
 * Allowed cat emotions (exhaustive list)
 */
export type CatEmotion =
  | 'relaxed'
  | 'alert'
  | 'anxious'
  | 'irritated'
  | 'possible_discomfort';

/**
 * Confidence level for overall interpretation quality
 */
export type ConfidenceNote = 'low' | 'medium' | 'high';

/**
 * Photo visibility quality assessment
 */
export type PhotoVisibility = 'clear' | 'partial' | 'unclear';

/**
 * Emotion with confidence percentage
 */
export interface EmotionConfidence {
  type: CatEmotion;
  confidence_percentage: number;
}

/**
 * Photo quality metadata
 */
export interface PhotoMeta {
  visibility: PhotoVisibility;
  face_coverage: number;
}

/**
 * Complete emotion analysis result from AI
 * Matches AI JSON output schema exactly
 */
export interface EmotionResult {
  primary_emotion: EmotionConfidence;
  secondary_emotion: EmotionConfidence;
  reasoning: string[];
  suggestions: string[];
  confidence_note: ConfidenceNote;
  disclaimer: string;
  meta: PhotoMeta;
}

/**
 * Stored analysis result with additional metadata
 * Used for history persistence
 */
export interface StoredEmotionResult extends EmotionResult {
  result_id: string;
  created_at: string;
  image_uri?: string;
  isProAtSave?: boolean; // Track if user was Pro when this record was saved
}
