import { Stack, useRouter } from 'expo-router';
import React, { useState } from 'react';

import {
  Button,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { RevenueCatPaywall } from '@/components/revenue-cat-paywall';
import { useRevenueCat } from '@/hooks/use-revenue-cat';

export default function Paywall() {
  const router = useRouter();
  const { isPro } = useRevenueCat();
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
          {/* Hero Section */}
          <View className="mb-8 items-center">
            <Text className="mb-4 text-center text-4xl">⭐</Text>
            <Text className="mb-2 text-center text-2xl font-bold text-neutral-800 dark:text-neutral-100">
              Unlock Pro Features
            </Text>
            <Text className="text-center text-base text-neutral-600 dark:text-neutral-400">
              Get deeper insights into your cat's emotional state
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

          {/* CTA Buttons */}
          <View className="gap-3">
            <Button
              label="Subscribe Now"
              onPress={handleSubscribe}
              size="lg"
              testID="subscribe-button"
            />
            <Button
              label="Maybe Later"
              onPress={handleMaybeLater}
              variant="outline"
              size="lg"
              testID="maybe-later-button"
            />
          </View>
        </View>
      </ScrollView>

      {/* RevenueCat Paywall Modal */}
      <RevenueCatPaywall
        visible={showPaywallModal}
        onClose={() => setShowPaywallModal(false)}
        onSuccess={handlePurchaseSuccess}
      />
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
