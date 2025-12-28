import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { storage } from '@/lib/storage';
import type { EmotionResult, StoredEmotionResult } from '@/types/emotion';

const MAX_HISTORY_ITEMS = 10;
export const DAILY_LIMIT_FREE = 2;

interface AnalysisState {
  currentImageUri: string | null;
  isAnalyzing: boolean;
  currentResult: EmotionResult | null;
  history: StoredEmotionResult[];
  isPro: boolean;
  dailyUsageCount: number;
  lastResetDate: string | null;
  lastSubscriptionCheck: number | null;
}

interface AnalysisActions {
  setImageUri: (uri: string | null) => void;
  setAnalyzing: (status: boolean) => void;
  saveResult: (result: EmotionResult) => void;
  clearCurrentResult: () => void;
  clearHistory: () => void;
  setPro: (isPro: boolean) => void;
  syncProStatus: (isPro: boolean, timestamp?: number) => void;
  incrementUsage: () => void;
  resetDailyUsage: () => void;
  checkAndResetDaily: () => void;
  reset: () => void;
}

type AnalysisStore = AnalysisState & AnalysisActions;

const initialState: AnalysisState = {
  currentImageUri: null,
  isAnalyzing: false,
  currentResult: null,
  history: [],
  isPro: false,
  dailyUsageCount: 0,
  lastResetDate: null,
  lastSubscriptionCheck: null,
};

export const useAnalysisStore = create<AnalysisStore>()(
  persist(
    (set, get) => ({
      ...initialState,

      setImageUri: (uri) => {
        set({ currentImageUri: uri });
      },

      setAnalyzing: (status) => {
        set({ isAnalyzing: status });
      },

      saveResult: (result) => {
        const { history } = get();
        const storedResult: StoredEmotionResult = {
          ...result,
          result_id: `result-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          created_at: new Date().toISOString(),
        };
        const newHistory = [storedResult, ...history].slice(
          0,
          MAX_HISTORY_ITEMS
        );
        set({
          currentResult: result,
          history: newHistory,
          isAnalyzing: false,
        });
      },

      clearCurrentResult: () => {
        set({ currentResult: null });
      },

      clearHistory: () => {
        set({ history: [] });
      },

      setPro: (isPro) => {
        set({ isPro });
      },

      syncProStatus: (isPro, timestamp) => {
        set({
          isPro,
          lastSubscriptionCheck: timestamp ?? Date.now(),
        });
      },

      incrementUsage: () => {
        set((state) => ({
          dailyUsageCount: state.dailyUsageCount + 1,
        }));
      },

      resetDailyUsage: () => {
        const today = new Date().toISOString().split('T')[0];
        set({
          dailyUsageCount: 0,
          lastResetDate: today,
        });
      },

      checkAndResetDaily: () => {
        const { lastResetDate, resetDailyUsage } = get();
        const today = new Date().toISOString().split('T')[0];

        if (lastResetDate !== today) {
          resetDailyUsage();
        }
      },

      reset: () => {
        set(initialState);
      },
    }),
    {
      name: 'feli-analysis-storage',
      storage: createJSONStorage(() => ({
        getItem: (key) => {
          const value = storage.getString(key);
          return value ? JSON.parse(value) : null;
        },
        setItem: (key, value) => {
          storage.set(key, JSON.stringify(value));
        },
        removeItem: (key) => {
          storage.delete(key);
        },
      })),
      partialize: (state) => ({
        history: state.history,
        isPro: state.isPro,
        dailyUsageCount: state.dailyUsageCount,
        lastResetDate: state.lastResetDate,
        lastSubscriptionCheck: state.lastSubscriptionCheck,
      }),
    }
  )
);
