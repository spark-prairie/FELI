import Purchases, {
  CustomerInfo,
  LOG_LEVEL,
  PurchasesOfferings,
  PurchasesPackage,
} from 'react-native-purchases';
import { useCallback, useEffect, useState } from 'react';

import { ENTITLEMENTS, REVENUE_CAT_CONFIG } from '@/config/revenue-cat';
import { useAnalysisStore } from '@/stores/analysis-store';

interface UseRevenueCatReturn {
  isConfigured: boolean;
  isLoading: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isPro: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<boolean>;
  restorePurchases: () => Promise<boolean>;
  error: string | null;
}

/**
 * Custom hook for RevenueCat subscription management
 * Handles SDK initialization, purchases, and entitlement checking
 */
export function useRevenueCat(): UseRevenueCatReturn {
  const [isConfigured, setIsConfigured] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [error, setError] = useState<string | null>(null);

  const setPro = useAnalysisStore((state) => state.setPro);

  // Check if user has Pro entitlement
  const isPro =
    customerInfo?.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;

  // Configure RevenueCat SDK
  const configureSDK = useCallback(async () => {
    try {
      if (__DEV__) {
        Purchases.setLogLevel(LOG_LEVEL.DEBUG);
      }

      Purchases.configure({
        apiKey: REVENUE_CAT_CONFIG.apiKey,
      });

      setIsConfigured(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'SDK configuration failed');
    }
  }, []);

  // Fetch customer info and update Pro status
  const fetchCustomerInfo = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);

      // Sync Pro status with Zustand store
      const hasProEntitlement =
        info.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;
      setPro(hasProEntitlement);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch customer info');
    }
  }, [setPro]);

  // Fetch available offerings
  const fetchOfferings = useCallback(async () => {
    try {
      setIsLoading(true);
      const availableOfferings = await Purchases.getOfferings();
      setOfferings(availableOfferings);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch offerings');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Initialize SDK and fetch data
  useEffect(() => {
    const initialize = async () => {
      await configureSDK();
      await fetchCustomerInfo();
      await fetchOfferings();
    };

    initialize();
  }, [configureSDK, fetchCustomerInfo, fetchOfferings]);

  // Purchase a package
  const purchasePackage = useCallback(
    async (pkg: PurchasesPackage): Promise<boolean> => {
      try {
        setIsLoading(true);
        setError(null);

        const { customerInfo: updatedInfo } = await Purchases.purchasePackage(pkg);
        setCustomerInfo(updatedInfo);

        const hasProEntitlement =
          updatedInfo.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;
        setPro(hasProEntitlement);

        return hasProEntitlement;
      } catch (err) {
        if (err instanceof Error && !err.message.includes('user cancelled')) {
          setError(err.message);
        }
        return false;
      } finally {
        setIsLoading(false);
      }
    },
    [setPro]
  );

  // Restore previous purchases
  const restorePurchases = useCallback(async (): Promise<boolean> => {
    try {
      setIsLoading(true);
      setError(null);

      const restoredInfo = await Purchases.restorePurchases();
      setCustomerInfo(restoredInfo);

      const hasProEntitlement =
        restoredInfo.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;
      setPro(hasProEntitlement);

      return hasProEntitlement;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to restore purchases');
      return false;
    } finally {
      setIsLoading(false);
    }
  }, [setPro]);

  return {
    isConfigured,
    isLoading,
    customerInfo,
    offerings,
    isPro,
    purchasePackage,
    restorePurchases,
    error,
  };
}
