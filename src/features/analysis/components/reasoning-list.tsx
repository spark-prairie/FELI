import React from 'react';

import { Text, View } from '@/components/ui';

interface Props {
  items: string[];
  limit?: number;
  isPro?: boolean;
}

/**
 * ReasoningList Component
 * Displays behavioral observations
 * Free users see limited items (default 3), Pro users see all
 */
export function ReasoningList({ items, limit, isPro = false }: Props) {
  const maxItems = limit ?? (isPro ? items.length : 3);
  const displayItems = items.slice(0, maxItems);
  const hasMoreItems = items.length > maxItems;

  return (
    <View className="mb-6">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-base font-semibold text-neutral-800 dark:text-neutral-100">
          What we observed
        </Text>
        {isPro && (
          <Text className="text-xs font-medium text-purple-600 dark:text-purple-400">
            {items.length} insight{items.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>
      <View className="rounded-xl bg-white p-4 dark:bg-neutral-800">
        {displayItems.map((item, index) => (
          <ReasoningItem
            key={index}
            text={item}
            isLast={index === displayItems.length - 1}
          />
        ))}
        {hasMoreItems && !isPro && (
          <View className="mt-2 rounded-lg bg-purple-50 p-3 dark:bg-purple-950">
            <Text className="text-xs text-purple-800 dark:text-purple-200">
              {items.length - maxItems} more insight
              {items.length - maxItems !== 1 ? 's' : ''} available with Pro
            </Text>
          </View>
        )}
      </View>
      <Text className="mt-2 text-xs italic text-neutral-500 dark:text-neutral-400">
        These are visual cues, not certainties
      </Text>
    </View>
  );
}

/**
 * Individual reasoning item
 */
interface ReasoningItemProps {
  text: string;
  isLast: boolean;
}

function ReasoningItem({ text, isLast }: ReasoningItemProps) {
  return (
    <View className={`flex-row ${!isLast ? 'mb-3' : ''}`}>
      <Text className="mr-2 text-sm text-neutral-500 dark:text-neutral-400">
        •
      </Text>
      <Text className="flex-1 text-sm leading-5 text-neutral-700 dark:text-neutral-300">
        {text}
      </Text>
    </View>
  );
}
