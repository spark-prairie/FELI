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

interface Props {
  emotion: EmotionConfidence;
}

/**
 * SecondaryEmotionCard Component
 * Displays secondary emotion with percentage (Pro feature)
 */
export function SecondaryEmotionCard({ emotion }: Props) {
  const emoji = EMOTION_EMOJI[emotion.type];
  const emotionName = emotion.type.replace('_', ' ');

  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-neutral-800 dark:text-neutral-100">
        Secondary Emotion
      </Text>
      <View className="flex-row items-center rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 p-4 dark:from-purple-950 dark:to-indigo-950">
        <Text className="mr-3 text-3xl">{emoji}</Text>
        <View className="flex-1">
          <Text className="mb-1 text-base font-semibold capitalize text-neutral-800 dark:text-neutral-100">
            {emotionName}
          </Text>
          <Text className="text-sm text-purple-600 dark:text-purple-400">
            {emotion.confidence_percentage}% confidence
          </Text>
        </View>
      </View>
      <Text className="mt-2 text-xs italic text-neutral-500 dark:text-neutral-400">
        Your cat may also be showing signs of this emotion
      </Text>
    </View>
  );
}
