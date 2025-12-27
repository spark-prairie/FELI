import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '@/api/common';
import { useAnalysisStore } from '@/stores/analysisStore';
import type { EmotionResult } from '@/types/emotion';
import { EmotionResultSchema } from '@/types/validators';

// DEV-only mock flag - set to true to test without backend
const USE_MOCK_ANALYZE = __DEV__ && true;

interface AnalyzeVariables {
  image?: File;
  image_base64?: string;
  deviceId?: string;
  isPro?: boolean;
  timestamp?: string;
}

interface AnalyzeErrorResponse {
  error?: string;
  message: string;
}

// Mock data for DEV testing
const MOCK_EMOTION_RESULT: EmotionResult = {
  result_id: `mock-${Date.now()}`,
  primary_emotion: {
    type: 'relaxed',
    confidence_percentage: 72,
  },
  secondary_emotion: {
    type: 'alert',
    confidence_percentage: 38,
  },
  reasoning: [
    'Eyes are half-closed with soft eyelids, indicating contentment',
    'Whiskers are relaxed and pointing slightly forward',
    'Body posture appears loose and comfortable without tension',
  ],
  suggestions: [
    'Continue providing this calm environment',
    'Gentle petting may be appreciated in this relaxed state',
  ],
  confidence_note: 'high',
  disclaimer:
    'This analysis is based on visual cues and should not replace veterinary advice. Cat emotions are complex and context-dependent.',
  meta: {
    visibility: 'clear',
    face_coverage: 0.85,
    created_at: new Date().toISOString(),
    model_version: 'mock-v1.0',
  },
};

export const useAnalyze = createMutation<
  EmotionResult,
  AnalyzeVariables,
  AxiosError<AnalyzeErrorResponse>
>({
  mutationFn: async (variables) => {
    console.log('[useAnalyze] mutationFn called with:', variables);

    // DEV-only mock path
    if (USE_MOCK_ANALYZE) {
      console.log('[useAnalyze] Using mock data (DEV mode)');
      const delay = 1000 + Math.random() * 500; // 1000-1500ms
      await new Promise((resolve) => setTimeout(resolve, delay));

      // Adjust mock based on isPro flag
      const mockResult: EmotionResult = {
        ...MOCK_EMOTION_RESULT,
        result_id: `mock-${Date.now()}`,
        primary_emotion: {
          ...MOCK_EMOTION_RESULT.primary_emotion,
          confidence_percentage: variables.isPro ? 72 : undefined,
        },
        secondary_emotion: variables.isPro
          ? MOCK_EMOTION_RESULT.secondary_emotion
          : null,
        confidence_note: variables.isPro ? undefined : 'high',
        meta: {
          ...MOCK_EMOTION_RESULT.meta,
          created_at: new Date().toISOString(),
        },
      };

      console.log('[useAnalyze] Mock response ready:', mockResult);
      return mockResult;
    }

    // Real API path
    const formData = new FormData();

    if (variables.image) {
      formData.append('image', variables.image);
    } else if (variables.image_base64) {
      formData.append('image_base64', variables.image_base64);
    }

    if (variables.deviceId) {
      formData.append('deviceId', variables.deviceId);
    }

    if (variables.isPro !== undefined) {
      formData.append('isPro', String(variables.isPro));
    }

    if (variables.timestamp) {
      formData.append('timestamp', variables.timestamp);
    }

    console.log('[useAnalyze] Sending API request...');
    const response = await client({
      url: '/api/v1/analyze',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    console.log('[useAnalyze] Response received:', response.data);
    const validatedData = EmotionResultSchema.parse(response.data);
    console.log('[useAnalyze] Validation successful');
    return validatedData;
  },
  onMutate: () => {
    console.log('[useAnalyze] onMutate called');
    useAnalysisStore.getState().setAnalyzing(true);
  },
  onSuccess: (data) => {
    console.log('[useAnalyze] onSuccess called with:', data);
    useAnalysisStore.getState().saveResult(data);
    useAnalysisStore.getState().incrementUsage();
  },
  onError: (error) => {
    console.log('[useAnalyze] onError called:', error);
    useAnalysisStore.getState().setAnalyzing(false);
  },
  onSettled: () => {
    console.log('[useAnalyze] onSettled called');
    useAnalysisStore.getState().setAnalyzing(false);
  },
});
