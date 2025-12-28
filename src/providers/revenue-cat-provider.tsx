import React, { useEffect, useState } from 'react';
import Purchases, { type CustomerInfo, LOG_LEVEL } from 'react-native-purchases';

import { ENTITLEMENTS, REVENUE_CAT_CONFIG } from '@/config/revenue-cat';
import { useAnalysisStore } from '@/stores/analysis-store';

interface RevenueCatProviderProps {
  children: React.ReactNode;
}

/**
 * RevenueCat Provider Component
 * Initializes the RevenueCat SDK when the app starts (unless in mock mode)
 * Wraps the app to ensure SDK is configured before any purchases
 */
export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const syncProStatus = useAnalysisStore((s) => s.syncProStatus);

  console.log(
    REVENUE_CAT_CONFIG.USE_MOCK
      ? '[RevenueCat] Mock mode enabled - skipping SDK initialization'
      : '[RevenueCat] Initializing...',
    isInitialized
  );

  useEffect(() => {
    // Skip initialization in mock mode
    if (REVENUE_CAT_CONFIG.USE_MOCK) {
      console.log('[RevenueCat] Mock mode active - no SDK calls will be made');
      setIsInitialized(true);
      return;
    }

    const initializeRevenueCat = async () => {
      try {
        // Enable debug logging in development
        if (__DEV__) {
          Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        }

        // Configure SDK with API key
        Purchases.configure({
          apiKey: REVENUE_CAT_CONFIG.apiKey,
        });

        // Add global listener for CustomerInfo updates
        const listener = (info: CustomerInfo) => {
          const isPro =
            info.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;
          syncProStatus(isPro, Date.now());
          console.log('[RevenueCat] CustomerInfo updated, isPro:', isPro);
        };

        Purchases.addCustomerInfoUpdateListener(listener);

        setIsInitialized(true);
      } catch (error) {
        console.error('[RevenueCat] Initialization failed:', error);
        // Still render children even if initialization fails
        setIsInitialized(true);
      }
    };

    initializeRevenueCat();

    // Cleanup listener on unmount
    return () => {
      if (!REVENUE_CAT_CONFIG.USE_MOCK) {
        Purchases.removeCustomerInfoUpdateListener(() => {});
      }
    };
  }, [syncProStatus]);

  // Render children immediately (non-blocking initialization)
  // RevenueCat will queue operations until SDK is ready
  return <>{children}</>;
}
