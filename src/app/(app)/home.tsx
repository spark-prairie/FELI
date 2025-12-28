import { useRouter } from 'expo-router';
import React, { useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { PhotoCaptureButton } from '@/components/photo-capture-button';
import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { UsageBanner } from '@/components/usage-banner';
import { usePhotoCapture } from '@/lib/hooks/use-photo-capture';
import { DAILY_LIMIT_FREE, useAnalysisStore } from '@/stores/analysis-store';

export default function Home() {
  const { t } = useTranslation();
  const router = useRouter();
  const { launchCamera, launchGallery, isLoading } = usePhotoCapture();
  const { isPro, dailyUsageCount, checkAndResetDaily } = useAnalysisStore();

  const isLimitReached = !isPro && dailyUsageCount >= DAILY_LIMIT_FREE;

  useEffect(() => checkAndResetDaily(), [checkAndResetDaily]);

  const handleCapture = useCallback(
    async (captureMethod: () => Promise<string | null>) => {
      if (isLimitReached) {
        Alert.alert(
          t('home.daily_limit_reached_title'),
          t('home.daily_limit_reached_message', { count: DAILY_LIMIT_FREE }),
          [
            { text: t('common.cancel'), style: 'cancel' },
            { text: t('common.upgrade'), onPress: () => router.push('/paywall') },
          ]
        );
        return;
      }
      const uri = await captureMethod();
      if (uri)
        router.push(`/analyze/preview?imageUri=${encodeURIComponent(uri)}`);
    },
    [isLimitReached, router, t]
  );

  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1 justify-center px-6">
        <View className="mb-8 items-center">
          <Text className="mb-4 text-center text-4xl font-bold">{t('home.title')}</Text>
          <Text className="mb-2 text-center text-lg text-neutral-600 dark:text-neutral-400">
            {t('home.tagline')}
          </Text>
          <Text className="text-center text-sm text-neutral-500 dark:text-neutral-500">
            {t('home.subtitle')}
          </Text>
        </View>

        <UsageBanner />

        <View className="mb-4">
          <Text className="mb-6 text-center text-base text-neutral-600 dark:text-neutral-400">
            {t('home.instruction')}
          </Text>
          <PhotoCaptureButton
            onCameraPress={() => handleCapture(launchCamera)}
            onGalleryPress={() => handleCapture(launchGallery)}
            isLoading={isLoading}
            disabled={isLimitReached}
          />
        </View>

        <Text className="mt-6 text-center text-xs text-neutral-400 dark:text-neutral-500">
          {t('home.disclaimer')}
        </Text>
      </View>
    </>
  );
}
