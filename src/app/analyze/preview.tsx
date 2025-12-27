import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

import { Button, Image, Text, View } from '@/components/ui';

export default function AnalyzePreview() {
  const params = useLocalSearchParams<{ imageUri?: string }>();
  const router = useRouter();
  const { imageUri } = params;

  if (!imageUri) {
    return (
      <>
        <Stack.Screen options={{ title: 'Preview' }} />
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-center text-lg text-neutral-600">
            No image provided
          </Text>
          <Button
            label="Go Back"
            onPress={() => router.back()}
            variant="outline"
            className="mt-4"
          />
        </View>
      </>
    );
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
            label="Analyze (Coming Soon)"
            disabled
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
