import { useRouter } from 'expo-router';
import React from 'react';
import { Text, View } from 'react-native';

import { Button } from '../../components/ui/button'; // 调整为你的 Button 路径

export default function ErrorContent() {
  const router = useRouter();

  return (
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
  );
}
