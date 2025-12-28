import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
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
      <Stack.Screen options={{ title: t('analyze.result_title'), headerBackVisible: false }} />
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
          <DisclaimerCard />

          {/* Pro Upgrade CTA (Free Users Only) */}
          {!isPro && <ProUpgradeCTA router={router} />}

          {/* Back to Home */}
          <Button
            label={t('analyze.back_to_home')}
            onPress={() => router.push('/(app)/home')}
            size="lg"
            hapticFeedback
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
  const { t } = useTranslation();

  return (
    <SubscriptionGate mode="modal">
      <View
        className="mb-6"
        accessibilityLabel={t('result.accessibility.secondary_emotion_locked')}
        accessibilityRole="button"
      >
        <Text className="mb-3 text-base font-semibold text-neutral-800 dark:text-neutral-100">
          {t('result.locked_secondary_emotion_title')}
        </Text>
        <View className="rounded-xl bg-neutral-100 p-6 dark:bg-neutral-800">
          <View className="items-center">
            <Text className="mb-2 text-4xl">🔒</Text>
            <Text className="mb-1 text-center text-base font-semibold text-neutral-800 dark:text-neutral-100">
              {t('result.locked_pro_feature')}
            </Text>
            <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
              {t('result.locked_secondary_emotion_subtitle')}
            </Text>
          </View>
        </View>
      </View>
    </SubscriptionGate>
  );
}

/**
 * Disclaimer card - Polished and less scary
 */
function DisclaimerCard() {
  const { t } = useTranslation();

  return (
    <View
      className="mb-6 rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-900 dark:bg-blue-950/50"
      accessibilityRole="text"
      accessibilityLabel={t('result.disclaimer_title')}
    >
      <View className="mb-2 flex-row items-center">
        <Text className="mr-2 text-sm">ℹ️</Text>
        <Text className="text-xs font-semibold text-blue-900 dark:text-blue-200">
          {t('result.disclaimer_title')}
        </Text>
      </View>
      <Text className="text-xs leading-5 text-blue-800 dark:text-blue-300">
        {t('result.disclaimer_message')}
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
  const { t } = useTranslation();

  return (
    <View
      className="mb-6 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-5 dark:from-purple-950 dark:to-indigo-950"
      accessibilityLabel={t('result.accessibility.upgrade_prompt')}
      accessibilityRole="text"
    >
      <View className="mb-3 flex-row items-center">
        <Text className="mr-2 text-2xl">✨</Text>
        <Text className="flex-1 text-lg font-bold text-purple-900 dark:text-purple-100">
          {t('result.pro_upgrade_title')}
        </Text>
      </View>
      <Text className="mb-4 text-sm leading-6 text-purple-800 dark:text-purple-200">
        {t('result.pro_upgrade_message')}
      </Text>
      <Button
        label={t('result.pro_upgrade_button')}
        onPress={() => router.push('/paywall')}
        size="lg"
        hapticFeedback
        testID="upgrade-to-pro-button"
      />
    </View>
  );
}
