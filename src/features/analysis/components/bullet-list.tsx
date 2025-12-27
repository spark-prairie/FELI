import React from 'react';

import { Text, View } from '@/components/ui';

type Props = {
  title: string;
  items: string[];
};

export function BulletList({ title, items }: Props) {
  return (
    <View className="mb-6">
      <Text className="mb-3 text-lg font-semibold text-neutral-800 dark:text-neutral-100">
        {title}
      </Text>
      <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        {items.map((item, index) => (
          <Text
            key={index}
            className="mb-2 text-sm text-neutral-700 dark:text-neutral-300"
          >
            • {item}
          </Text>
        ))}
      </View>
    </View>
  );
}
