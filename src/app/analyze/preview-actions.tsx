import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';

import { Button, View } from '@/components/ui';
import { useAnalyze } from '@/features/analysis';
import { useAnalysisStore } from '@/stores/analysis-store';

type PreviewActionsProps = {
  imageUri: string;
};

export default function PreviewActions({ imageUri }: PreviewActionsProps) {
  const router = useRouter();
  const { mutate, isPending } = useAnalyze();
  const { isPro } = useAnalysisStore();

  const handleAnalyze = useCallback(() => {
    if (!imageUri) return;

    router.push('/analyze/loading');

    mutate({
      image_base64: imageUri,
      isPro,
      timestamp: new Date().toISOString(),
    });
  }, [imageUri, isPro, mutate, router]);

  return (
    <View className="w-full gap-3 px-6 pb-6">
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
        testID="back-button"
      />
    </View>
  );
}
