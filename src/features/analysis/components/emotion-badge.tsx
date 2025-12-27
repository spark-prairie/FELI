import React from 'react';

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
}

export function EmotionBadge({ emotion, confidenceNote }: Props) {
  const emoji = EMOTION_EMOJI[emotion.type];
  const emotionName = emotion.type.replace('_', ' ');
  const colorClass = confidenceNote ? CONFIDENCE_COLORS[confidenceNote] : '';

  return (
    <View className="mb-6 items-center rounded-2xl bg-white p-6 dark:bg-neutral-800">
      <Text className="mb-3 text-6xl">{emoji}</Text>
      <Text className="mb-2 text-center text-2xl font-bold capitalize text-neutral-800 dark:text-neutral-100">
        {emotionName}
      </Text>
      {confidenceNote && (
        <Text className={`text-center text-sm font-medium capitalize ${colorClass}`}>
          {confidenceNote} confidence
        </Text>
      )}
    </View>
  );
}
