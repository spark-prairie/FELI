import { Stack, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

import { Button, FocusAwareStatusBar, Text, View } from '@/components/ui';
import { useRevenueCat } from '@/hooks/use-revenue-cat';

/**
 * Customer Center Page
 * Allows Pro users to manage their subscriptions
 * Uses RevenueCat's Customer Center for subscription management
 */
export default function CustomerCenterPage() {
  const router = useRouter();
  const { isPro, customerInfo, isLoading } = useRevenueCat();

  // Redirect non-Pro users
  if (!isLoading && !isPro) {
    router.replace('/paywall');
    return null;
  }

  if (isLoading) {
    return <LoadingState />;
  }

  const handleManageSubscription = async () => {
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (error) {
      console.error(
        '[CustomerCenter] Error presenting customer center:',
        error
      );
    }
  };

  return (
    <>
      <Stack.Screen
        options={{ title: 'Subscription Management', headerShown: true }}
      />
      <FocusAwareStatusBar />
      <View className="flex-1 bg-neutral-50 p-6 dark:bg-neutral-900">
        <SubscriptionInfo />

        <View className="mt-6">
          <Button
            label="Manage Subscription"
            onPress={handleManageSubscription}
            testID="manage-subscription-button"
          />
        </View>
      </View>
    </>
  );
}

/**
 * Loading state component
 */
function LoadingState() {
  return (
    <View className="flex-1 items-center justify-center bg-neutral-50 dark:bg-neutral-900">
      <ActivityIndicator size="large" />
      <Text className="mt-4 text-neutral-600 dark:text-neutral-400">
        Loading subscription info...
      </Text>
    </View>
  );
}

/**
 * Subscription information display
 */
function SubscriptionInfo() {
  const { customerInfo } = useRevenueCat();

  return (
    <View className="rounded-xl bg-white p-6 dark:bg-neutral-800">
      <View className="mb-4 items-center">
        <Text className="mb-2 text-3xl">⭐</Text>
        <Text className="text-xl font-bold text-neutral-800 dark:text-neutral-100">
          Pro Subscription Active
        </Text>
      </View>

      <View className="gap-3">
        <InfoRow label="Status" value="Active" />
        {customerInfo?.managementURL && (
          <InfoRow label="Management" value="Tap 'Manage Subscription' below" />
        )}
      </View>
    </View>
  );
}

/**
 * Info row component
 */
interface InfoRowProps {
  label: string;
  value: string;
}

function InfoRow({ label, value }: InfoRowProps) {
  return (
    <View className="flex-row justify-between">
      <Text className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
        {label}
      </Text>
      <Text className="text-sm text-neutral-800 dark:text-neutral-100">
        {value}
      </Text>
    </View>
  );
}
