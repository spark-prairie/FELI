import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import {
  ActivityIndicator,
  Button,
  FocusAwareStatusBar,
  Text,
  View,
} from '@/components/ui';
import { useAnalysisStore } from '@/stores/analysisStore';

export default function AnalyzeLoading() {
  const router = useRouter();
  const currentResult = useAnalysisStore((state) => state.currentResult);
  const isAnalyzing = useAnalysisStore((state) => state.isAnalyzing);

  // Navigate to result when analysis completes successfully
  useEffect(() => {
    if (currentResult && !isAnalyzing) {
      setTimeout(() => {
        router.replace('/analyze/result');
      }, 500);
    }
  }, [currentResult, isAnalyzing, router]);

  // Error state: mutation finished (!isAnalyzing) but no result saved
  const hasError = !isAnalyzing && !currentResult;

  if (hasError) {
    return (
      <>
        <Stack.Screen
          options={{ title: 'Analysis', headerBackVisible: false }}
        />
        <FocusAwareStatusBar />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="mb-2 text-center text-6xl">😿</Text>
          <Text className="mb-4 text-center text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            Unable to Analyze
          </Text>
          <Text className="mb-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Please check your connection and try again
          </Text>
          <View className="w-full gap-3">
            <Button
              label="Try Again"
              onPress={() => router.back()}
              testID="retry-button"
            />
            <Button
              label="Back to Home"
              onPress={() => router.push('/(app)/home')}
              variant="outline"
              testID="back-home-button"
            />
          </View>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen
        options={{ title: 'Analyzing', headerBackVisible: false }}
      />
      <FocusAwareStatusBar />
      <View className="flex-1 items-center justify-center p-6">
        <ActivityIndicator
          size="large"
          className="mb-8 text-neutral-600 dark:text-neutral-400"
        />
        <Text className="mb-4 text-center text-xl font-semibold text-neutral-800 dark:text-neutral-200">
          Analyzing visual cues...
        </Text>
        <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Interpreting expressions and patterns
        </Text>
        <Text className="mt-2 text-center text-xs text-neutral-500 dark:text-neutral-500">
          This may take a moment
        </Text>
      </View>
    </>
  );
}
