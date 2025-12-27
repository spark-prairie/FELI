export type CatEmotion =
  | 'relaxed'
  | 'alert'
  | 'anxious'
  | 'irritated'
  | 'possible_discomfort';

export type ConfidenceNote = 'low' | 'medium' | 'high';

export interface EmotionScore {
  type: CatEmotion;
  confidence_percentage?: number; // present for Pro; optional for Free
}

export interface EmotionResult {
  result_id: string;
  primary_emotion: EmotionScore;
  secondary_emotion?: EmotionScore | null;
  reasoning: string[]; // 1..6 bullets
  suggestions: string[]; // 1..4 suggestions
  confidence_note?: ConfidenceNote; // for free users
  disclaimer: string;
  meta: {
    visibility: 'clear' | 'partial' | 'occluded';
    face_coverage?: number; // 0..1
    created_at?: string; // ISO timestamp
    model_version?: string;
  };
}