import { useRouter } from 'expo-router';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { FocusAwareStatusBar, ScrollView, Text, View } from '@/components/ui';
import { HistoryItem } from '@/features/history/components/history-item';
import { useAnalysisStore } from '@/stores/analysis-store';

const MAX_HISTORY_ITEMS = 10;

export default function HistoryIndex() {
  const { t } = useTranslation();
  const router = useRouter();
  const { history, checkAndResetDaily } = useAnalysisStore();

  useEffect(() => checkAndResetDaily(), [checkAndResetDaily]);

  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
      {history.length === 0 ? (
        <View
          className="flex-1 items-center justify-center bg-neutral-50 px-6 dark:bg-neutral-900"
          accessibilityLabel={t('history.empty_title')}
        >
          <Text
            className="mb-2 text-4xl"
            accessibilityLabel={t('history.empty_icon_accessibility')}
          >
            📋
          </Text>
          <Text className="mb-2 text-lg font-semibold text-neutral-800 dark:text-neutral-200">
            {t('history.empty_title')}
          </Text>
          <Text className="text-sm text-neutral-600 dark:text-neutral-400">
            {t('history.empty_message')}
          </Text>
        </View>
      ) : (
        <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
          <View className="p-6">
            <Text className="mb-4 text-sm text-neutral-600 dark:text-neutral-400">
              {t('history.recent_label', { max: MAX_HISTORY_ITEMS })}
            </Text>
            {history.map((result) => (
              <HistoryItem
                key={result.result_id}
                result={result}
                onPress={() => router.push(`/history/${result.result_id}`)}
              />
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}
