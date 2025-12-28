/**
 * RevenueCat Configuration
 * API keys and product identifiers for subscription management
 */

import { Platform } from 'react-native';

/**
 * RevenueCat API Keys
 * Use environment-specific keys in production
 */
export const REVENUE_CAT_CONFIG = {
  apiKey: __DEV__
    ? 'test_WQrrRhqtUZYQiBbZPsRAJWqFVfE'
    : Platform.select({
        ios: process.env.EXPO_PUBLIC_REVENUECAT_IOS_KEY || '',
        android: process.env.EXPO_PUBLIC_REVENUECAT_ANDROID_KEY || '',
      }) || '',
  USE_MOCK: __DEV__, // Enable mock mode in development (no real SDK calls)
} as const;

/**
 * Entitlement identifiers configured in RevenueCat dashboard
 */
export const ENTITLEMENTS = {
  PRO_FEATURES: 'pro_features',
} as const;

/**
 * Product identifiers for subscription offerings
 * These must match your RevenueCat dashboard configuration
 */
export const PRODUCTS = {
  MONTHLY: 'feli_monthly_pro',
  MONTHLY_ALT: 'monthly',
  YEARLY: 'yearly',
  LIFETIME: 'lifetime',
} as const;

/**
 * Offering identifiers
 */
export const OFFERINGS = {
  DEFAULT: 'default',
} as const;
