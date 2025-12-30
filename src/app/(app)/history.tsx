import { useRouter } from 'expo-router';
import { useColorScheme } from 'nativewind';
import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import {
  Button,
  colors,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { History as HistoryIcon } from '@/components/ui/icons';
import { HistoryItem } from '@/features/history/components/history-item';
import { useAnalysisStore } from '@/stores/analysis-store';

const MAX_HISTORY_ITEMS = 10;

export default function HistoryIndex() {
  const { t } = useTranslation();
  const router = useRouter();
  const { history, checkAndResetDaily } = useAnalysisStore();
  const { colorScheme } = useColorScheme();

  const iconColor =
    colorScheme === 'dark' ? colors.neutral[400] : colors.neutral[500];

  useEffect(() => checkAndResetDaily(), [checkAndResetDaily]);

  return (
    <View className="flex-1 ">
      <FocusAwareStatusBar />
      {history.length === 0 ? (
        <View
          className="flex-1 items-center justify-center bg-neutral-50 px-4 dark:bg-neutral-900"
          accessibilityLabel={t('history.empty_title')}
        >
          <View className="mb-4 items-center justify-center rounded-full bg-neutral-200 p-6 dark:bg-neutral-800">
            <HistoryIcon color={iconColor} width={48} height={48} />
          </View>
          <Text className="mb-2 text-xl font-bold text-neutral-800 dark:text-neutral-200">
            {t('history.empty_title')}
          </Text>
          <Text className="mb-6 text-center text-sm text-neutral-500 dark:text-neutral-400">
            {t('history.empty_message')}
          </Text>
          <Button
            label={t('home.analyze_button_camera')}
            onPress={() => router.push('/(app)/home')}
            size="lg"
            testID="start-analysis-button"
          />
        </View>
      ) : (
        <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
          <View className="px-4 py-6">
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
