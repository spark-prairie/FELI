import React from 'react';

import { Text, View } from '@/components/ui';
import type { CatEmotion, EmotionConfidence } from '@/types/emotion';

const EMOTION_EMOJI: Record<CatEmotion, string> = {
  relaxed: '😌',
  alert: '👀',
  anxious: '😰',
  irritated: '😾',
  possible_discomfort: '😿',
};

type Props = {
  emotion: EmotionConfidence;
  confidenceNote?: string;
  variant?: 'primary' | 'secondary';
};

export function EmotionCard({ emotion, confidenceNote, variant = 'primary' }: Props) {
  if (variant === 'secondary') {
    return (
      <View className="mb-6 rounded-xl bg-white p-4 dark:bg-neutral-800">
        <Text className="mb-2 text-sm font-semibold text-neutral-600 dark:text-neutral-400">
          May also appear
        </Text>
        <Text className="text-lg capitalize text-neutral-800 dark:text-neutral-100">
          {EMOTION_EMOJI[emotion.type]} {emotion.type.replace('_', ' ')}
          {emotion.confidence_percentage
            ? ` (${emotion.confidence_percentage}%)`
            : ''}
        </Text>
      </View>
    );
  }

  return (
    <View className="mb-6 rounded-2xl bg-white p-6 dark:bg-neutral-800">
      <Text className="mb-3 text-center text-5xl">
        {EMOTION_EMOJI[emotion.type]}
      </Text>
      <Text className="mb-2 text-center text-2xl font-bold capitalize text-neutral-800 dark:text-neutral-100">
        {emotion.type.replace('_', ' ')}
      </Text>
      {emotion.confidence_percentage ? (
        <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          {emotion.confidence_percentage}% confidence
        </Text>
      ) : confidenceNote ? (
        <Text className="text-center text-sm capitalize text-neutral-600 dark:text-neutral-400">
          {confidenceNote} confidence
        </Text>
      ) : null}
    </View>
  );
}
