import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { View } from '@/components/ui';
import { useAnalysisStore } from '@/stores/analysis-store';

import PreviewActions from './preview-actions';
import PreviewImage from './preview-image';

export default function AnalyzePreview() {
  const router = useRouter();
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const { imageUri } = params;

  const { clearCurrentResult } = useAnalysisStore();

  useEffect(() => {
    clearCurrentResult();
  }, [clearCurrentResult]);

  if (!imageUri) {
    router.back();
    return null;
  }

  const decodedUri = decodeURIComponent(imageUri);

  return (
    <>
      <Stack.Screen options={{ title: 'Preview' }} />
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <PreviewImage imageUri={decodedUri} />
        <PreviewActions imageUri={decodedUri} />
      </View>
    </>
  );
}
