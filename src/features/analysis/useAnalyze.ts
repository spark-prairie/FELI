import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '@/api/common';
import { useAnalysisStore } from '@/stores/analysisStore';
import type { EmotionResult } from '@/types/emotion';
import { EmotionResultSchema } from '@/types/validators';

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

export const useAnalyze = createMutation<
  EmotionResult,
  AnalyzeVariables,
  AxiosError<AnalyzeErrorResponse>
>({
  mutationFn: async (variables) => {
    console.log('[useAnalyze] mutationFn called with:', variables);
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
