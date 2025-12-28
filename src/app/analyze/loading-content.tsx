import React from 'react';
import { ActivityIndicator, Text, View } from 'react-native';

export default function LoadingContent() {
  return (
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
  );
}
