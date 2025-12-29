import { render, screen } from '@testing-library/react-native';
import React from 'react';

import { ReasoningList } from './reasoning-list';

describe('ReasoningList', () => {
  const mockItems = [
    'Ears are relaxed and facing forward',
    'Tail is in a neutral position',
    'Eyes are half-closed indicating comfort',
    'Body posture is loose and unstressed',
    'Whiskers are in a relaxed position',
    'Breathing appears calm and steady',
  ];

  describe('Free User Experience', () => {
    it('limits to 3 items for free users by default', () => {
      render(<ReasoningList items={mockItems} isPro={false} />);

      // Should show first 3 items
      expect(screen.getByText(mockItems[0])).toBeTruthy();
      expect(screen.getByText(mockItems[1])).toBeTruthy();
      expect(screen.getByText(mockItems[2])).toBeTruthy();

      // Should NOT show items 4-6
      expect(screen.queryByText(mockItems[3])).toBeNull();
      expect(screen.queryByText(mockItems[4])).toBeNull();
      expect(screen.queryByText(mockItems[5])).toBeNull();
    });

    it('shows "more insights available" message for free users', () => {
      render(<ReasoningList items={mockItems} isPro={false} />);

      expect(
        screen.getByText(/3 more insights available with Pro/i)
      ).toBeTruthy();
    });

    it('does NOT show insight count badge for free users', () => {
      render(<ReasoningList items={mockItems} isPro={false} />);

      expect(screen.queryByText(/6 insights/i)).toBeNull();
    });

    it('respects custom limit prop for free users', () => {
      render(<ReasoningList items={mockItems} limit={2} isPro={false} />);

      // Should show only 2 items
      expect(screen.getByText(mockItems[0])).toBeTruthy();
      expect(screen.getByText(mockItems[1])).toBeTruthy();
      expect(screen.queryByText(mockItems[2])).toBeNull();

      // Should show "4 more insights" message
      expect(
        screen.getByText(/4 more insights available with Pro/i)
      ).toBeTruthy();
    });
  });

  describe('Pro User Experience', () => {
    it('shows all items for pro users', () => {
      render(<ReasoningList items={mockItems} isPro={true} />);

      // Should show all 6 items
      mockItems.forEach((item) => {
        expect(screen.getByText(item)).toBeTruthy();
      });
    });

    it('does NOT show "more insights" message for pro users', () => {
      render(<ReasoningList items={mockItems} isPro={true} />);

      expect(
        screen.queryByText(/more insights available with Pro/i)
      ).toBeNull();
    });

    it('shows insight count badge for pro users', () => {
      render(<ReasoningList items={mockItems} isPro={true} />);

      expect(screen.getByText(/6 insights/i)).toBeTruthy();
    });

    it('respects custom limit prop even for pro users', () => {
      render(<ReasoningList items={mockItems} limit={4} isPro={true} />);

      // Should show only 4 items despite being Pro
      expect(screen.getByText(mockItems[0])).toBeTruthy();
      expect(screen.getByText(mockItems[3])).toBeTruthy();
      expect(screen.queryByText(mockItems[4])).toBeNull();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty items array', () => {
      render(<ReasoningList items={[]} isPro={false} />);

      expect(screen.getByText(/What we observed/i)).toBeTruthy();
    });

    it('handles items array with fewer than limit', () => {
      const shortList = ['Item 1', 'Item 2'];
      render(<ReasoningList items={shortList} isPro={false} />);

      // Should show both items
      expect(screen.getByText('Item 1')).toBeTruthy();
      expect(screen.getByText('Item 2')).toBeTruthy();

      // Should NOT show "more insights" message
      expect(screen.queryByText(/more insights available/i)).toBeNull();
    });

    it('handles singular vs plural in insight count', () => {
      const singleItem = ['Only one insight'];
      render(<ReasoningList items={singleItem} isPro={true} />);

      // Should say "insight" not "insights"
      expect(screen.getByText(/1 insight$/i)).toBeTruthy();
    });
  });
});
