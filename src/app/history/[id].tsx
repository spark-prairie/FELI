import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { ActionSuggestionList } from '@/features/analysis/components/action-suggestion-list';
import { EmotionBadge } from '@/features/analysis/components/emotion-badge';
import { ReasoningList } from '@/features/analysis/components/reasoning-list';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function HistoryDetail() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const history = useAnalysisStore((state) => state.history);
  const result = history.find((item) => item.result_id === id);

  if (!result) {
    return (
      <View className="flex-1 p-3 ">
        <FocusAwareStatusBar />
        <View className="flex-1 items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-900">
          <Text className="mb-2 text-4xl">🔍</Text>
          <Text className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            Analysis Not Found
          </Text>
          <Button label="Back" onPress={() => router.back()} />
        </View>
      </View>
    );
  }

  const {
    primary_emotion,
    reasoning,
    suggestions,
    disclaimer,
    confidence_note,
  } = result;
  const date = new Date(result.created_at).toLocaleDateString();

  return (
    <View className="flex-1 p-3 ">
      <Stack.Screen options={{ title: 'Detail', headerBackTitle: 'History' }} />
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <View className="p-6">
          <View className="mb-4 rounded-lg bg-blue-50 px-3 py-2 dark:bg-blue-950">
            <Text className="text-center text-xs text-blue-800 dark:text-blue-200">
              Saved on {date}
            </Text>
          </View>

          <EmotionBadge
            emotion={primary_emotion}
            confidenceNote={confidence_note}
          />
          <ReasoningList items={reasoning} />
          <ActionSuggestionList items={suggestions} />

          <View className="mb-6 rounded-xl bg-amber-50 p-4 dark:bg-amber-950">
            <Text className="mb-2 text-xs font-semibold uppercase text-amber-800 dark:text-amber-200">
              Important Note
            </Text>
            <Text className="text-xs leading-5 text-amber-900 dark:text-amber-100">
              {disclaimer}
            </Text>
          </View>

          <Button
            label="Back to History"
            onPress={() => router.back()}
            size="lg"
          />
        </View>
      </ScrollView>
    </View>
  );
}
