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
// Conforms EXACTLY to EmotionResultSchema
const MOCK_EMOTION_RESULT: EmotionResult = {
  primary_emotion: {
    type: 'relaxed',
    confidence_percentage: 72,
  },
  secondary_emotion: {
    type: 'alert',
    confidence_percentage: 38,
  },
  reasoning: [
    'Eyes appear half-closed with soft eyelids, which may indicate contentment',
    'Whiskers appear relaxed and pointing slightly forward',
    'Body posture shows a loose and comfortable position without visible tension',
  ],
  suggestions: [
    'Continue providing this calm, comfortable environment',
    'Gentle interaction may be welcomed while the cat appears relaxed',
  ],
  confidence_note: 'high',
  disclaimer:
    "This interpretation is based on visible behavioral cues and is not a substitute for professional veterinary advice. Always consult a vet if you have concerns about your cat's health or wellbeing.",
  meta: {
    visibility: 'clear',
    face_coverage: 0.85,
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

      console.log('[useAnalyze] Mock response ready:', MOCK_EMOTION_RESULT);
      return MOCK_EMOTION_RESULT;
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
