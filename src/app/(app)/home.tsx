import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';

import { PhotoCaptureButton } from '@/components/photo-capture-button';
import { UsageBanner } from '@/components/usage-banner';
import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { usePhotoCapture } from '@/lib/hooks/use-photo-capture';
import { DAILY_LIMIT_FREE, useAnalysisStore } from '@/stores/analysisStore';

export default function Home() {
  const router = useRouter();
  const { launchCamera, launchGallery, isLoading } = usePhotoCapture();
  const { isPro, dailyUsageCount, checkAndResetDaily } = useAnalysisStore();

  const isLimitReached = !isPro && dailyUsageCount >= DAILY_LIMIT_FREE;

  useEffect(() => checkAndResetDaily(), [checkAndResetDaily]);

  const handleCapture = useCallback(
    async (captureMethod: () => Promise<string | null>) => {
      if (isLimitReached) {
        Alert.alert(
          'Daily Limit Reached',
          `You've used all ${DAILY_LIMIT_FREE} free analyses today.`,
          [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Upgrade', onPress: () => router.push('/paywall') },
          ]
        );
        return;
      }
      const uri = await captureMethod();
      if (uri) router.push(`/analyze/preview?imageUri=${encodeURIComponent(uri)}`);
    },
    [isLimitReached, router]
  );

  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1 justify-center px-6">
        <View className="mb-8 items-center">
          <Text className="mb-4 text-center text-4xl font-bold">FELI</Text>
          <Text className="mb-2 text-center text-lg text-neutral-600 dark:text-neutral-400">
            Cat Emotion Lens
          </Text>
          <Text className="text-center text-sm text-neutral-500 dark:text-neutral-500">
            A probabilistic guide to understanding your cat's emotional state
          </Text>
        </View>

        <UsageBanner />

        <View className="mb-4">
          <Text className="mb-6 text-center text-base text-neutral-600 dark:text-neutral-400">
            Capture or select a clear photo of your cat's face to begin
          </Text>
          <PhotoCaptureButton
            onCameraPress={() => handleCapture(launchCamera)}
            onGalleryPress={() => handleCapture(launchGallery)}
            isLoading={isLoading}
            disabled={isLimitReached}
          />
        </View>

        <Text className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Not a medical diagnostic tool. For entertainment and insight only.
        </Text>
      </View>
    </>
  );
}
