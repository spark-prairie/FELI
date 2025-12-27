import { Stack } from 'expo-router';
import React, { useEffect } from 'react';

import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { HistoryItem } from '@/features/analysis/components/HistoryItem';
import { useAnalysisStore } from '@/stores/analysisStore';

export default function History() {
  const history = useAnalysisStore((state) => state.history);
  const checkAndResetDaily = useAnalysisStore(
    (state) => state.checkAndResetDaily
  );

  useEffect(() => {
    checkAndResetDaily();
  }, [checkAndResetDaily]);

  return (
    <>
      <Stack.Screen options={{ title: 'History' }} />
      <FocusAwareStatusBar />
      <View className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        {history.length === 0 ? (
          <View className="flex-1 items-center justify-center px-6">
            <Text className="mb-2 text-center text-4xl">📋</Text>
            <Text className="mb-2 text-center text-lg font-semibold text-neutral-800 dark:text-neutral-200">
              No History Yet
            </Text>
            <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Your analysis history will appear here
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
            <View className="p-6">
              <Text className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
                Recent analyses (max 10)
              </Text>
              {history.map((result) => (
                <HistoryItem key={result.result_id} result={result} />
              ))}
            </View>
          </ScrollView>
        )}
      </View>
    </>
  );
}
