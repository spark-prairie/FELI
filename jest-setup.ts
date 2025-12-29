import '@testing-library/react-native/extend-expect';

// react-hook form setup for testing
// @ts-ignore
global.window = {};
// @ts-ignore
global.window = global;

// Mock react-native-purchases for testing
jest.mock('react-native-purchases', () => ({
  __esModule: true,
  default: {
    configure: jest.fn(),
    setLogLevel: jest.fn(),
    getCustomerInfo: jest.fn().mockResolvedValue({
      entitlements: { active: {} },
    }),
    getOfferings: jest.fn().mockResolvedValue({
      all: {},
      current: null,
    }),
    purchasePackage: jest.fn().mockResolvedValue({
      customerInfo: { entitlements: { active: {} } },
    }),
    restorePurchases: jest.fn().mockResolvedValue({
      entitlements: { active: {} },
    }),
    addCustomerInfoUpdateListener: jest.fn(),
    removeCustomerInfoUpdateListener: jest.fn(),
  },
  LOG_LEVEL: {
    DEBUG: 'DEBUG',
    INFO: 'INFO',
    WARN: 'WARN',
    ERROR: 'ERROR',
  },
}));

// Mock react-native-purchases-ui for testing
jest.mock('react-native-purchases-ui', () => ({
  __esModule: true,
  default: {
    presentPaywall: jest.fn().mockResolvedValue('PURCHASED'),
    PAYWALL_RESULT: {
      PURCHASED: 'PURCHASED',
      CANCELLED: 'CANCELLED',
      RESTORED: 'RESTORED',
      ERROR: 'ERROR',
    },
  },
}));
