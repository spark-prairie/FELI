import { Stack, useRouter } from 'expo-router';
import React, { useEffect } from 'react';

import {
  FocusAwareStatusBar,
  Pressable,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { useAnalysisStore } from '@/stores/analysisStore';
import type { CatEmotion } from '@/types/emotion';

const EMOTION_EMOJI: Record<CatEmotion, string> = {
  relaxed: '😌',
  alert: '👀',
  anxious: '😰',
  irritated: '😾',
  possible_discomfort: '😿',
};

export default function HistoryIndex() {
  const router = useRouter();
  const history = useAnalysisStore((state) => state.history);
  const checkAndResetDaily = useAnalysisStore(
    (state) => state.checkAndResetDaily
  );

  useEffect(() => {
    checkAndResetDaily();
  }, [checkAndResetDaily]);

  if (history.length === 0) {
    return (
      <>
        <Stack.Screen options={{ title: 'History' }} />
        <FocusAwareStatusBar />
        <View className="flex-1 items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-900">
          <Text className="mb-2 text-center text-4xl">📋</Text>
          <Text className="mb-2 text-center text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            No History Yet
          </Text>
          <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
            Your analysis history will appear here
          </Text>
        </View>
      </>
    );
  }

  return (
    <>
      <Stack.Screen options={{ title: 'History' }} />
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <View className="p-6">
          <Text className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
            Recent analyses (max 10)
          </Text>
          {history.map((result) => {
            const emoji = EMOTION_EMOJI[result.primary_emotion.type];
            const emotionName = result.primary_emotion.type.replace('_', ' ');
            const date = result.meta.created_at
              ? new Date(result.meta.created_at).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })
              : 'Unknown date';

            return (
              <Pressable
                key={result.result_id}
                onPress={() => router.push(`/history/${result.result_id}`)}
                className="mb-3 flex-row items-center rounded-xl bg-white p-4 dark:bg-neutral-800"
              >
                <Text className="mr-4 text-3xl">{emoji}</Text>
                <View className="flex-1">
                  <Text className="mb-1 text-base font-semibold capitalize text-neutral-800 dark:text-neutral-200">
                    {emotionName}
                  </Text>
                  <Text className="text-xs text-neutral-500 dark:text-neutral-400">
                    {date}
                  </Text>
                </View>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
    </>
  );
}
