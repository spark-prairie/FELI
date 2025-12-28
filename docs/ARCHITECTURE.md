# ARCHITECTURE.md
FELI — Architecture & State

## 1. Goals
- Clarify the project directory structure (based on Obytes starter)
- Define core TypeScript types (emotion / result)
- Define the analysis API request/response contract
- Implement Zustand store (analysis-store) to support FELI MVP state
- Integrate TanStack Query for server state management

## 2. Directory Structure
```
src/
├─ app/                      # Expo Router pages
│  ├─ (app)/                 # Authenticated app routes
│  ├─ login.tsx
│  ├─ onboarding.tsx
│  ├─ debug.tsx              # Debug/testing page
│  └─ _layout.tsx
├─ features/                 # Feature modules
│  └─ analysis/
│     ├─ components/         # Analysis-specific components
│     ├─ use-analyze.ts       # React Query mutation hook
│     └─ index.ts            # Feature exports
├─ stores/                   # Zustand stores
│  └─ analysis-store.ts       # Analysis state + persistence
├─ components/               # Shared UI components
├─ api/                      # API client + service modules
├─ lib/                      # Utilities, hooks, i18n, storage
├─ types/                    # TypeScript types & Zod schemas
│  ├─ emotion.ts             # Emotion types
│  └─ validators.ts          # Zod validation schemas
├─ debug/                    # Debug/testing components
│  └─ store-tester.tsx        # Manual QA for store
└─ assets/
```

## 3. State Ownership

### Zustand Store (Client State)
**Store**: `src/stores/analysis-store.ts`

**State**:
```typescript
{
  currentImageUri: string | null;
  isAnalyzing: boolean;
  currentResult: EmotionResult | null;
  history: EmotionResult[];        // Persisted, max 10 items
  isPro: boolean;
  dailyUsageCount: number;
  lastResetDate: string | null;    // ISO date for daily reset tracking
}
```

**Actions**:
- `setImageUri(uri: string | null)` - Set current image
- `setAnalyzing(status: boolean)` - Toggle analyzing state
- `saveResult(result: EmotionResult)` - Save to current + history
- `clearCurrentResult()` - Clear current result
- `clearHistory()` - Clear all history
- `setPro(isPro: boolean)` - Set Pro status
- `incrementUsage()` - Increment daily usage counter
- `resetDailyUsage()` - Reset usage counter (called on new day)
- `reset()` - Reset entire store

**Persistence**:
- Uses `zustand/middleware` persist
- Storage: MMKV (React Native) with localStorage fallback (Web)
- Key: `'feli-analysis-storage'`
- Persisted fields: `history`, `isPro`, `dailyUsageCount`, `lastResetDate`

### TanStack Query (Server State)
**Hook**: `src/features/analysis/use-analyze.ts`

**Mutation**: POST `/api/v1/analyze`
- Automatically updates `analysis-store` on success
- Handles loading state synchronization
- Error handling with proper typing

**Future queries**:
- Subscription status (RevenueCat integration)
- User profile/settings

## 4. API Contract

### POST /api/v1/analyze

**Request** (`multipart/form-data` or JSON):
```typescript
{
  image?: File;              // multipart: jpeg/png file
  image_base64?: string;     // JSON: base64 encoded image
  deviceId?: string;         // Optional device identifier
  isPro?: boolean;           // User subscription status
  timestamp?: string;        // ISO 8601 timestamp
}
```

**Response** (200 OK):
```typescript
EmotionResult {
  result_id: string;
  primary_emotion: EmotionScore;
  secondary_emotion?: EmotionScore | null;
  reasoning: string[];         // 1-6 bullet points
  suggestions: string[];       // 1-4 suggestions
  confidence_note?: 'low' | 'medium' | 'high';  // Free tier only
  disclaimer: string;
  meta: {
    visibility: 'clear' | 'partial' | 'occluded';
    face_coverage?: number;    // 0.0 - 1.0
    created_at?: string;       // ISO timestamp
    model_version?: string;
  };
}
```

**Errors**:
- `400 Bad Request`: Invalid image or no cat face detected
  ```json
  { "error": "no_clear_cat", "message": "No clear cat face detected." }
  ```
- `429 Too Many Requests`: Rate limit exceeded (free tier)
- `500 Internal Server Error`: Server processing error

## 5. Implementation Details

### analysis-store Integration
The store provides automatic daily usage reset logic:
```typescript
// On app mount, check if day changed and reset counter
const checkAndResetDaily = () => {
  const today = new Date().toISOString().split('T')[0];
  if (lastResetDate !== today) {
    resetDailyUsage();
  }
};
```

### use-analyze Hook
React Query mutation that:
1. Validates input with Zod schema
2. Calls API endpoint
3. On success: updates `analysis-store.saveResult()`
4. On error: provides typed error handling
5. Manages loading state via store

### Debug Tools
- **store-tester.tsx**: Manual QA component
  - View current store state
  - Test all store actions
  - Simulate analysis flow
  - Clear/reset store

- **app/debug.tsx**: Debug page route
  - Access at `/debug` in dev mode
  - Render StoreTester component
  - Additional dev tools as needed

## 6. Acceptance Criteria

✅ **Types & Validation**:
- `src/types/emotion.ts` exists with TypeScript types
- `src/types/validators.ts` exists with Zod schemas
- All types compile without errors

✅ **State Management**:
- `src/stores/analysis-store.ts` exports `use-analysis-store`
- Store persists `history`, `isPro`, `dailyUsageCount` via MMKV
- History capped at 10 most recent items
- Daily usage auto-resets on date change

✅ **API Integration**:
- `src/features/analysis/use-analyze.ts` implements mutation hook
- Hook integrates with `analysis-store`
- Proper error handling and validation

✅ **Debug/QA**:
- `src/debug/store-tester.tsx` loads and renders
- Can manually set image URI and save results
- `src/app/debug.tsx` accessible in dev mode
- All store actions testable via UI

## 7. Notes & Best Practices

- **History Management**: FIFO queue, newest results first
- **Validation**: Always validate server responses with Zod
- **Error Handling**: Use typed errors from axios/react-query
- **Persistence**: MMKV for performance, localStorage as web fallback
- **State Updates**: Immutable updates via Zustand (Immer middleware optional)
- **Testing**: Use debug tools for manual QA before E2E tests
- **Type Safety**: Leverage TypeScript + Zod for runtime safety

## 8. Future Enhancements

- Analytics integration (track usage patterns)
- Offline queue for failed analyses
- Export history to PDF/Share
- Cloud sync for Pro users
- A/B testing for UI variants
