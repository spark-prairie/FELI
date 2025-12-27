import { z } from 'zod';

// Basic enums
export const CatEmotionEnum = z.enum([
  'relaxed',
  'alert',
  'anxious',
  'irritated',
  'possible_discomfort',
]);

export const ConfidenceNoteEnum = z.enum(['low', 'medium', 'high']);

export const EmotionScoreSchema = z.object({
  type: CatEmotionEnum,
  confidence_percentage: z.number().min(0).max(100).optional(),
});

export const EmotionResultSchema = z.object({
  result_id: z.string().min(1),
  primary_emotion: EmotionScoreSchema,
  secondary_emotion: EmotionScoreSchema.optional().nullable(),
  reasoning: z.array(z.string()).min(1).max(6),
  suggestions: z.array(z.string()).min(1).max(4),
  confidence_note: ConfidenceNoteEnum.optional(),
  disclaimer: z.string().min(1),
  meta: z.object({
    visibility: z.enum(['clear', 'partial', 'occluded']),
    face_coverage: z.number().min(0).max(1).optional(),
    created_at: z.string().optional(),
    model_version: z.string().optional(),
  }),
});

export type EmotionResult = z.infer<typeof EmotionResultSchema>;
