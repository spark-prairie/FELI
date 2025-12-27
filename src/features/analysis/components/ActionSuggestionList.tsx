import React from 'react';

import { Text, View } from '@/components/ui';

interface Props {
  items: string[];
}

export function ActionSuggestionList({ items }: Props) {
  const displayItems = items.slice(0, 2);

  return (
    <View className="mb-6">
      <Text className="mb-3 text-base font-semibold text-neutral-800 dark:text-neutral-100">
        What you can do now
      </Text>
      <View className="gap-3">
        {displayItems.map((item, index) => (
          <View
            key={index}
            className="rounded-xl bg-blue-50 p-4 dark:bg-blue-950"
          >
            <Text className="text-sm font-medium leading-5 text-blue-900 dark:text-blue-100">
              {item}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
