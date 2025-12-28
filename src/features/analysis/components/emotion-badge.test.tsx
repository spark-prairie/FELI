import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { EmotionBadge } from './emotion-badge';

describe('EmotionBadge', () => {
  const mockEmotion = {
    type: 'relaxed' as const,
    confidence_percentage: 85,
  };

  describe('Free User Experience', () => {
    it('does NOT show percentage when showPercentage is false', () => {
      render(
        <EmotionBadge
          emotion={mockEmotion}
          confidenceNote="high"
          showPercentage={false}
          isPro={false}
        />
      );

      // Should NOT show percentage
      expect(screen.queryByText(/85%/)).toBeNull();

      // Should show confidence note instead
      expect(screen.getByText(/high confidence/i)).toBeTruthy();
    });

    it('does NOT show Pro badge for free users', () => {
      render(
        <EmotionBadge
          emotion={mockEmotion}
          confidenceNote="high"
          isPro={false}
        />
      );

      expect(screen.queryByText('PRO')).toBeNull();
    });

    it('renders correctly for free users without Pro styling', () => {
      render(
        <EmotionBadge
          emotion={mockEmotion}
          confidenceNote="high"
          isPro={false}
        />
      );

      // Should show the emotion without Pro badge
      expect(screen.getByText('😌')).toBeTruthy();
      expect(screen.queryByText('PRO')).toBeNull();
    });
  });

  describe('Pro User Experience', () => {
    it('shows percentage when showPercentage is true', () => {
      render(
        <EmotionBadge
          emotion={mockEmotion}
          showPercentage={true}
          isPro={true}
        />
      );

      expect(screen.getByText(/85% confidence/)).toBeTruthy();
    });

    it('shows Pro badge for pro users', () => {
      render(<EmotionBadge emotion={mockEmotion} isPro={true} />);

      expect(screen.getByText('PRO')).toBeTruthy();
    });

    it('shows Pro badge for pro users with styling', () => {
      render(<EmotionBadge emotion={mockEmotion} isPro={true} />);

      // Should show both emotion and Pro badge
      expect(screen.getByText('😌')).toBeTruthy();
      expect(screen.getByText('PRO')).toBeTruthy();
    });
  });

  describe('Emotion Display', () => {
    it('displays correct emoji for each emotion type', () => {
      const emotions = [
        { type: 'relaxed' as const, emoji: '😌' },
        { type: 'alert' as const, emoji: '👀' },
        { type: 'anxious' as const, emoji: '😰' },
        { type: 'irritated' as const, emoji: '😾' },
        { type: 'possible_discomfort' as const, emoji: '😿' },
      ];

      emotions.forEach(({ type, emoji }) => {
        const { unmount } = render(
          <EmotionBadge
            emotion={{ type, confidence_percentage: 50 }}
            isPro={false}
          />
        );

        expect(screen.getByText(emoji)).toBeTruthy();
        unmount();
      });
    });

    it('displays emotion name with proper formatting', () => {
      render(
        <EmotionBadge
          emotion={{ type: 'possible_discomfort', confidence_percentage: 50 }}
          isPro={false}
        />
      );

      // Underscores should be replaced with spaces
      expect(screen.getByText(/possible discomfort/i)).toBeTruthy();
    });
  });
});
