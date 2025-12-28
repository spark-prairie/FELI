import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { Modal, Pressable } from 'react-native';

import { Button, Text, View } from '@/components/ui';
import { useRevenueCat } from '@/hooks/use-revenue-cat';

import { RevenueCatPaywall } from './revenue-cat-paywall';

interface SubscriptionGateProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
  mode?: 'modal' | 'navigate';
}

export function SubscriptionGate({
  children,
  fallback,
  mode = 'modal',
}: SubscriptionGateProps) {
  const router = useRouter();
  const { isPro } = useRevenueCat();
  const [showModal, setShowModal] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);

  // Pro users see content directly
  if (isPro) return <>{children}</>;

  // Navigate mode: click navigates to /paywall
  if (mode === 'navigate') {
    return (
      <Pressable
        onPress={() => router.push('/paywall')}
        testID="subscription-gate-locked"
        accessibilityLabel="Unlock Pro features"
        accessibilityHint="Navigate to subscription page"
      >
        {fallback || <DefaultLockedState />}
      </Pressable>
    );
  }

  return (
    <>
      <Pressable
        onPress={() => setShowModal(true)}
        testID="subscription-gate-locked"
        accessibilityLabel="Unlock Pro features"
        accessibilityHint="Open subscription modal"
      >
        {fallback || <DefaultLockedState />}
      </Pressable>

      <SubscriptionModal
        visible={showModal}
        onClose={() => setShowModal(false)}
        onSubscribe={() => {
          setShowModal(false);
          setShowPaywall(true);
        }}
      />

      <RevenueCatPaywall
        visible={showPaywall}
        onClose={() => setShowPaywall(false)}
        onSuccess={() => setShowPaywall(false)}
      />
    </>
  );
}

/** Modal 内容 */
interface SubscriptionModalProps {
  visible: boolean;
  onClose: () => void;
  onSubscribe: () => void;
}
function SubscriptionModal({
  visible,
  onClose,
  onSubscribe,
}: SubscriptionModalProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 justify-end bg-black/50">
        <View className="rounded-t-3xl bg-white p-6 dark:bg-neutral-900">
          <ModalHeader />
          <ModalBenefits />
          <ModalActions onSubscribe={onSubscribe} onClose={onClose} />
        </View>
      </View>
    </Modal>
  );
}

/** Modal Header */
function ModalHeader() {
  return (
    <View className="mb-6 items-center">
      <Text className="mb-2 text-2xl">⭐</Text>
      <Text className="mb-2 text-center text-xl font-bold text-neutral-800 dark:text-neutral-100">
        Pro Feature Locked
      </Text>
      <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
        Upgrade to Pro for unlimited analyses and deeper insights
      </Text>
    </View>
  );
}

/** Modal Benefits */
function ModalBenefits() {
  const benefits = [
    { icon: '📊', text: 'Exact confidence percentages' },
    { icon: '🔍', text: 'Secondary emotion insights' },
    { icon: '🚀', text: 'Unlimited daily analyses' },
  ];

  return (
    <View className="mb-6 gap-3">
      {benefits.map((b) => (
        <QuickBenefit key={b.text} {...b} />
      ))}
    </View>
  );
}

/** Modal Actions */
interface ModalActionsProps {
  onSubscribe: () => void;
  onClose: () => void;
}
function ModalActions({ onSubscribe, onClose }: ModalActionsProps) {
  return (
    <View className="gap-3">
      <Button
        label="Unlock Pro"
        onPress={onSubscribe}
        size="lg"
        testID="modal-subscribe-button"
      />
      <Button
        label="Not Now"
        onPress={onClose}
        variant="outline"
        size="lg"
        testID="modal-close-button"
      />
    </View>
  );
}

/** 默认锁定状态 */
function DefaultLockedState() {
  return (
    <View className="rounded-xl bg-neutral-100 p-6 dark:bg-neutral-800">
      <View className="items-center">
        <Text className="mb-2 text-4xl">🔒</Text>
        <Text className="mb-1 text-center text-base font-semibold text-neutral-800 dark:text-neutral-100">
          Pro Feature
        </Text>
        <Text className="text-center text-sm text-neutral-600 dark:text-neutral-400">
          Tap to unlock
        </Text>
      </View>
    </View>
  );
}

/** 单行 Quick Benefit */
interface QuickBenefitProps {
  icon: string;
  text: string;
}
function QuickBenefit({ icon, text }: QuickBenefitProps) {
  return (
    <View className="flex-row items-center">
      <Text className="mr-3 text-xl">{icon}</Text>
      <Text className="text-sm text-neutral-700 dark:text-neutral-300">
        {text}
      </Text>
    </View>
  );
}
