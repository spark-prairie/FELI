import { useRouter } from 'expo-router';
import React, { useCallback } from 'react';

import { PhotoCaptureButton } from '@/components/photo-capture-button';
import { FocusAwareStatusBar, Text, View } from '@/components/ui';
import { usePhotoCapture } from '@/lib/hooks/use-photo-capture';

export default function Home() {
  const router = useRouter();
  const { launchCamera, launchGallery, isLoading } = usePhotoCapture();

  const handleCameraPress = useCallback(async () => {
    const imageUri = await launchCamera();
    if (imageUri) {
      router.push(`/analyze/preview?imageUri=${encodeURIComponent(imageUri)}`);
    }
  }, [launchCamera, router]);

  const handleGalleryPress = useCallback(async () => {
    const imageUri = await launchGallery();
    if (imageUri) {
      router.push(`/analyze/preview?imageUri=${encodeURIComponent(imageUri)}`);
    }
  }, [launchGallery, router]);

  return (
    <>
      <FocusAwareStatusBar />
      <View className="flex-1 justify-center px-6">
        <View className="mb-12 items-center">
          <Text className="mb-4 text-center text-4xl font-bold">FELI</Text>
          <Text className="mb-2 text-center text-lg text-neutral-600 dark:text-neutral-400">
            Cat Emotion Lens
          </Text>
          <Text className="text-center text-sm text-neutral-500 dark:text-neutral-500">
            A probabilistic guide to understanding your cat's emotional state
            through visual cues
          </Text>
        </View>

        <View className="mb-4">
          <Text className="mb-6 text-center text-base text-neutral-600 dark:text-neutral-400">
            Capture or select a clear photo of your cat's face to begin
          </Text>
          <PhotoCaptureButton
            onCameraPress={handleCameraPress}
            onGalleryPress={handleGalleryPress}
            isLoading={isLoading}
          />
        </View>

        <Text className="mt-8 text-center text-xs text-neutral-400 dark:text-neutral-500">
          Not a medical diagnostic tool. For entertainment and insight only.
        </Text>
      </View>
    </>
  );
}
