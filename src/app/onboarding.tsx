import { useRouter } from 'expo-router';
import React from 'react';

import { Cover } from '@/components/cover';
import {
  Button,
  FocusAwareStatusBar,
  SafeAreaView,
  Text,
  View,
} from '@/components/ui';
import { useIsFirstTime } from '@/lib/hooks';
export default function Onboarding() {
  const [_, setIsFirstTime] = useIsFirstTime();
  const router = useRouter();
  return (
    <View className="flex h-full items-center  justify-center">
      <FocusAwareStatusBar />
      <View className="w-full flex-1">
        <Cover />
      </View>
      <View className="justify-end px-4">
        <Text className="my-3 text-center text-5xl font-bold text-neutral-800 dark:text-neutral-100">
          FELI
        </Text>
        <Text className="mb-2 text-center text-lg text-neutral-600 dark:text-neutral-400">
          Cat Emotion Lens
        </Text>

        <Text className="my-1 pt-6 text-left text-base text-neutral-700 dark:text-neutral-300">
          😺 AI-powered emotion analysis
        </Text>
        <Text className="my-1 text-left text-base text-neutral-700 dark:text-neutral-300">
          📊 Understand your cat&apos;s feelings
        </Text>
        <Text className="my-1 text-left text-base text-neutral-700 dark:text-neutral-300">
          💡 Get care suggestions
        </Text>
        <Text className="my-1 text-left text-base text-neutral-700 dark:text-neutral-300">
          📝 Track emotional history
        </Text>
      </View>
      <SafeAreaView className="mt-6 px-4">
        <Button
          label="Get Started"
          onPress={() => {
            setIsFirstTime(false);
            router.replace('/login');
          }}
          size="lg"
        />
      </SafeAreaView>
    </View>
  );
}
