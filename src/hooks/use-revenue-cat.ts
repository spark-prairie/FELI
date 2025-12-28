import { useCallback, useEffect, useState } from 'react';
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';

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

// ---------- SDK Initialization ----------
function useConfigureRevenueCat(apiKey: string): [boolean, string | null] {
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const configure = async () => {
      try {
        if (__DEV__) Purchases.setLogLevel(LOG_LEVEL.DEBUG);
        await Purchases.configure({ apiKey });
        setIsConfigured(true);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : 'SDK configuration failed'
        );
      }
    };
    configure();
  }, [apiKey]);

  return [isConfigured, error];
}

// ---------- Customer Info ----------
function useCustomerInfo(syncProStatus: (isPro: boolean, timestamp?: number) => void) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerInfo = useCallback(async () => {
    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      const isPro = info.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;
      syncProStatus(isPro, Date.now());
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch customer info'
      );
    }
  }, [syncProStatus]);

  return { customerInfo, fetchCustomerInfo, error };
}

// ---------- Offerings ----------
function useOfferings() {
  const [offerings, setOfferings] = useState<PurchasesOfferings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOfferings = useCallback(async () => {
    setIsLoading(true);
    try {
      const o = await Purchases.getOfferings();
      setOfferings(o);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to fetch offerings'
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { offerings, fetchOfferings, isLoading, error };
}

// ---------- Purchase/Restore ----------
async function handlePurchase(
  pkg: PurchasesPackage,
  syncProStatus: (isPro: boolean, timestamp?: number) => void
): Promise<boolean> {
  try {
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const hasPro =
      customerInfo.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;
    syncProStatus(hasPro, Date.now());
    return hasPro;
  } catch (err) {
    if (err instanceof Error && !err.message.includes('user cancelled')) {
      console.error(err.message);
    }
    return false;
  }
}

async function handleRestore(
  syncProStatus: (isPro: boolean, timestamp?: number) => void
): Promise<boolean> {
  try {
    const restored = await Purchases.restorePurchases();
    const hasPro =
      restored.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;
    syncProStatus(hasPro, Date.now());
    return hasPro;
  } catch (err) {
    console.error(err instanceof Error ? err.message : 'Restore failed');
    return false;
  }
}

// ---------- Main Hook ----------
export function useRevenueCat(): UseRevenueCatReturn {
  const syncProStatus = useAnalysisStore((s) => s.syncProStatus);

  const [isConfigured, configError] = useConfigureRevenueCat(
    REVENUE_CAT_CONFIG.apiKey
  );
  const { customerInfo, fetchCustomerInfo } = useCustomerInfo(syncProStatus);
  const { offerings, fetchOfferings, isLoading } = useOfferings();

  useEffect(() => {
    const init = async () => {
      if (!isConfigured) return;
      await fetchCustomerInfo();
      await fetchOfferings();
    };
    init();
  }, [isConfigured, fetchCustomerInfo, fetchOfferings]);

  return {
    isConfigured,
    isLoading,
    customerInfo,
    offerings,
    isPro:
      customerInfo?.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !==
      undefined,
    purchasePackage: useCallback(
      (pkg: PurchasesPackage) => handlePurchase(pkg, syncProStatus),
      [syncProStatus]
    ),
    restorePurchases: useCallback(
      () => handleRestore(syncProStatus),
      [syncProStatus]
    ),
    error: configError,
  };
}
