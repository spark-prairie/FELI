import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';

import { Button, Image, Text, View } from '@/components/ui';
import { useAnalyze } from '@/features/analysis';
import { useAnalysisStore } from '@/stores/analysisStore';

export default function AnalyzePreview() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const router = useRouter();
  const { imageUri } = params;

  const { mutate, isPending } = useAnalyze();
  const { isPro, clearCurrentResult } = useAnalysisStore();
  const analyze = useAnalyze();
  console.log('[Preview] useAnalyze return:', analyze);

  useEffect(() => clearCurrentResult(), [clearCurrentResult]);

  const handleAnalyze = useCallback(() => {
    console.log('[handleAnalyze] Called');
    console.log('[handleAnalyze] imageUri:', imageUri);

    if (!imageUri) {
      console.log('[handleAnalyze] No imageUri, returning');
      return;
    }

    // Navigate immediately, before mutation
    router.push('/analyze/loading');

    console.log('[handleAnalyze] Calling mutate...');
    mutate({
      image_base64: decodeURIComponent(imageUri),
      isPro,
      timestamp: new Date().toISOString(),
    });
    console.log('[handleAnalyze] mutate called (async)');
  }, [imageUri, isPro, mutate, router]);

  if (!imageUri) {
    router.back();
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Preview' }} />
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <View className="flex-1 items-center justify-center p-6">
          <View className="mb-6 w-full overflow-hidden rounded-2xl">
            <Image
              source={{ uri: decodeURIComponent(imageUri) }}
              className="aspect-square w-full"
              contentFit="cover"
            />
          </View>

          <Text className="mb-8 text-center text-sm text-neutral-600 dark:text-neutral-400">
            Review your photo before analysis
          </Text>

          <Button
            label="Analyze"
            onPress={handleAnalyze}
            loading={isPending}
            disabled={isPending}
            size="lg"
            testID="analyze-button"
          />

          <Button
            label="Choose Different Photo"
            onPress={() => router.back()}
            variant="outline"
            className="mt-4"
            testID="back-button"
          />
        </View>
      </View>
    </>
  );
}
