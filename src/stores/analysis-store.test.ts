import { renderHook, act } from '@testing-library/react-native';

import { storage } from '@/lib/storage';
import type { EmotionResult } from '@/types/emotion';

import { DAILY_LIMIT_FREE, useAnalysisStore } from './analysis-store';

// Mock the storage module
jest.mock('@/lib/storage', () => ({
  storage: {
    getString: jest.fn(),
    set: jest.fn(),
    delete: jest.fn(),
    clearAll: jest.fn(),
  },
}));

describe('AnalysisStore', () => {
  beforeEach(() => {
    // Reset store to initial state before each test
    act(() => {
      useAnalysisStore.getState().reset();
    });
    jest.clearAllMocks();
  });

  describe('Daily Usage', () => {
    it('should start with dailyUsageCount at 0', () => {
      const { result } = renderHook(() => useAnalysisStore());
      expect(result.current.dailyUsageCount).toBe(0);
    });

    it('should increment dailyUsageCount', () => {
      const { result } = renderHook(() => useAnalysisStore());

      act(() => {
        result.current.incrementUsage();
      });

      expect(result.current.dailyUsageCount).toBe(1);

      act(() => {
        result.current.incrementUsage();
      });

      expect(result.current.dailyUsageCount).toBe(2);
    });

    it('should reset dailyUsageCount and update lastResetDate', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Increment usage first
      act(() => {
        result.current.incrementUsage();
        result.current.incrementUsage();
      });

      expect(result.current.dailyUsageCount).toBe(2);

      // Reset
      act(() => {
        result.current.resetDailyUsage();
      });

      expect(result.current.dailyUsageCount).toBe(0);
      expect(result.current.lastResetDate).toBe(
        new Date().toISOString().split('T')[0]
      );
    });

    it('should auto-reset when date changes', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Set usage and old date
      act(() => {
        result.current.incrementUsage();
        result.current.incrementUsage();
      });

      // Manually set old date
      act(() => {
        useAnalysisStore.setState({ lastResetDate: '2020-01-01' });
      });

      expect(result.current.dailyUsageCount).toBe(2);

      // Check and reset daily
      act(() => {
        result.current.checkAndResetDaily();
      });

      expect(result.current.dailyUsageCount).toBe(0);
      expect(result.current.lastResetDate).toBe(
        new Date().toISOString().split('T')[0]
      );
    });

    it('should not reset if date is the same', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Set usage and today's date
      act(() => {
        result.current.incrementUsage();
        result.current.resetDailyUsage(); // Sets today's date
      });

      expect(result.current.dailyUsageCount).toBe(0);

      // Increment again
      act(() => {
        result.current.incrementUsage();
      });

      expect(result.current.dailyUsageCount).toBe(1);

      // Check and reset daily (should NOT reset since date is same)
      act(() => {
        result.current.checkAndResetDaily();
      });

      expect(result.current.dailyUsageCount).toBe(1);
    });

    it('should verify DAILY_LIMIT_FREE constant is 2', () => {
      expect(DAILY_LIMIT_FREE).toBe(2);
    });
  });

  describe('Pro Status', () => {
    it('should start with isPro as false', () => {
      const { result } = renderHook(() => useAnalysisStore());
      expect(result.current.isPro).toBe(false);
    });

    it('should update isPro with setPro', () => {
      const { result } = renderHook(() => useAnalysisStore());

      act(() => {
        result.current.setPro(true);
      });

      expect(result.current.isPro).toBe(true);

      act(() => {
        result.current.setPro(false);
      });

      expect(result.current.isPro).toBe(false);
    });

    it('should update isPro and timestamp with syncProStatus', () => {
      const { result } = renderHook(() => useAnalysisStore());
      const timestamp = Date.now();

      act(() => {
        result.current.syncProStatus(true, timestamp);
      });

      expect(result.current.isPro).toBe(true);
      expect(result.current.lastSubscriptionCheck).toBe(timestamp);
    });

    it('should auto-generate timestamp if not provided to syncProStatus', () => {
      const { result } = renderHook(() => useAnalysisStore());
      const beforeTimestamp = Date.now();

      act(() => {
        result.current.syncProStatus(true);
      });

      const afterTimestamp = Date.now();

      expect(result.current.isPro).toBe(true);
      expect(result.current.lastSubscriptionCheck).toBeGreaterThanOrEqual(
        beforeTimestamp
      );
      expect(result.current.lastSubscriptionCheck).toBeLessThanOrEqual(
        afterTimestamp
      );
    });
  });

  describe('Result Management', () => {
    const mockEmotionResult: EmotionResult = {
      primary_emotion: {
        type: 'relaxed',
        confidence_percentage: 85,
      },
      secondary_emotion: {
        type: 'alert',
        confidence_percentage: 42,
      },
      reasoning: ['Test reason 1', 'Test reason 2', 'Test reason 3'],
      suggestions: ['Test suggestion 1', 'Test suggestion 2'],
      confidence_note: 'high',
      disclaimer: 'Test disclaimer',
      meta: {
        visibility: 'clear',
        face_coverage: 0.9,
      },
    };

    it('should save result and capture isProAtSave as false when user is free', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Ensure user is free
      act(() => {
        result.current.setPro(false);
      });

      // Save result
      act(() => {
        result.current.saveResult(mockEmotionResult);
      });

      expect(result.current.currentResult).toEqual(mockEmotionResult);
      expect(result.current.history).toHaveLength(1);

      const savedRecord = result.current.history[0];
      expect(savedRecord.isProAtSave).toBe(false);
      expect(savedRecord.result_id).toBeDefined();
      expect(savedRecord.created_at).toBeDefined();
      expect(savedRecord.primary_emotion).toEqual(
        mockEmotionResult.primary_emotion
      );
    });

    it('should save result and capture isProAtSave as true when user is pro', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Ensure user is pro
      act(() => {
        result.current.setPro(true);
      });

      // Save result
      act(() => {
        result.current.saveResult(mockEmotionResult);
      });

      expect(result.current.currentResult).toEqual(mockEmotionResult);
      expect(result.current.history).toHaveLength(1);

      const savedRecord = result.current.history[0];
      expect(savedRecord.isProAtSave).toBe(true);
      expect(savedRecord.result_id).toBeDefined();
      expect(savedRecord.created_at).toBeDefined();
    });

    it('should maintain history order (newest first)', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Save first result
      act(() => {
        result.current.saveResult(mockEmotionResult);
      });

      const firstRecordId = result.current.history[0].result_id;

      // Save second result
      act(() => {
        result.current.saveResult(mockEmotionResult);
      });

      expect(result.current.history).toHaveLength(2);
      expect(result.current.history[0].result_id).not.toBe(firstRecordId);
      expect(result.current.history[1].result_id).toBe(firstRecordId);
    });

    it('should limit history to MAX_HISTORY_ITEMS (10)', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Save 15 results
      act(() => {
        for (let i = 0; i < 15; i++) {
          result.current.saveResult(mockEmotionResult);
        }
      });

      expect(result.current.history).toHaveLength(10);
    });

    it('should NOT increment usage when saving result (usage incremented separately)', () => {
      const { result } = renderHook(() => useAnalysisStore());

      expect(result.current.dailyUsageCount).toBe(0);

      act(() => {
        result.current.saveResult(mockEmotionResult);
      });

      // saveResult does NOT increment usage - that's done separately in use-analyze.ts onSuccess
      expect(result.current.dailyUsageCount).toBe(0);
    });

    it('should set isAnalyzing to false when saving result', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Set analyzing to true
      act(() => {
        result.current.setAnalyzing(true);
      });

      expect(result.current.isAnalyzing).toBe(true);

      // Save result should set it to false
      act(() => {
        result.current.saveResult(mockEmotionResult);
      });

      expect(result.current.isAnalyzing).toBe(false);
    });

    it('should clear current result', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Save a result first
      act(() => {
        result.current.saveResult(mockEmotionResult);
      });

      expect(result.current.currentResult).toEqual(mockEmotionResult);

      // Clear it
      act(() => {
        result.current.clearCurrentResult();
      });

      expect(result.current.currentResult).toBeNull();
      // History should remain
      expect(result.current.history).toHaveLength(1);
    });

    it('should clear history', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Save some results
      act(() => {
        result.current.saveResult(mockEmotionResult);
        result.current.saveResult(mockEmotionResult);
      });

      expect(result.current.history).toHaveLength(2);

      // Clear history
      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.history).toHaveLength(0);
    });
  });

  describe('Image URI', () => {
    it('should set and clear image URI', () => {
      const { result } = renderHook(() => useAnalysisStore());

      expect(result.current.currentImageUri).toBeNull();

      act(() => {
        result.current.setImageUri('file://test-image.jpg');
      });

      expect(result.current.currentImageUri).toBe('file://test-image.jpg');

      act(() => {
        result.current.setImageUri(null);
      });

      expect(result.current.currentImageUri).toBeNull();
    });
  });

  describe('Analyzing State', () => {
    it('should toggle analyzing state', () => {
      const { result } = renderHook(() => useAnalysisStore());

      expect(result.current.isAnalyzing).toBe(false);

      act(() => {
        result.current.setAnalyzing(true);
      });

      expect(result.current.isAnalyzing).toBe(true);

      act(() => {
        result.current.setAnalyzing(false);
      });

      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe('Reset and Clear', () => {
    it('should reset store to initial state', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Modify state
      act(() => {
        result.current.setImageUri('file://test.jpg');
        result.current.setAnalyzing(true);
        result.current.setPro(true);
        result.current.incrementUsage();
      });

      // Verify state is modified before saveResult
      expect(result.current.currentImageUri).toBe('file://test.jpg');
      expect(result.current.isAnalyzing).toBe(true);
      expect(result.current.isPro).toBe(true);
      expect(result.current.dailyUsageCount).toBe(1);

      // Save result (which sets isAnalyzing to false)
      act(() => {
        result.current.saveResult({
          primary_emotion: { type: 'relaxed', confidence_percentage: 85 },
          secondary_emotion: { type: 'alert', confidence_percentage: 42 },
          reasoning: ['Test'],
          suggestions: ['Test'],
          confidence_note: 'high',
          disclaimer: 'Test',
          meta: { visibility: 'clear', face_coverage: 0.9 },
        });
      });

      // Verify state after saveResult (isAnalyzing should be false now)
      expect(result.current.history).toHaveLength(1);
      expect(result.current.isAnalyzing).toBe(false); // saveResult sets this to false

      // Reset
      act(() => {
        result.current.reset();
      });

      // Verify reset to initial state
      expect(result.current.currentImageUri).toBeNull();
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.currentResult).toBeNull();
      expect(result.current.history).toHaveLength(0);
      expect(result.current.isPro).toBe(false);
      expect(result.current.dailyUsageCount).toBe(0);
      expect(result.current.lastResetDate).toBeNull();
      expect(result.current.lastSubscriptionCheck).toBeNull();
    });

    it('should clear all local data and reset state', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // Modify state
      act(() => {
        result.current.setPro(true);
        result.current.incrementUsage();
        result.current.saveResult({
          primary_emotion: { type: 'relaxed', confidence_percentage: 85 },
          secondary_emotion: { type: 'alert', confidence_percentage: 42 },
          reasoning: ['Test'],
          suggestions: ['Test'],
          confidence_note: 'high',
          disclaimer: 'Test',
          meta: { visibility: 'clear', face_coverage: 0.9 },
        });
      });

      // Clear all
      act(() => {
        result.current.clearAllLocalData();
      });

      // Verify storage.clearAll was called
      expect(storage.clearAll).toHaveBeenCalled();

      // Verify state is reset
      expect(result.current.currentImageUri).toBeNull();
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.currentResult).toBeNull();
      expect(result.current.history).toHaveLength(0);
      expect(result.current.isPro).toBe(false);
      expect(result.current.dailyUsageCount).toBe(0);
    });
  });

  describe('Critical Bug Prevention - Pro History', () => {
    it('should preserve Pro status in history records even after user downgrades', () => {
      const { result } = renderHook(() => useAnalysisStore());

      // User is Pro
      act(() => {
        result.current.setPro(true);
      });

      // Save a Pro result
      act(() => {
        result.current.saveResult({
          primary_emotion: { type: 'relaxed', confidence_percentage: 85 },
          secondary_emotion: { type: 'alert', confidence_percentage: 42 },
          reasoning: [
            'Reason 1',
            'Reason 2',
            'Reason 3',
            'Reason 4',
            'Reason 5',
            'Reason 6',
          ],
          suggestions: [
            'Suggestion 1',
            'Suggestion 2',
            'Suggestion 3',
            'Suggestion 4',
          ],
          confidence_note: 'high',
          disclaimer: 'Test',
          meta: { visibility: 'clear', face_coverage: 0.9 },
        });
      });

      const proRecord = result.current.history[0];
      expect(proRecord.isProAtSave).toBe(true);
      expect(proRecord.reasoning).toHaveLength(6);

      // User downgrades to Free
      act(() => {
        result.current.setPro(false);
      });

      // Save a Free result
      act(() => {
        result.current.saveResult({
          primary_emotion: { type: 'anxious', confidence_percentage: 60 },
          secondary_emotion: { type: 'irritated', confidence_percentage: 30 },
          reasoning: ['Reason 1', 'Reason 2', 'Reason 3'],
          suggestions: ['Suggestion 1', 'Suggestion 2'],
          confidence_note: 'medium',
          disclaimer: 'Test',
          meta: { visibility: 'partial', face_coverage: 0.6 },
        });
      });

      const freeRecord = result.current.history[0];
      expect(freeRecord.isProAtSave).toBe(false);
      expect(freeRecord.reasoning).toHaveLength(3);

      // Verify Pro record is still marked as Pro
      const oldProRecord = result.current.history[1];
      expect(oldProRecord.isProAtSave).toBe(true);
      expect(oldProRecord.reasoning).toHaveLength(6);
    });
  });
});
