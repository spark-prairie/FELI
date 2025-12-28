import { Stack, useRouter } from 'expo-router';
import React from 'react';

import {
  Button,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { SubscriptionGate } from '@/components/subscription-gate';
import { ActionSuggestionList } from '@/features/analysis/components/action-suggestion-list';
import { EmotionBadge } from '@/features/analysis/components/emotion-badge';
import { ReasoningList } from '@/features/analysis/components/reasoning-list';
import { SecondaryEmotionCard } from '@/features/analysis/components/secondary-emotion-card';
import { useAnalysisStore } from '@/stores/analysis-store';

export default function AnalyzeResult() {
  const router = useRouter();
  const currentResult = useAnalysisStore((state) => state.currentResult);
  const globalIsPro = useAnalysisStore((state) => state.isPro);

  if (!currentResult) {
    router.replace('/(app)/home');
    return null;
  }

  // Use record's Pro status if it's a stored result, otherwise use global isPro
  const isStoredResult = 'isProAtSave' in currentResult;
  const isPro = isStoredResult
    ? (currentResult as any).isProAtSave ?? globalIsPro
    : globalIsPro;

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
          {/* Primary Emotion */}
          <EmotionBadge
            emotion={primary_emotion}
            confidenceNote={confidence_note}
            showPercentage={isPro}
            isPro={isPro}
          />

          {/* Secondary Emotion (Pro Only) */}
          {isPro ? (
            <SecondaryEmotionCard emotion={secondary_emotion} />
          ) : (
            <LockedSecondaryEmotion />
          )}

          {/* Reasoning (Limited for Free) */}
          <ReasoningList items={reasoning} isPro={isPro} />

          {/* Suggestions */}
          <ActionSuggestionList items={suggestions} />

          {/* Disclaimer */}
          <DisclaimerCard disclaimer={disclaimer} />

          {/* Pro Upgrade CTA (Free Users Only) */}
          {!isPro && <ProUpgradeCTA router={router} />}

          {/* Back to Home */}
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

/**
 * Locked secondary emotion (Free users)
 */
function LockedSecondaryEmotion() {
  return (
    <SubscriptionGate mode="modal">
      <View className="mb-6">
        <Text className="mb-3 text-base font-semibold text-neutral-800 dark:text-neutral-100">
          Secondary Emotion
        </Text>
        <View className="rounded-xl bg-neutral-100 p-6 dark:bg-neutral-800">
          <View className="items-center">
            <Text className="mb-2 text-4xl">🔒</Text>
            <Text className="mb-1 text-center text-base font-semibold text-neutral-800 dark:text-neutral-100">
              Pro Feature
            </Text>
            <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              Tap to unlock secondary emotion insights
            </Text>
          </View>
        </View>
      </View>
    </SubscriptionGate>
  );
}

/**
 * Disclaimer card
 */
interface DisclaimerCardProps {
  disclaimer: string;
}

function DisclaimerCard({ disclaimer }: DisclaimerCardProps) {
  return (
    <View className="mb-6 rounded-xl bg-amber-50 p-4 dark:bg-amber-950">
      <Text className="mb-2 text-xs font-semibold uppercase text-amber-800 dark:text-amber-200">
        Important Note
      </Text>
      <Text className="text-xs leading-5 text-amber-900 dark:text-amber-100">
        {disclaimer}
      </Text>
    </View>
  );
}

/**
 * Pro upgrade CTA
 */
interface ProUpgradeCTAProps {
  router: any;
}

function ProUpgradeCTA({ router }: ProUpgradeCTAProps) {
  return (
    <View className="mb-6 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-5 dark:from-purple-950 dark:to-indigo-950">
      <View className="mb-3 flex-row items-center">
        <Text className="mr-2 text-2xl">✨</Text>
        <Text className="flex-1 text-lg font-bold text-purple-900 dark:text-purple-100">
          Unlock Deeper Insights
        </Text>
      </View>
      <Text className="mb-4 text-sm leading-6 text-purple-800 dark:text-purple-200">
        Pro members get exact confidence percentages, secondary emotions, full
        reasoning details, and unlimited daily analyses.
      </Text>
      <Button
        label="Upgrade to Pro"
        onPress={() => router.push('/paywall')}
        size="lg"
        testID="upgrade-to-pro-button"
      />
    </View>
  );
}
