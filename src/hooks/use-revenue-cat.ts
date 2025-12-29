import * as Haptics from 'expo-haptics';
import { useCallback, useEffect, useState } from 'react';
import Purchases, {
  type CustomerInfo,
  LOG_LEVEL,
  type PurchasesOfferings,
  type PurchasesPackage,
} from 'react-native-purchases';

import { ENTITLEMENTS, REVENUE_CAT_CONFIG } from '@/config/revenue-cat';
import { useAnalysisStore } from '@/stores/analysis-store';

// ---------- Types ----------
interface PurchaseResult {
  success: boolean;
  cancelled?: boolean;
  error?: string;
}

interface RestoreResult {
  success: boolean;
  restored: boolean;
  error?: string;
}

interface UseRevenueCatReturn {
  isConfigured: boolean;
  isLoading: boolean;
  isPurchasing: boolean;
  isRestoring: boolean;
  customerInfo: CustomerInfo | null;
  offerings: PurchasesOfferings | null;
  isPro: boolean;
  purchasePackage: (pkg: PurchasesPackage) => Promise<PurchaseResult>;
  restorePurchases: () => Promise<RestoreResult>;
  error: string | null;
}

// ---------- Mock Mode Helpers ----------
async function mockPurchase(
  syncProStatus: (isPro: boolean, timestamp?: number) => void
): Promise<PurchaseResult> {
  console.log('[RevenueCat Mock] Simulating purchase...');
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  syncProStatus(true, Date.now());
  console.log('[RevenueCat Mock] Purchase successful, isPro set to true');
  return { success: true };
}

async function mockRestore(
  syncProStatus: (isPro: boolean, timestamp?: number) => void
): Promise<RestoreResult> {
  console.log('[RevenueCat Mock] Simulating restore...');
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 1000));
  await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  syncProStatus(true, Date.now());
  console.log('[RevenueCat Mock] Restore successful, isPro set to true');
  return { success: true, restored: true };
}

// ---------- SDK Initialization ----------
function useConfigureRevenueCat(apiKey: string): [boolean, string | null] {
  const [isConfigured, setIsConfigured] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // In mock mode, skip SDK configuration
    if (REVENUE_CAT_CONFIG.USE_MOCK) {
      setIsConfigured(true);
      return;
    }

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
function useCustomerInfo(
  syncProStatus: (isPro: boolean, timestamp?: number) => void
) {
  const [customerInfo, setCustomerInfo] = useState<CustomerInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchCustomerInfo = useCallback(async () => {
    // Skip in mock mode
    if (REVENUE_CAT_CONFIG.USE_MOCK) {
      console.log('[RevenueCat Mock] Skipping CustomerInfo fetch');
      return;
    }

    try {
      const info = await Purchases.getCustomerInfo();
      setCustomerInfo(info);
      const isPro =
        info.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;
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
    // Skip in mock mode
    if (REVENUE_CAT_CONFIG.USE_MOCK) {
      console.log('[RevenueCat Mock] Skipping offerings fetch');
      setIsLoading(false);
      return;
    }

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

// ---------- Purchase/Restore State Management ----------
function usePurchaseState() {
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  return {
    isPurchasing,
    isRestoring,
    setIsPurchasing,
    setIsRestoring,
  };
}

// ---------- Purchase/Restore Logic ----------
async function handlePurchase(
  pkg: PurchasesPackage,
  syncProStatus: (isPro: boolean, timestamp?: number) => void,
  setIsPurchasing: (value: boolean) => void
): Promise<PurchaseResult> {
  // Use mock in mock mode
  if (REVENUE_CAT_CONFIG.USE_MOCK) {
    setIsPurchasing(true);
    const result = await mockPurchase(syncProStatus);
    setIsPurchasing(false);
    return result;
  }

  try {
    setIsPurchasing(true);
    const { customerInfo } = await Purchases.purchasePackage(pkg);
    const hasPro =
      customerInfo.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;

    syncProStatus(hasPro, Date.now());
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    console.log('[RevenueCat] Purchase successful, isPro:', hasPro);
    return { success: true };
  } catch (err: any) {
    // Check if user cancelled (not an error condition)
    if (
      err.code === 'USER_CANCELLED' ||
      err.userCancelled ||
      err.message?.toLowerCase().includes('user cancelled')
    ) {
      console.log('[RevenueCat] User cancelled purchase');
      return { success: false, cancelled: true };
    }

    // Real error
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    console.error('[RevenueCat] Purchase error:', err);
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Purchase failed',
    };
  } finally {
    setIsPurchasing(false);
  }
}

async function handleRestore(
  syncProStatus: (isPro: boolean, timestamp?: number) => void,
  setIsRestoring: (value: boolean) => void
): Promise<RestoreResult> {
  // Use mock in mock mode
  if (REVENUE_CAT_CONFIG.USE_MOCK) {
    setIsRestoring(true);
    const result = await mockRestore(syncProStatus);
    setIsRestoring(false);
    return result;
  }

  try {
    setIsRestoring(true);
    const restored = await Purchases.restorePurchases();
    const hasPro =
      restored.entitlements.active[ENTITLEMENTS.PRO_FEATURES] !== undefined;

    syncProStatus(hasPro, Date.now());

    if (hasPro) {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      console.log('[RevenueCat] Restore successful, isPro:', hasPro);
      return { success: true, restored: true };
    } else {
      // No purchases to restore (not an error, but nothing found)
      console.log('[RevenueCat] No purchases to restore');
      return { success: true, restored: false };
    }
  } catch (err) {
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    console.error('[RevenueCat] Restore error:', err);
    return {
      success: false,
      restored: false,
      error: err instanceof Error ? err.message : 'Restore failed',
    };
  } finally {
    setIsRestoring(false);
  }
}

// ---------- Main Hook ----------
export function useRevenueCat(): UseRevenueCatReturn {
  const syncProStatus = useAnalysisStore((s) => s.syncProStatus);
  // Read isPro directly from Zustand (reactive across entire app)
  const isPro = useAnalysisStore((s) => s.isPro);

  const [isConfigured, configError] = useConfigureRevenueCat(
    REVENUE_CAT_CONFIG.apiKey
  );
  const { customerInfo, fetchCustomerInfo } = useCustomerInfo(syncProStatus);
  const { offerings, fetchOfferings, isLoading } = useOfferings();
  const { isPurchasing, isRestoring, setIsPurchasing, setIsRestoring } =
    usePurchaseState();

  // Initial fetch on mount
  useEffect(() => {
    const init = async () => {
      if (!isConfigured) return;
      await fetchCustomerInfo();
      await fetchOfferings();
    };
    init();
  }, [isConfigured, fetchCustomerInfo, fetchOfferings]);

  // Note: CustomerInfo listener is now in RevenueCatProvider (global listener)

  return {
    isConfigured,
    isLoading,
    isPurchasing,
    isRestoring,
    customerInfo,
    offerings,
    isPro, // Read from Zustand store (reactive)
    purchasePackage: useCallback(
      (pkg: PurchasesPackage) =>
        handlePurchase(pkg, syncProStatus, setIsPurchasing),
      [syncProStatus, setIsPurchasing]
    ),
    restorePurchases: useCallback(
      () => handleRestore(syncProStatus, setIsRestoring),
      [syncProStatus, setIsRestoring]
    ),
    error: configError,
  };
}
