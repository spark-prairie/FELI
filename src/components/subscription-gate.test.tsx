import { fireEvent, render, screen } from '@testing-library/react-native';
import { useRouter } from 'expo-router';
import React from 'react';

import { useAnalysisStore } from '@/stores/analysis-store';

import { SubscriptionGate } from './subscription-gate';

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: jest.fn(),
}));

// Mock the store
jest.mock('@/stores/analysis-store');

describe('SubscriptionGate', () => {
  const mockPush = jest.fn();
  const mockBack = jest.fn();

  beforeAll(() => {
    (useRouter as jest.Mock).mockReturnValue({
      push: mockPush,
      back: mockBack,
    });
  });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  // Helper for Free User store
  const setupFreeUserStore = (mockSetPro: jest.Mock) => {
    (useAnalysisStore as unknown as jest.Mock).mockImplementation(
      (selector) => {
        const state = { isPro: false, setPro: mockSetPro };
        return selector(state);
      }
    );
  };

  describe('Pro User', () => {
    beforeEach(() => {
      (useAnalysisStore as unknown as jest.Mock).mockReturnValue(true);
    });

    it('renders children directly when user is Pro', () => {
      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );
      expect(screen.getByText('Pro Content')).toBeTruthy();
      expect(screen.queryByText('Pro Feature')).toBeNull();
      expect(screen.queryByTestId('subscription-gate-locked')).toBeNull();
    });
  });

  describe('Free User - Modal Mode', () => {
    it('renders locked state', () => {
      setupFreeUserStore(jest.fn());
      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );
      expect(screen.queryByText('Pro Content')).toBeNull();
      expect(screen.getByText('Pro Feature')).toBeTruthy();
      expect(screen.getByText('Tap to unlock')).toBeTruthy();
    });

    it('shows modal when locked state is tapped', async () => {
      setupFreeUserStore(jest.fn());
      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );
      fireEvent.press(screen.getByTestId('subscription-gate-locked'));
      await screen.findByText('Pro Feature Locked');
      await screen.findByText('Unlock Pro');
    });

    it('calls setPro on subscribe', async () => {
      const mockSetPro = jest.fn();
      setupFreeUserStore(mockSetPro);
      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );
      fireEvent.press(screen.getByTestId('subscription-gate-locked'));
      const subscribeButton = await screen.findByTestId(
        'modal-subscribe-button'
      );
      fireEvent.press(subscribeButton);
      expect(mockSetPro).toHaveBeenCalledWith(true);
    });

    it('closes modal when "Not Now" is pressed', async () => {
      setupFreeUserStore(jest.fn());
      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );
      fireEvent.press(screen.getByTestId('subscription-gate-locked'));
      const closeButton = await screen.findByTestId('modal-close-button');
      fireEvent.press(closeButton);
      await screen.findByTestId('subscription-gate-locked');
    });
  });

  describe('Free User - Navigate Mode', () => {
    it('navigates to /paywall', () => {
      setupFreeUserStore(jest.fn());
      render(
        <SubscriptionGate mode="navigate">
          <span>Pro Content</span>
        </SubscriptionGate>
      );
      fireEvent.press(screen.getByTestId('subscription-gate-locked'));
      expect(mockPush).toHaveBeenCalledWith('/paywall');
    });
  });

  describe('Custom Fallback', () => {
    it('renders fallback UI', () => {
      setupFreeUserStore(jest.fn());
      render(
        <SubscriptionGate fallback={<span>Custom Locked UI</span>}>
          <span>Pro Content</span>
        </SubscriptionGate>
      );
      expect(screen.getByText('Custom Locked UI')).toBeTruthy();
      expect(screen.queryByText('Pro Feature')).toBeNull();
    });
  });

  describe('Accessibility', () => {
    it('sets proper accessibility labels', () => {
      setupFreeUserStore(jest.fn());
      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );
      const lockedState = screen.getByTestId('subscription-gate-locked');
      expect(lockedState.props.accessibilityLabel).toBe('Unlock Pro features');
      expect(lockedState.props.accessibilityHint).toBe(
        'Open subscription modal'
      );
    });
  });
});
