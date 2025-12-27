import React from 'react';

import { Text, View } from '@/components/ui';

interface Props {
  items: string[];
}

export function ReasoningList({ items }: Props) {
  const displayItems = items.slice(0, 3);

  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-neutral-800 dark:text-neutral-100">
        What we observed
      </Text>
      <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        {displayItems.map((item, index) => (
          <View key={index} className="mb-3 flex-row">
            <Text className="mr-2 text-sm text-neutral-500 dark:text-neutral-400">
              •
            </Text>
            <Text className="flex-1 text-sm leading-5 text-neutral-700 dark:text-neutral-300">
              {item}
            </Text>
          </View>
        ))}
      </View>
      <Text className="mt-2 text-xs italic text-neutral-500 dark:text-neutral-400">
        These are visual cues, not certainties
      </Text>
    </View>
  );
}
