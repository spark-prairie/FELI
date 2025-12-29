import { router } from 'expo-router';
import type { AxiosError } from 'axios';
import { createMutation } from 'react-query-kit';

import { client } from '@/api/common';
import { useAnalysisStore } from '@/stores/analysis-store';
import type { EmotionResult } from '@/types/emotion';
import { EmotionResultSchema } from '@/types/validators';

// DEV-only mock flag - set to true to test without backend
const USE_MOCK_ANALYZE = __DEV__ && true;

/**
 * SECURITY NOTICE - PRODUCTION DEPLOYMENT
 *
 * ⚠️  CRITICAL: In production, the backend MUST NOT trust the client-sent `isPro` flag.
 *
 * The `isPro` variable sent to the API can be manipulated by sophisticated users.
 * The backend MUST:
 * 1. Extract the user ID from the verified JWT token
 * 2. Query the database for the user's ACTUAL Pro status
 * 3. Use the database value to determine response filtering
 * 4. IGNORE the client-sent `isPro` flag entirely
 *
 * Client-sent `isPro` is ONLY for development/testing convenience.
 * Production security relies on server-side entitlement checks.
 *
 * See: docs/API_SECURITY.md for complete security architecture
 */

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
  code?: string;
  upgrade_url?: string;
}

// Helper to generate mock data based on Pro status
function generateMockResult(isPro: boolean): EmotionResult {
  const baseResult: EmotionResult = {
    primary_emotion: {
      type: 'relaxed',
      confidence_percentage: 72,
    },
    secondary_emotion: {
      type: 'alert',
      confidence_percentage: 38,
    },
    reasoning: isPro
      ? [
          'Eyes appear half-closed with soft eyelids, which may indicate contentment',
          'Whiskers appear relaxed and pointing slightly forward',
          'Body posture shows a loose and comfortable position without visible tension',
          'Ears are in a neutral, forward-facing position',
          'Tail is relaxed without any twitching or puffing',
          'Breathing pattern appears calm and regular',
        ]
      : [
          'Eyes appear half-closed with soft eyelids, which may indicate contentment',
          'Whiskers appear relaxed and pointing slightly forward',
          'Body posture shows a loose and comfortable position without visible tension',
        ],
    suggestions: isPro
      ? [
          'Continue providing this calm, comfortable environment',
          'Gentle interaction may be welcomed while the cat appears relaxed',
          'Maintain consistent feeding and play schedules',
          'Ensure access to favorite resting spots',
        ]
      : [
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

  return baseResult;
}

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
      const isPro = variables.isPro ?? false;
      console.log('[useAnalyze] Generating mock data for isPro:', isPro);

      const delay = 1000 + Math.random() * 500; // 1000-1500ms
      await new Promise((resolve) => setTimeout(resolve, delay));

      const mockResult = generateMockResult(isPro);
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

    // TODO: PRODUCTION SECURITY
    // In production, the backend MUST ignore this client-sent isPro flag
    // and instead verify entitlements from the database (synced via webhooks).
    // This flag is sent for backward compatibility and development/testing only.
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

    // Detect entitlement/payment errors from backend
    // 403 Forbidden = User lacks Pro entitlement
    // 402 Payment Required = Feature requires payment
    const status = error.response?.status;
    const errorData = error.response?.data;

    if (status === 403 || status === 402) {
      console.log('[useAnalyze] Entitlement error detected, redirecting to paywall');

      // Check if backend provided a specific error code
      if (errorData?.code === 'PRO_REQUIRED') {
        console.log('[useAnalyze] Backend confirmed: Pro subscription required');
      }

      // Navigate to paywall
      // Use setTimeout to ensure navigation happens after error handling
      setTimeout(() => {
        router.push('/paywall');
      }, 100);
    }

    useAnalysisStore.getState().setAnalyzing(false);
  },
  onSettled: () => {
    console.log('[useAnalyze] onSettled called');
    useAnalysisStore.getState().setAnalyzing(false);
  },
});
