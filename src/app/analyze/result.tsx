import { Stack, useRouter } from 'expo-router';
import { MotiView } from 'moti';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { SubscriptionGate } from '@/components/subscription-gate';
import {
  Button,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { ReasoningList } from '@/features/analysis/components/reasoning-list';
import { SecondaryEmotionCard } from '@/features/analysis/components/secondary-emotion-card';
import { useAnalysisStore } from '@/stores/analysis-store';
import type {
  CatEmotion,
  ConfidenceNote,
  EmotionConfidence,
} from '@/types/emotion';

// Emotion configuration
const EMOTION_EMOJI: Record<CatEmotion, string> = {
  relaxed: '😌',
  alert: '👀',
  anxious: '😰',
  irritated: '😾',
  possible_discomfort: '😿',
};

const EMOTION_COLORS: Record<CatEmotion, string> = {
  relaxed: 'from-emerald-400 to-teal-500',
  alert: 'from-amber-400 to-orange-500',
  anxious: 'from-purple-400 to-indigo-500',
  irritated: 'from-red-400 to-rose-500',
  possible_discomfort: 'from-blue-400 to-cyan-500',
};

const CONFIDENCE_COLORS: Record<ConfidenceNote, string> = {
  low: 'text-amber-600 dark:text-amber-400',
  medium: 'text-blue-600 dark:text-blue-400',
  high: 'text-emerald-600 dark:text-emerald-400',
};

// Suggestion emoji mapping based on keywords
const getSuggestionEmoji = (text: string): string => {
  const lowerText = text.toLowerCase();
  if (lowerText.includes('play') || lowerText.includes('interaction')) return '🎮';
  if (lowerText.includes('feed') || lowerText.includes('food') || lowerText.includes('treat')) return '🍽️';
  if (lowerText.includes('rest') || lowerText.includes('sleep') || lowerText.includes('calm')) return '💤';
  if (lowerText.includes('vet') || lowerText.includes('health') || lowerText.includes('medical')) return '🩺';
  if (lowerText.includes('space') || lowerText.includes('quiet') || lowerText.includes('alone')) return '🏠';
  if (lowerText.includes('water') || lowerText.includes('hydration')) return '💧';
  if (lowerText.includes('comfort') || lowerText.includes('cozy')) return '🛋️';
  if (lowerText.includes('monitor') || lowerText.includes('watch') || lowerText.includes('observe')) return '👁️';
  return '💡'; // Default suggestion icon
};

export default function AnalyzeResult() {
  const { t } = useTranslation();
  const router = useRouter();
  const currentResult = useAnalysisStore((state) => state.currentResult);
  const globalIsPro = useAnalysisStore((state) => state.isPro);

  // Navigate away if no result (must be in useEffect to avoid render-time navigation)
  useEffect(() => {
    if (!currentResult) {
      router.replace('/(app)/home');
    }
  }, [currentResult, router]);

  // Early return to prevent rendering with undefined data
  if (!currentResult) {
    return null;
  }

  // Determine if Pro features should be shown
  const isStoredResult = 'isProAtSave' in currentResult;
  const hasProData = currentResult.primary_emotion.confidence_percentage > 0;
  const isPro =
    (isStoredResult && (currentResult as any).isProAtSave) ||
    hasProData ||
    globalIsPro;

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
      <Stack.Screen
        options={{ title: t('analyze.result_title'), headerBackVisible: false }}
      />
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        {/* SOFT CARD WRAPPER with breathing room and fade-in animation */}
        <MotiView
          from={{ opacity: 0, translateY: 20 }}
          animate={{ opacity: 1, translateY: 0 }}
          transition={{
            type: 'timing',
            duration: 400,
            opacity: { duration: 300 },
          }}
          className="p-8"
        >
          {/* HERO BADGE - Primary Emotion */}
          <HeroEmotionBadge
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

          {/* ICON-BASED SUGGESTIONS */}
          <IconBasedSuggestions items={suggestions} isPro={isPro} />

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
        </MotiView>
      </ScrollView>
    </>
  );
}

/**
 * HERO EMOTION BADGE - Large, prominent, with gradient background
 */
interface HeroEmotionBadgeProps {
  emotion: EmotionConfidence;
  confidenceNote?: ConfidenceNote;
  showPercentage?: boolean;
  isPro?: boolean;
}

function HeroEmotionBadge({
  emotion,
  confidenceNote,
  showPercentage = false,
  isPro = false,
}: HeroEmotionBadgeProps) {
  const { t } = useTranslation();
  const emoji = EMOTION_EMOJI[emotion.type];
  const emotionName = t(`emotions.${emotion.type}`);
  const gradientColors = EMOTION_COLORS[emotion.type];
  const colorClass = confidenceNote ? CONFIDENCE_COLORS[confidenceNote] : '';

  const confidenceText =
    showPercentage && emotion.confidence_percentage !== undefined
      ? `${emotion.confidence_percentage} percent confidence`
      : confidenceNote
        ? `${confidenceNote} confidence`
        : '';

  const accessibilityLabel = t('result.accessibility.emotion_badge', {
    emotion: emotionName,
    confidence: confidenceText,
  });

  return (
    <View
      className="mb-8 overflow-hidden rounded-[24px] bg-white/90 shadow-lg shadow-orange-100 dark:bg-neutral-800/90 dark:shadow-orange-900/20"
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      {/* Gradient header */}
      <View className={`bg-gradient-to-r p-8 ${gradientColors}`}>
        <View className="items-center">
          {isPro && <ProBadge />}
          {/* Large emoji */}
          <Text className="mb-4 text-8xl">{emoji}</Text>
          {/* Emotion name */}
          <Text className="mb-2 text-center text-3xl font-bold capitalize text-white drop-shadow-md">
            {emotionName}
          </Text>
          {/* Confidence indicator */}
          {showPercentage && emotion.confidence_percentage !== undefined ? (
            <View className="rounded-full bg-white/30 px-4 py-2">
              <Text className="text-center text-base font-semibold text-white">
                {emotion.confidence_percentage}% {t('result.confidence_high')}
              </Text>
            </View>
          ) : confidenceNote ? (
            <View className="rounded-full bg-white/30 px-4 py-2">
              <Text className="text-center text-sm font-medium capitalize text-white">
                {confidenceNote} confidence
              </Text>
            </View>
          ) : null}
        </View>
      </View>

      {/* Label section */}
      <View className="bg-white p-4 dark:bg-neutral-800">
        <Text className="text-center text-sm font-medium text-neutral-600 dark:text-neutral-400">
          {t('result.primary_emotion_label')}
        </Text>
      </View>
    </View>
  );
}

/**
 * ICON-BASED SUGGESTIONS - Emoji icons with text
 */
interface IconBasedSuggestionsProps {
  items: string[];
  isPro?: boolean;
}

function IconBasedSuggestions({ items, isPro = false }: IconBasedSuggestionsProps) {
  const { t } = useTranslation();

  // Pro users see up to 4 suggestions, free users see 2
  const displayItems = isPro ? items.slice(0, 4) : items.slice(0, 2);
  const hiddenCount = items.length - displayItems.length;

  return (
    <View className="mb-8">
      <Text className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-100">
        {t('result.suggestions_label')}
      </Text>
      <View className="gap-3">
        {displayItems.map((item, index) => {
          const emoji = getSuggestionEmoji(item);
          return (
            <View
              key={index}
              className="flex-row items-start rounded-2xl bg-white p-4 shadow-sm shadow-blue-100 dark:bg-neutral-800 dark:shadow-blue-900/20"
            >
              {/* Emoji icon */}
              <Text className="mr-3 text-2xl">{emoji}</Text>
              {/* Suggestion text */}
              <Text className="flex-1 text-sm font-medium leading-6 text-neutral-800 dark:text-neutral-100">
                {item}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Show locked suggestions count for free users */}
      {!isPro && hiddenCount > 0 && (
        <View className="mt-3 rounded-xl bg-purple-50 p-3 dark:bg-purple-950">
          <Text className="text-center text-xs font-medium text-purple-700 dark:text-purple-300">
            {t('result.more_insights_available', { count: hiddenCount })}
          </Text>
        </View>
      )}
    </View>
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
        className="mb-8"
        accessibilityLabel={t('result.accessibility.secondary_emotion_locked')}
        accessibilityRole="button"
      >
        <Text className="mb-4 text-lg font-semibold text-neutral-800 dark:text-neutral-100">
          {t('result.locked_secondary_emotion_title')}
        </Text>
        <View className="rounded-2xl bg-white p-8 shadow-sm shadow-purple-100 dark:bg-neutral-800 dark:shadow-purple-900/20">
          <View className="items-center">
            <Text className="mb-3 text-5xl">🔒</Text>
            <Text className="mb-2 text-center text-base font-semibold text-neutral-800 dark:text-neutral-100">
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
      className="mb-8 rounded-2xl border border-blue-200 bg-blue-50/50 p-5 dark:border-blue-900 dark:bg-blue-950/50"
      accessibilityRole="text"
      accessibilityLabel={t('result.disclaimer_title')}
    >
      <View className="mb-2 flex-row items-center">
        <Text className="mr-2 text-base">ℹ️</Text>
        <Text className="text-sm font-semibold text-blue-900 dark:text-blue-200">
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
      className="mb-8 overflow-hidden rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 shadow-lg shadow-purple-100 dark:from-purple-950 dark:to-indigo-950 dark:shadow-purple-900/20"
      accessibilityLabel={t('result.accessibility.upgrade_prompt')}
      accessibilityRole="text"
    >
      <View className="p-6">
        <View className="mb-4 flex-row items-center">
          <Text className="mr-3 text-3xl">✨</Text>
          <Text className="flex-1 text-xl font-bold text-purple-900 dark:text-purple-100">
            {t('result.pro_upgrade_title')}
          </Text>
        </View>
        <Text className="mb-6 text-sm leading-6 text-purple-800 dark:text-purple-200">
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
    </View>
  );
}

/**
 * Pro badge indicator
 */
const ProBadge = React.memo(function ProBadge() {
  const { t } = useTranslation();

  return (
    <View
      className="absolute right-4 top-4 rounded-full bg-white/40 px-3 py-1.5 backdrop-blur-sm"
      accessibilityLabel={t('result.accessibility.pro_badge')}
      accessibilityRole="text"
    >
      <Text className="text-xs font-bold text-white drop-shadow-md">
        {t('common.pro')}
      </Text>
    </View>
  );
});
