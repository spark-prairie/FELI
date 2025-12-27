import { z } from 'zod';

/**
 * FELI Emotion Analysis Validators
 * Runtime validation for AI JSON output
 */

/**
 * Cat emotion enum validator
 */
export const CatEmotionSchema = z.enum([
  'relaxed',
  'alert',
  'anxious',
  'irritated',
  'possible_discomfort',
]);

/**
 * Confidence note validator
 */
export const ConfidenceNoteSchema = z.enum(['low', 'medium', 'high']);

/**
 * Photo visibility validator
 */
export const PhotoVisibilitySchema = z.enum(['clear', 'partial', 'unclear']);

/**
 * Emotion with confidence percentage validator
 * Confidence must be 0-100
 */
export const EmotionConfidenceSchema = z
  .object({
    type: CatEmotionSchema,
    confidence_percentage: z.number().min(0).max(100),
  })
  .strict();

/**
 * Photo quality metadata validator
 * Face coverage must be 0.0-1.0
 */
export const PhotoMetaSchema = z
  .object({
    visibility: PhotoVisibilitySchema,
    face_coverage: z.number().min(0).max(1),
  })
  .strict();

/**
 * Complete emotion analysis result validator
 * Strict mode rejects extra fields
 * Arrays must have at least 1 item
 */
export const EmotionResultSchema = z
  .object({
    primary_emotion: EmotionConfidenceSchema,
    secondary_emotion: EmotionConfidenceSchema,
    reasoning: z.array(z.string().min(1)).min(1),
    suggestions: z.array(z.string().min(1)).min(1),
    confidence_note: ConfidenceNoteSchema,
    disclaimer: z.string().min(1),
    meta: PhotoMetaSchema,
  })
  .strict();

/**
 * Stored analysis result validator (with persistence metadata)
 */
export const StoredEmotionResultSchema = EmotionResultSchema.extend({
  result_id: z.string().min(1),
  created_at: z.string().datetime(),
  image_uri: z.string().optional(),
}).strict();

/**
 * Type inference helpers
 */
export type EmotionResultInput = z.input<typeof EmotionResultSchema>;
export type EmotionResultOutput = z.output<typeof EmotionResultSchema>;
export type StoredEmotionResultInput = z.input<typeof StoredEmotionResultSchema>;
export type StoredEmotionResultOutput = z.output<typeof StoredEmotionResultSchema>;
