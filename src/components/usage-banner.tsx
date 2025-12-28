import { useRouter } from 'expo-router';
import React from 'react';

import { Button, Text, View } from '@/components/ui';
import { DAILY_LIMIT_FREE, useAnalysisStore } from '@/stores/analysis-store';

export function UsageBanner() {
  const router = useRouter();
  const isPro = useAnalysisStore((state) => state.isPro);
  const dailyUsageCount = useAnalysisStore((state) => state.dailyUsageCount);

  const isLimitReached = !isPro && dailyUsageCount >= DAILY_LIMIT_FREE;

  if (isPro) {
    return (
      <View className="mb-6 rounded-xl bg-purple-50 p-4 dark:bg-purple-950">
        <Text className="text-center text-sm font-semibold text-purple-800 dark:text-purple-200">
          ⭐ Pro · Unlimited analyses
        </Text>
      </View>
    );
  }

  if (isLimitReached) {
    return (
      <View className="mb-6 rounded-xl bg-amber-50 p-4 dark:bg-amber-950">
        <Text className="mb-3 text-center text-sm font-semibold text-amber-800 dark:text-amber-200">
          Daily limit reached · Upgrade to Pro
        </Text>
        <Button
          label="Upgrade to Pro"
          onPress={() => router.push('/paywall')}
          size="sm"
          variant="outline"
        />
      </View>
    );
  }

  return (
    <View className="mb-6 rounded-xl bg-neutral-100 p-4 dark:bg-neutral-800">
      <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        Today {dailyUsageCount} / {DAILY_LIMIT_FREE} analyses used
      </Text>
    </View>
  );
}
