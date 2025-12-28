import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';

import { RevenueCatPaywall } from '@/components/revenue-cat-paywall';
import {
  Button,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { useRevenueCat } from '@/hooks/use-revenue-cat';

export default function Paywall() {
  const router = useRouter();
  const { isPro } = useRevenueCat();
  const [showPaywallModal, setShowPaywallModal] = useState(false);

  // Redirect if already Pro
  if (isPro) {
    router.back();
    return null;
  }

  return (
    <>
      <Stack.Screen options={{ title: 'Upgrade to Pro', headerShown: true }} />
      <FocusAwareStatusBar />
      <ScrollView className="flex-1 bg-neutral-50 dark:bg-neutral-900">
        <View className="p-6">
          <PaywallHero />
          <PaywallBenefits />
          <PaywallActions
            onSubscribe={() => setShowPaywallModal(true)}
            onMaybeLater={() => router.back()}
          />
        </View>
      </ScrollView>

      <RevenueCatPaywall
        visible={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onSuccess={() => router.back()}
      />
    </>
  );
}

/** 子组件：Hero Section */
function PaywallHero() {
  return (
    <View className="mb-8 items-center">
      <Text className="mb-4 text-center text-4xl">⭐</Text>
      <Text className="mb-2 text-center text-2xl font-bold text-neutral-800 dark:text-neutral-100">
        Unlock Pro Features
      </Text>
      <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
        Get deeper insights into your cat{''}s emotional state
      </Text>
    </View>
  );
}

/** 子组件：Benefits 列表 */
function PaywallBenefits() {
  const benefits = [
    {
      icon: '📊',
      title: 'Confidence Percentages',
      description:
        'See exact confidence scores (e.g., 72%) instead of general levels',
    },
    {
      icon: '🔍',
      title: 'Secondary Emotion Insights',
      description:
        'Understand nuanced emotional states with secondary emotion analysis',
    },
    {
      icon: '💡',
      title: 'Full Reasoning Details',
      description:
        'Access complete behavioral cue analysis (up to 6 observations)',
    },
    {
      icon: '🚀',
      title: 'Unlimited Daily Analyses',
      description: 'No daily limits—analyze as many photos as you need',
    },
    {
      icon: '📝',
      title: 'Extended Suggestions',
      description: 'Get up to 4 actionable recommendations per analysis',
    },
  ];

  return (
    <View className="mb-8 gap-4">
      {benefits.map((b) => (
        <BenefitItem key={b.title} {...b} />
      ))}
    </View>
  );
}

/** 子组件：单个 Benefit */
function BenefitItem({
  icon,
  title,
  description,
}: {
  icon: string;
  title: string;
  description: string;
}) {
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

/** 子组件：CTA 按钮 */
function PaywallActions({
  onSubscribe,
  onMaybeLater,
}: {
  onSubscribe: () => void;
  onMaybeLater: () => void;
}) {
  return (
    <View className="gap-3">
      <Button
        label="Subscribe Now"
        onPress={onSubscribe}
        size="lg"
        testID="subscribe-button"
      />
      <Button
        label="Maybe Later"
        onPress={onMaybeLater}
        variant="outline"
        size="lg"
        testID="maybe-later-button"
      />
    </View>
  );
}
