import RevenueCatUI from 'react-native-purchases-ui';
import React, { useEffect } from 'react';

interface RevenueCatPaywallProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * RevenueCat Paywall Modal Component
 * Displays subscription offerings using RevenueCatUI.presentPaywall()
 */
export function RevenueCatPaywall({
  visible,
  onClose,
  onSuccess,
}: RevenueCatPaywallProps) {
  useEffect(() => {
    if (visible) {
      presentPaywall();
    }
  }, [visible]);

  const presentPaywall = async () => {
    try {
      const result = await RevenueCatUI.presentPaywall();

      if (result === RevenueCatUI.PAYWALL_RESULT.PURCHASED) {
        onSuccess?.();
        onClose();
      } else if (result === RevenueCatUI.PAYWALL_RESULT.CANCELLED) {
        onClose();
      } else if (result === RevenueCatUI.PAYWALL_RESULT.RESTORED) {
        onSuccess?.();
        onClose();
      }
    } catch (error) {
      console.error('[Paywall] Error presenting paywall:', error);
      onClose();
    }
  };

  return null;
}
