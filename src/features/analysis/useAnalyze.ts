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

    const response = await client({
      url: '/api/v1/analyze',
      method: 'POST',
      data: formData,
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    const validatedData = EmotionResultSchema.parse(response.data);
    return validatedData;
  },
  onMutate: () => {
    useAnalysisStore.getState().setAnalyzing(true);
  },
  onSuccess: (data) => {
    useAnalysisStore.getState().saveResult(data);
    useAnalysisStore.getState().incrementUsage();
  },
  onError: () => {
    useAnalysisStore.getState().setAnalyzing(false);
  },
  onSettled: () => {
    useAnalysisStore.getState().setAnalyzing(false);
  },
});
