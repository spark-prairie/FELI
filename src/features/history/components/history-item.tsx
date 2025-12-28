import React from 'react';

import { FocusAwareStatusBar, Pressable, Text, View } from '@/components/ui';
import type { CatEmotion, StoredEmotionResult } from '@/types/emotion';
import { Stack } from 'expo-router';

const EMOTION_EMOJI: Record<CatEmotion, string> = {
  relaxed: '😌',
  alert: '👀',
  anxious: '😰',
  irritated: '😾',
  possible_discomfort: '😿',
};

interface HistoryItemProps {
  result: StoredEmotionResult;
  onPress?: () => void;
}

export function HistoryItem({ result, onPress }: HistoryItemProps) {
  const { primary_emotion, meta } = result;
  const emoji = EMOTION_EMOJI[primary_emotion.type];
  const emotionName = primary_emotion.type.replace('_', ' ');

  const createdAt = new Date(result.created_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <View className="flex-1 justify-center  p-3">
      <FocusAwareStatusBar />

      <Pressable
        onPress={onPress}
        className="mb-3 flex-row items-center rounded-xl bg-white p-4 dark:bg-neutral-800"
      >
        <Text className="mr-4 text-3xl">{emoji}</Text>
        <View className="flex-1">
          <Text className="mb-1 text-base font-semibold capitalize text-neutral-800 dark:text-neutral-200">
            {emotionName}
          </Text>
          <Text className="text-xs text-neutral-500 dark:text-neutral-400">
            {createdAt}
          </Text>
        </View>
      </Pressable>
    </View>
  );
}
