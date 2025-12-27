import { Stack, useRouter } from 'expo-router';
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
import { useAnalysisStore } from '@/stores/analysisStore';

export default function AnalyzeResult() {
  const router = useRouter();
  const currentResult = useAnalysisStore((state) => state.currentResult);
  const isPro = useAnalysisStore((state) => state.isPro);

  if (!currentResult) {
    router.replace('/(app)/home');
    return null;
  }

  const { primary_emotion, reasoning, suggestions, disclaimer, confidence_note } =
    currentResult;

  return (
    <>
      <Stack.Screen options={{ title: 'Results', headerBackVisible: false }} />
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <View className="p-6">
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

          {!isPro && (
            <View className="mb-6 rounded-xl bg-purple-50 p-4 dark:bg-purple-950">
              <Text className="mb-2 text-sm font-semibold text-purple-900 dark:text-purple-100">
                Want deeper insights?
              </Text>
              <Text className="mb-4 text-xs leading-5 text-purple-800 dark:text-purple-200">
                Pro members get secondary emotions, confidence scores, and
                unlimited daily analyses
              </Text>
              <Button
                label="Upgrade to Pro"
                onPress={() => router.push('/paywall')}
                variant="outline"
                size="sm"
              />
            </View>
          )}

          <Button
            label="Back to Home"
            onPress={() => router.push('/(app)/home')}
            size="lg"
            testID="back-to-home-button"
          />
        </View>
      </ScrollView>
    </>
  );
}
