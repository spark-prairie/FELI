import { Stack, useRouter } from 'expo-router';
import { useEffect } from 'react';

import { FocusAwareStatusBar } from '@/components/ui';
import { useAnalysisStore } from '@/stores/analysis-store';

import ErrorContent from './error-content';
import LoadingContent from './loading-content';

export default function AnalyzeLoading() {
  const router = useRouter();
  const currentResult = useAnalysisStore((state) => state.currentResult);
  const isAnalyzing = useAnalysisStore((state) => state.isAnalyzing);

  // Navigate to result when analysis completes
  useEffect(() => {
    if (currentResult && !isAnalyzing) {
      const timer = setTimeout(() => {
        router.replace('/analyze/result');
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [currentResult, isAnalyzing, router]);

  const hasError = !isAnalyzing && !currentResult;

  return (
    <>
      <Stack.Screen
        options={{
          title: hasError ? 'Analysis' : 'Analyzing',
          headerBackVisible: false,
        }}
      />
      <FocusAwareStatusBar />
      {hasError ? <ErrorContent /> : <LoadingContent />}
    </>
  );
}
