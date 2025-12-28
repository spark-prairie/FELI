import React from 'react';

import { Button, ScrollView, Text, View } from '@/components/ui';
import { useAnalysisStore } from '@/stores/analysis-store';
import type { EmotionResult } from '@/types/emotion';

const mockResult: EmotionResult = {
  primary_emotion: { type: 'relaxed', confidence_percentage: 85 },
  secondary_emotion: { type: 'alert', confidence_percentage: 60 },
  reasoning: [
    'Ears are in a neutral position',
    'Eyes are half-closed showing contentment',
    'Whiskers are relaxed',
  ],
  suggestions: [
    'Continue providing a calm environment',
    'Maintain regular feeding schedule',
  ],
  confidence_note: 'high',
  disclaimer: 'This is a test result for debugging purposes',
  meta: { visibility: 'clear', face_coverage: 0.95 },
};

// Small reusable subcomponents
const CurrentState = () => {
  const {
    currentImageUri,
    isAnalyzing,
    currentResult,
    history,
    isPro,
    dailyUsageCount,
    lastResetDate,
  } = useAnalysisStore();
  return (
    <View className="mb-6 rounded-lg bg-neutral-100 p-4 dark:bg-neutral-800">
      <Text className="mb-2 text-lg font-semibold">Current State</Text>
      <Text className="text-sm">Image URI: {currentImageUri || 'null'}</Text>
      <Text className="text-sm">Analyzing: {String(isAnalyzing)}</Text>
      <Text className="text-sm">
        Current Result: {currentResult?.primary_emotion.type || 'null'}
      </Text>
      <Text className="text-sm">History Count: {history.length}</Text>
      <Text className="text-sm">Pro Status: {String(isPro)}</Text>
      <Text className="text-sm">Daily Usage: {dailyUsageCount}</Text>
      <Text className="text-sm">Last Reset: {lastResetDate || 'null'}</Text>
    </View>
  );
};

const ImageActions = () => {
  const { setImageUri } = useAnalysisStore();
  return (
    <View className="mb-6">
      <Text className="mb-2 text-lg font-semibold">Image URI</Text>
      <View className="gap-2">
        <Button
          label="Set Mock Image URI"
          onPress={() => setImageUri('file:///mock/path/to/cat-image.jpg')}
        />
        <Button label="Clear Image URI" onPress={() => setImageUri(null)} />
      </View>
    </View>
  );
};

const AnalysisActions = () => {
  const { setAnalyzing, saveResult, clearCurrentResult } = useAnalysisStore();
  return (
    <View className="mb-6">
      <Text className="mb-2 text-lg font-semibold">Analysis</Text>
      <View className="gap-2">
        <Button label="Start Analyzing" onPress={() => setAnalyzing(true)} />
        <Button label="Stop Analyzing" onPress={() => setAnalyzing(false)} />
        <Button
          label="Save Mock Result"
          onPress={() => saveResult(mockResult)}
        />
        <Button label="Clear Current Result" onPress={clearCurrentResult} />
      </View>
    </View>
  );
};

const UsageActions = () => {
  const { isPro, setPro, incrementUsage, resetDailyUsage, checkAndResetDaily } =
    useAnalysisStore();
  return (
    <View className="mb-6">
      <Text className="mb-2 text-lg font-semibold">Usage & Pro</Text>
      <View className="gap-2">
        <Button label="Toggle Pro Status" onPress={() => setPro(!isPro)} />
        <Button label="Increment Usage" onPress={incrementUsage} />
        <Button label="Reset Daily Usage" onPress={resetDailyUsage} />
        <Button label="Check & Reset Daily" onPress={checkAndResetDaily} />
      </View>
    </View>
  );
};

const HistoryActions = () => {
  const { saveResult, clearHistory } = useAnalysisStore();
  return (
    <View className="mb-6">
      <Text className="mb-2 text-lg font-semibold">History</Text>
      <View className="gap-2">
        <Button
          label="Add 5 Mock Results"
          onPress={() => {
            for (let i = 0; i < 5; i++) saveResult(mockResult);
          }}
        />
        <Button label="Clear History" onPress={clearHistory} />
      </View>
    </View>
  );
};

const DangerZone = () => {
  const { reset } = useAnalysisStore();
  return (
    <View className="mb-6">
      <Text className="mb-2 text-lg font-semibold">Danger Zone</Text>
      <Button
        label="Reset Entire Store"
        onPress={reset}
        variant="destructive"
      />
    </View>
  );
};

export function StoreTester() {
  const { history } = useAnalysisStore();

  return (
    <ScrollView className="flex-1">
      <View className="p-4">
        <Text className="mb-4 text-2xl font-bold">Analysis Store Tester</Text>
        <CurrentState />
        <ImageActions />
        <AnalysisActions />
        <UsageActions />
        <HistoryActions />
        <DangerZone />

        {history.length > 0 && (
          <View className="mt-6">
            <Text className="mb-2 text-lg font-semibold">
              History ({history.length} items)
            </Text>
            {history.map((item, index) => (
              <View
                key={item.result_id}
                className="mb-2 rounded-lg bg-neutral-100 p-3 dark:bg-neutral-800"
              >
                <Text className="text-sm font-semibold">
                  #{index + 1} - {item.result_id}
                </Text>
                <Text className="text-xs">
                  Primary: {item.primary_emotion.type} (
                  {item.primary_emotion.confidence_percentage}%)
                </Text>
                <Text className="text-xs">
                  Created: {item.created_at.slice(0, 19)}
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}
