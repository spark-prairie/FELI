import { Stack, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert } from 'react-native';

import { RevenueCatPaywall } from '@/components/revenue-cat-paywall';
import {
  Button,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { useRevenueCat } from '@/hooks/use-revenue-cat';
import { translate } from '@/lib';

// eslint-disable-next-line max-lines-per-function
export default function Paywall() {
  const router = useRouter();
  const {
    isPro,
    offerings,
    isLoading,
    isPurchasing,
    isRestoring,
    restorePurchases,
  } = useRevenueCat();
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  const handleSubscribe = () => {
    setShowPaywallModal(true);
  };

  const handleMaybeLater = () => {
    router.back();
  };

  const handlePurchaseSuccess = () => {
    router.back();
  };

  const handleRestore = async () => {
    const result = await restorePurchases();

    if (result.success && result.restored) {
      Alert.alert(
        translate('paywall.restore_success_title'),
        translate('paywall.restore_success_message')
      );
      router.back();
    } else if (result.success && !result.restored) {
      Alert.alert(
        translate('paywall.restore_nothing_title'),
        translate('paywall.restore_nothing_message')
      );
    } else if (result.error) {
      Alert.alert(
        translate('paywall.restore_error_title'),
        result.error || translate('paywall.restore_error_message')
      );
    }
  };

  // Redirect if already Pro (moved to useEffect to avoid navigation during render)
  useEffect(() => {
    if (isPro) {
      router.back();
    }
  }, [isPro, router]);

  return (
    <>
      <Stack.Screen options={{ title: 'Upgrade to Pro', headerShown: true }} />
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <View className="px-4 py-6">
          {/* Hero Section */}
          <View className="mb-8 items-center">
            <Text className="mb-4 text-center text-4xl">⭐</Text>
            <Text className="mb-2 text-center text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              {translate('paywall.title')}
            </Text>
            <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
              Get deeper insights into your cat&apos;s emotional state
            </Text>
          </View>

          {/* Pro Benefits */}
          <View className="mb-8 gap-4">
            <BenefitItem
              icon="📊"
              title="Confidence Percentages"
              description="See exact confidence scores (e.g., 72%) instead of general levels"
            />
            <BenefitItem
              icon="🔍"
              title="Secondary Emotion Insights"
              description="Understand nuanced emotional states with secondary emotion analysis"
            />
            <BenefitItem
              icon="💡"
              title="Full Reasoning Details"
              description="Access complete behavioral cue analysis (up to 6 observations)"
            />
            <BenefitItem
              icon="🚀"
              title="Unlimited Daily Analyses"
              description="No daily limits—analyze as many photos as you need"
            />
            <BenefitItem
              icon="📝"
              title="Extended Suggestions"
              description="Get up to 4 actionable recommendations per analysis"
            />
          </View>

          {/* Pricing Information (if available) */}
          {!isLoading && offerings?.current?.availablePackages.length ? (
            <View className="mb-6 rounded-xl bg-white p-4 dark:bg-neutral-800">
              <Text className="mb-3 text-center text-sm font-semibold text-neutral-700 dark:text-neutral-300">
                {translate('paywall.subscription_plans')}
              </Text>
              {offerings.current.availablePackages.map((pkg) => (
                <View
                  key={pkg.identifier}
                  className="mb-2 flex-row items-center justify-between border-b border-neutral-200 pb-2 last:border-b-0 last:pb-0 dark:border-neutral-700"
                >
                  <Text className="text-sm text-neutral-600 dark:text-neutral-400">
                    {getPackageDisplayName(pkg.packageType)}
                  </Text>
                  <Text className="text-base font-semibold text-purple-600 dark:text-purple-400">
                    {pkg.product.priceString}
                  </Text>
                </View>
              ))}
            </View>
          ) : isLoading ? (
            <View className="mb-6 items-center py-4">
              <ActivityIndicator />
              <Text className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">
                {translate('paywall.loading_plans')}
              </Text>
            </View>
          ) : null}

          {/* CTA Buttons */}
          <View className="gap-3">
            <Button
              label={translate('paywall.subscribe_button')}
              onPress={handleSubscribe}
              size="lg"
              loading={isPurchasing}
              disabled={isPurchasing || isRestoring}
              testID="subscribe-button"
            />
            <Button
              label={translate('paywall.restore_button')}
              onPress={handleRestore}
              variant="outline"
              size="lg"
              loading={isRestoring}
              disabled={isPurchasing || isRestoring}
              testID="restore-button"
            />
            <Button
              label={translate('paywall.maybe_later')}
              onPress={handleMaybeLater}
              variant="ghost"
              size="lg"
              disabled={isPurchasing || isRestoring}
              testID="maybe-later-button"
            />
          </View>

          {/* Terms */}
          <Text className="mt-6 text-center text-xs text-neutral-500 dark:text-neutral-400">
            {translate('paywall.terms_and_privacy')}
          </Text>
        </View>
      </ScrollView>

      {/* RevenueCat Paywall Modal */}
      <RevenueCatPaywall
        visible={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onSuccess={handlePurchaseSuccess}
      />

      {/* Loading Overlay */}
      {(isPurchasing || isRestoring) && (
        <View className="absolute inset-0 items-center justify-center bg-black/50">
          <View className="rounded-2xl bg-white p-8 dark:bg-neutral-800">
            <ActivityIndicator size="large" />
            <Text className="mt-4 text-center text-base font-semibold text-neutral-800 dark:text-neutral-100">
              {isPurchasing
                ? translate('paywall.processing_purchase')
                : translate('paywall.processing_restore')}
            </Text>
          </View>
        </View>
      )}
    </>
  );
}

interface BenefitItemProps {
  icon: string;
  title: string;
  description: string;
}

function BenefitItem({ icon, title, description }: BenefitItemProps) {
  return (
    <View className="flex-row rounded-xl bg-white p-4 dark:bg-neutral-800">
      <Text className="mr-4 text-3xl">{icon}</Text>
      <View className="flex-1">
        <Text className="mb-1 text-base font-semibold text-neutral-800 dark:text-neutral-100">
          {title}
        </Text>
        <Text className="text-sm text-neutral-600 dark:text-neutral-400">
          {description}
        </Text>
      </View>
    </View>
  );
}

// Helper to get user-friendly package name
function getPackageDisplayName(packageType: string): string {
  switch (packageType) {
    case 'MONTHLY':
      return translate('paywall.plan_monthly');
    case 'ANNUAL':
      return translate('paywall.plan_annual');
    case 'WEEKLY':
      return translate('paywall.plan_weekly');
    case 'LIFETIME':
      return translate('paywall.plan_lifetime');
    default:
      return packageType;
  }
}
