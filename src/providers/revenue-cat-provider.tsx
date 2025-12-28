import React, { useEffect, useState } from 'react';
import Purchases, { LOG_LEVEL } from 'react-native-purchases';

import { REVENUE_CAT_CONFIG } from '@/config/revenue-cat';

interface RevenueCatProviderProps {
  children: React.ReactNode;
}

/**
 * RevenueCat Provider Component
 * Initializes the RevenueCat SDK when the app starts
 * Wraps the app to ensure SDK is configured before any purchases
 */
export function RevenueCatProvider({ children }: RevenueCatProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  console.log('[RevenueCat] Initializing...', isInitialized);
  useEffect(() => {
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

        setIsInitialized(true);
      } catch (error) {
        console.error('[RevenueCat] Initialization failed:', error);
        // Still render children even if initialization fails
        setIsInitialized(true);
      }
    };

    initializeRevenueCat();
  }, []);

  // Render children immediately (non-blocking initialization)
  // RevenueCat will queue operations until SDK is ready
  return <>{children}</>;
}
