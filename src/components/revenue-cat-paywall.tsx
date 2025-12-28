import { useEffect } from 'react';
import { Alert } from 'react-native';
import RevenueCatUI from 'react-native-purchases-ui';

import { REVENUE_CAT_CONFIG } from '@/config/revenue-cat';
import { useAnalysisStore } from '@/stores/analysis-store';

interface RevenueCatPaywallProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

/**
 * RevenueCat Paywall Modal Component
 * In production: Displays subscription offerings using RevenueCatUI.presentPaywall()
 * In mock mode: Shows Alert to simulate purchase
 */
export function RevenueCatPaywall({
  visible,
  onClose,
  onSuccess,
}: RevenueCatPaywallProps) {
  const syncProStatus = useAnalysisStore((s) => s.syncProStatus);

  useEffect(() => {
    if (visible) {
      if (REVENUE_CAT_CONFIG.USE_MOCK) {
        presentMockPaywall();
      } else {
        presentPaywall();
      }
    }
  }, [visible]); // eslint-disable-line react-hooks/exhaustive-deps

  const presentMockPaywall = () => {
    Alert.alert(
      '🧪 Mock Purchase',
      'Simulate a successful purchase?\n\n(This is mock mode - no real purchase will be made)',
      [
        {
          text: 'Cancel',
          style: 'cancel',
          onPress: () => {
            console.log('[RevenueCat Mock] Purchase cancelled');
            onClose();
          },
        },
        {
          text: 'Simulate Success',
          onPress: async () => {
            console.log('[RevenueCat Mock] Simulating purchase...');
            // Simulate delay
            await new Promise((resolve) => setTimeout(resolve, 500));
            syncProStatus(true, Date.now());
            console.log('[RevenueCat Mock] Purchase successful');
            onSuccess?.();
            onClose();
          },
        },
      ]
    );
  };

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
