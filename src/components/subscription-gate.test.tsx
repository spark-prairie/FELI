import {
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react-native';
import React from 'react';

import { useAnalysisStore } from '@/stores/analysis-store';

import { SubscriptionGate } from './subscription-gate';

// Mock Expo Router
jest.mock('expo-router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    back: jest.fn(),
  }),
}));

// Mock the store
jest.mock('@/stores/analysisStore');

describe('SubscriptionGate', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Pro User', () => {
    it('renders children directly when user is Pro', () => {
      (useAnalysisStore as unknown as jest.Mock).mockReturnValue(true);

      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );

      expect(screen.getByText('Pro Content')).toBeTruthy();
      expect(screen.queryByText('Pro Feature')).toBeNull();
    });

    it('does not show locked state for Pro users', () => {
      (useAnalysisStore as unknown as jest.Mock).mockReturnValue(true);

      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );

      expect(screen.queryByTestId('subscription-gate-locked')).toBeNull();
    });
  });

  describe('Free User - Modal Mode', () => {
    beforeEach(() => {
      (useAnalysisStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = {
            isPro: false,
            setPro: jest.fn(),
          };
          return selector(state);
        }
      );
    });

    it('renders locked state for Free users', () => {
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
      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );

      const lockedState = screen.getByTestId('subscription-gate-locked');
      fireEvent.press(lockedState);

      await screen.findByText('Pro Feature Locked');
      await screen.findByText('Unlock Pro');
    });

    it('calls setPro when subscribe button is pressed', async () => {
      const mockSetPro = jest.fn();
      (useAnalysisStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = {
            isPro: false,
            setPro: mockSetPro,
          };
          return selector(state);
        }
      );

      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );

      // Open modal
      const lockedState = screen.getByTestId('subscription-gate-locked');
      fireEvent.press(lockedState);

      // Click subscribe
      const subscribeButton = await screen.findByTestId(
        'modal-subscribe-button'
      );
      fireEvent.press(subscribeButton);
      expect(mockSetPro).toHaveBeenCalledWith(true);
    });

    it('closes modal when "Not Now" is pressed', async () => {
      render(
        <SubscriptionGate>
          <span>Pro Content</span>
        </SubscriptionGate>
      );

      // Open modal
      const lockedState = screen.getByTestId('subscription-gate-locked');
      fireEvent.press(lockedState);

      // Close modal
      const closeButton = await screen.findByTestId('modal-close-button');
      fireEvent.press(closeButton);
      await waitFor(() => {
        expect(screen.queryByText('Pro Feature Locked')).toBeNull();
      });

      await waitFor(() => {
        expect(screen.queryByText('Pro Feature Locked')).toBeNull();
      });
    });
  });

  describe('Free User - Navigate Mode', () => {
    it('navigates to /paywall when mode is "navigate"', () => {
      const mockPush = jest.fn();
      const useRouter = require('expo-router').useRouter;
      (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

      (useAnalysisStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = { isPro: false, setPro: jest.fn() };
          return selector(state);
        }
      );

      render(
        <SubscriptionGate mode="navigate">
          <span>Pro Content</span>
        </SubscriptionGate>
      );

      const lockedState = screen.getByTestId('subscription-gate-locked');
      fireEvent.press(lockedState);

      expect(mockPush).toHaveBeenCalledWith('/paywall');
    });
  });

  describe('Custom Fallback', () => {
    it('renders custom fallback when provided', () => {
      (useAnalysisStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = { isPro: false, setPro: jest.fn() };
          return selector(state);
        }
      );

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
    it('has proper accessibility labels', () => {
      (useAnalysisStore as unknown as jest.Mock).mockImplementation(
        (selector) => {
          const state = { isPro: false, setPro: jest.fn() };
          return selector(state);
        }
      );

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
