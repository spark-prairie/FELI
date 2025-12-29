import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { Text, View } from 'react-native';

import { Button } from '@/components/ui/button';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function ErrorContent() {
  const { t } = useTranslation();
  const router = useRouter();
  const { setAnalyzing, clearCurrentResult } = useAnalysisStore();

  const handleRetry = useCallback(() => {
    // Reset analysis state before retrying
    setAnalyzing(false);
    clearCurrentResult();
    // Navigate back to preview to retry analysis
    router.back();
  }, [setAnalyzing, clearCurrentResult, router]);

  const handleBackToHome = useCallback(() => {
    // Reset analysis state before going home
    setAnalyzing(false);
    clearCurrentResult();
    router.push('/(app)/home');
  }, [setAnalyzing, clearCurrentResult, router]);

  return (
    <View className="flex-1 items-center justify-center p-6">
      <Text
        className="mb-2 text-center text-6xl"
        accessibilityLabel={t('analyze.error_emoji_accessibility')}
      >
        😿
      </Text>
      <Text className="mb-4 text-center text-lg font-semibold text-neutral-800 dark:text-neutral-200">
        {t('analyze.error_title')}
      </Text>
      <Text className="mb-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
        {t('analyze.error_message')}
      </Text>
      <View className="w-full gap-3">
        <Button
          label={t('analyze.retry_button')}
          onPress={handleRetry}
          testID="retry-button"
        />
        <Button
          label={t('analyze.back_home_button')}
          onPress={handleBackToHome}
          variant="outline"
          testID="back-home-button"
        />
      </View>
    </View>
  );
}
