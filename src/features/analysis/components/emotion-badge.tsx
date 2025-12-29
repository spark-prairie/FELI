import React from 'react';
import { useTranslation } from 'react-i18next';

import { Text, View } from '@/components/ui';
import type {
  CatEmotion,
  ConfidenceNote,
  EmotionConfidence,
} from '@/types/emotion';

const EMOTION_EMOJI: Record<CatEmotion, string> = {
  relaxed: '😌',
  alert: '👀',
  anxious: '😰',
  irritated: '😾',
  possible_discomfort: '😿',
};

const CONFIDENCE_COLORS: Record<ConfidenceNote, string> = {
  low: 'text-amber-600 dark:text-amber-400',
  medium: 'text-blue-600 dark:text-blue-400',
  high: 'text-emerald-600 dark:text-emerald-400',
};

interface Props {
  emotion: EmotionConfidence;
  confidenceNote?: ConfidenceNote;
  showPercentage?: boolean;
  isPro?: boolean;
}

/**
 * EmotionBadge Component
 * Displays primary emotion with emoji and confidence indicator
 * Pro users see exact percentage, Free users see general level
 */
export function EmotionBadge({
  emotion,
  confidenceNote,
  showPercentage = false,
  isPro = false,
}: Props) {
  const { t } = useTranslation();
  const emoji = EMOTION_EMOJI[emotion.type];
  const emotionName = t(`emotions.${emotion.type}`);
  const colorClass = confidenceNote ? CONFIDENCE_COLORS[confidenceNote] : '';

  // Build accessibility label for screen readers
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
      className={`mb-6 items-center rounded-2xl bg-white p-6 dark:bg-neutral-800 ${
        isPro ? 'border-2 border-purple-200 dark:border-purple-800' : ''
      }`}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      {isPro && <ProBadge />}
      <Text className="mb-3 text-6xl">{emoji}</Text>
      <Text className="mb-2 text-center text-2xl font-bold capitalize text-neutral-800 dark:text-neutral-100">
        {emotionName}
      </Text>
      {showPercentage && emotion.confidence_percentage !== undefined ? (
        <Text className="text-center text-sm font-medium text-purple-600 dark:text-purple-400">
          {emotion.confidence_percentage}% confidence
        </Text>
      ) : confidenceNote ? (
        <Text
          className={`text-center text-sm font-medium capitalize ${colorClass}`}
        >
          {confidenceNote} confidence
        </Text>
      ) : null}
    </View>
  );
}

/**
 * Pro badge indicator
 */
function ProBadge() {
  const { t } = useTranslation();

  return (
    <View
      className="absolute right-3 top-3 rounded-full bg-gradient-to-r from-purple-500 to-indigo-600 px-3 py-1"
      accessibilityLabel={t('result.accessibility.pro_badge')}
      accessibilityRole="text"
    >
      <Text className="text-xs font-bold text-white">{t('common.pro')}</Text>
    </View>
  );
}
