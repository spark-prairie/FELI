import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { HistoryItem } from '@/features/history/components/history-item';
import { useAnalysisStore } from '@/stores/analysisStore';

export default function HistoryIndex() {
  const router = useRouter();
  const { history, checkAndResetDaily } = useAnalysisStore();

  useEffect(() => checkAndResetDaily(), [checkAndResetDaily]);

  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
      {history.length === 0 ? (
        <View className="flex-1 items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-900">
          <Text className="mb-2 text-4xl">📋</Text>
          <Text className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            No History Yet
          </Text>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            Your analysis history will appear here
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
          <View className="p-6">
            <Text className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              Recent analyses (max 10)
            </Text>
            {history.map((result) => (
              <HistoryItem
                key={result.result_id}
                result={result}
                onPress={() => router.push(`/history/${result.result_id}`)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
