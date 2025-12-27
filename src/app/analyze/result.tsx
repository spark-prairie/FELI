import { Stack, useRouter } from 'expo-router';
import React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { BulletList } from '@/features/analysis/components/bullet-list';
import { EmotionCard } from '@/features/analysis/components/emotion-card';
import { useAnalysisStore } from '@/stores/analysisStore';

export default function AnalyzeResult() {
  const router = useRouter();
  const currentResult = useAnalysisStore((state) => state.currentResult);

  if (!currentResult) {
    router.replace('/(app)/home');
    return null;
  }

  const {
    primary_emotion,
    secondary_emotion,
    reasoning,
    suggestions,
    disclaimer,
    confidence_note,
  } = currentResult;

  return (
    <>
      <Stack.Screen options={{ title: 'Results', headerBackVisible: false }} />
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <View className="p-6">
          <EmotionCard
            emotion={primary_emotion}
            confidenceNote={confidence_note}
          />

          {secondary_emotion && (
            <EmotionCard emotion={secondary_emotion} variant="secondary" />
          )}

          <BulletList title="What We Observed" items={reasoning} />
          <BulletList title="Suggestions" items={suggestions} />

          <View className="mb-6 rounded-xl bg-amber-50 p-4 dark:bg-amber-950">
            <Text className="mb-2 text-xs font-semibold uppercase text-amber-800 dark:text-amber-200">
              Important Note
            </Text>
            <Text className="text-xs leading-5 text-amber-900 dark:text-amber-100">
              {disclaimer}
            </Text>
          </View>

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
