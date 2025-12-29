# API Security & Backend Integration Guide

This document outlines the security architecture and best practices for the FELI backend API, with a focus on protecting Pro features and preventing unauthorized access to AI analysis endpoints.

## Table of Contents

- [Security Principles](#security-principles)
- [Trust Model](#trust-model)
- [Server-Side Entitlement Enforcement](#server-side-entitlement-enforcement)
- [API Authentication](#api-authentication)
- [Rate Limiting](#rate-limiting)
- [Error Handling](#error-handling)
- [Development vs Production](#development-vs-production)

---

## Security Principles

### 1. **Never Trust the Client**

**Critical Rule**: The client (mobile app) can be manipulated by sophisticated users. Never trust data sent from the client when making access control decisions.

```javascript
// ❌ INSECURE - Client claims to be Pro
app.post('/api/v1/analyze', async (req, res) => {
  const { isPro } = req.body; // Client can fake this!

  if (isPro) {
    // Give full AI response
    return res.json(await getProAnalysis());
  }
});

// ✅ SECURE - Server checks database
app.post('/api/v1/analyze', async (req, res) => {
  const userId = req.user.id; // From verified JWT
  const user = await db.getUserById(userId);

  if (user.is_pro) {
    // Give full AI response based on database truth
    return res.json(await getProAnalysis());
  }
});
```

### 2. **Single Source of Truth**

The **database** is the authoritative source for user entitlements:

```
RevenueCat Webhook → Database → API Decision
        ↓                ↓            ↓
    Real Events   Persisted State   Trusted
```

### 3. **Defense in Depth**

Layer multiple security controls:

1. **Authentication** - Verify user identity
2. **Authorization** - Check entitlements in database
3. **Rate Limiting** - Prevent abuse
4. **Input Validation** - Sanitize all inputs
5. **Logging & Monitoring** - Detect anomalies

---

## Trust Model

### What to Trust

✅ **Database records** - Updated via verified webhooks
✅ **JWT tokens** - Signed by your backend
✅ **RevenueCat webhooks** - After signature verification
✅ **Server-side computed values** - Generated within your backend

### What NOT to Trust

❌ **Client-sent `isPro` flags** - Can be manipulated
❌ **Local storage data** - Can be modified
❌ **Client-computed timestamps** - Can be faked
❌ **Any client-side validation** - Can be bypassed

---

## Server-Side Entitlement Enforcement

### Analysis Endpoint Security

```javascript
/**
 * POST /api/v1/analyze
 * Analyzes a cat photo and returns emotion data
 *
 * Security: Checks user's Pro status in database before
 * returning full analysis
 */
app.post('/api/v1/analyze', authenticateUser, async (req, res) => {
  try {
    const userId = req.user.id; // From JWT middleware
    const { image_base64 } = req.body;

    // 1. Validate input
    if (!image_base64) {
      return res.status(400).json({ error: 'Missing image' });
    }

    // 2. Check rate limits (both Free and Pro users)
    const rateLimitOk = await checkRateLimit(userId);
    if (!rateLimitOk) {
      return res.status(429).json({
        error: 'Rate limit exceeded',
        message: 'Please try again later',
      });
    }

    // 3. Get user's ACTUAL Pro status from database
    const user = await db.query(
      'SELECT is_pro, subscription_expires_at FROM users WHERE id = $1',
      [userId]
    );

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const isPro = user.is_pro && new Date(user.subscription_expires_at) > new Date();

    // 4. Call AI service
    const aiResponse = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: `Analyze this cat photo: ${image_base64}` },
      ],
    });

    const fullAnalysis = JSON.parse(aiResponse.choices[0].message.content);

    // 5. Filter response based on ACTUAL Pro status
    const responseData = isPro
      ? fullAnalysis // Full response for Pro users
      : filterFreeResponse(fullAnalysis); // Limited for Free users

    // 6. Log analytics
    await logAnalysis(userId, isPro);

    return res.json(responseData);

  } catch (error) {
    console.error('Analysis error:', error);
    return res.status(500).json({ error: 'Analysis failed' });
  }
});
```

### Response Filtering Logic

```javascript
/**
 * Filter AI response for Free users
 * Removes Pro-only features:
 * - Exact confidence percentages
 * - Secondary emotion details
 * - Extended reasoning (limit to 3)
 * - Extended suggestions (limit to 2)
 */
function filterFreeResponse(fullAnalysis) {
  return {
    primary_emotion: {
      type: fullAnalysis.primary_emotion.type,
      confidence_percentage: 0, // Hide percentage for Free users
    },
    secondary_emotion: {
      type: 'alert', // Generic placeholder
      confidence_percentage: 0,
    },
    reasoning: fullAnalysis.reasoning.slice(0, 3), // Limit to 3
    suggestions: fullAnalysis.suggestions.slice(0, 2), // Limit to 2
    confidence_note: fullAnalysis.confidence_note,
    disclaimer: fullAnalysis.disclaimer,
    meta: fullAnalysis.meta,
  };
}
```

---

## API Authentication

### JWT-Based Authentication

Use JSON Web Tokens for stateless authentication:

```javascript
const jwt = require('jsonwebtoken');

/**
 * Middleware to verify JWT and extract user
 */
function authenticateUser(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Missing or invalid token' });
  }

  const token = authHeader.substring(7);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // { id, app_user_id, email }
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

/**
 * Login endpoint - issues JWT
 */
app.post('/api/v1/auth/login', async (req, res) => {
  const { app_user_id } = req.body;

  // Verify user exists
  const user = await db.getUserByAppUserId(app_user_id);
  if (!user) {
    return res.status(404).json({ error: 'User not found' });
  }

  // Issue JWT
  const token = jwt.sign(
    { id: user.id, app_user_id: user.app_user_id },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );

  return res.json({ token, user });
});
```

### Token Refresh Strategy

```javascript
/**
 * Refresh access token
 * POST /api/v1/auth/refresh
 */
app.post('/api/v1/auth/refresh', async (req, res) => {
  const { refresh_token } = req.body;

  try {
    const decoded = jwt.verify(refresh_token, process.env.REFRESH_TOKEN_SECRET);

    // Issue new access token
    const accessToken = jwt.sign(
      { id: decoded.id, app_user_id: decoded.app_user_id },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return res.json({ access_token: accessToken });
  } catch (error) {
    return res.status(401).json({ error: 'Invalid refresh token' });
  }
});
```

---

## Rate Limiting

Protect your AI API from abuse with rate limits:

### Free vs Pro Limits

```javascript
const RATE_LIMITS = {
  FREE: {
    daily: 2,    // 2 analyses per day
    hourly: 2,   // 2 per hour
  },
  PRO: {
    daily: 1000,  // 1000 analyses per day
    hourly: 100,  // 100 per hour
  },
};

/**
 * Check if user has exceeded rate limit
 */
async function checkRateLimit(userId) {
  const user = await db.getUserById(userId);
  const isPro = user.is_pro;

  const limits = isPro ? RATE_LIMITS.PRO : RATE_LIMITS.FREE;

  // Check daily limit
  const dailyCount = await redis.get(`daily:${userId}`);
  if (dailyCount && parseInt(dailyCount) >= limits.daily) {
    return false;
  }

  // Check hourly limit
  const hourlyCount = await redis.get(`hourly:${userId}`);
  if (hourlyCount && parseInt(hourlyCount) >= limits.hourly) {
    return false;
  }

  // Increment counters
  await redis.incr(`daily:${userId}`);
  await redis.incr(`hourly:${userId}`);
  await redis.expire(`daily:${userId}`, 86400); // 24 hours
  await redis.expire(`hourly:${userId}`, 3600); // 1 hour

  return true;
}
```

### Implementation with express-rate-limit

```javascript
const rateLimit = require('express-rate-limit');

// Global rate limit (protect against DDoS)
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
  message: 'Too many requests from this IP',
});

// Analysis endpoint rate limit
const analysisLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: async (req) => {
    const user = await db.getUserById(req.user.id);
    return user.is_pro ? 100 : 2;
  },
  message: 'Rate limit exceeded',
  handler: (req, res) => {
    res.status(429).json({
      error: 'Rate limit exceeded',
      message: 'Please upgrade to Pro for higher limits',
    });
  },
});

app.use(globalLimiter);
app.post('/api/v1/analyze', authenticateUser, analysisLimiter, handleAnalysis);
```

---

## Error Handling

### HTTP Status Codes

Use appropriate status codes to communicate errors:

| Status | Meaning | Use Case |
|--------|---------|----------|
| 200 | OK | Request succeeded |
| 400 | Bad Request | Invalid input |
| 401 | Unauthorized | Missing/invalid token |
| 402 | Payment Required | Feature requires Pro |
| 403 | Forbidden | User lacks entitlement |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Server Error | Server error |

### Entitlement Error Example

```javascript
// When Free user tries to access Pro feature
if (!user.is_pro) {
  return res.status(403).json({
    error: 'Forbidden',
    message: 'This feature requires a Pro subscription',
    upgrade_url: 'https://yourapp.com/upgrade',
    code: 'PRO_REQUIRED',
  });
}
```

### Client-Side Handling

```typescript
// Frontend (use-analyze.ts)
onError: (error) => {
  if (error.response?.status === 403) {
    const data = error.response.data;
    if (data.code === 'PRO_REQUIRED') {
      // Redirect to paywall
      router.push('/paywall');
    }
  }
}
```

---

## Development vs Production

### Mock Mode (Development)

```javascript
// In development, use mock data
const USE_MOCK = process.env.NODE_ENV === 'development';

app.post('/api/v1/analyze', async (req, res) => {
  if (USE_MOCK) {
    // Return mock data for testing
    return res.json(MOCK_ANALYSIS_RESULT);
  }

  // Production logic...
});
```

### Environment Variables

```bash
# Development (.env.development)
NODE_ENV=development
USE_MOCK=true
JWT_SECRET=dev_secret_key
DATABASE_URL=postgresql://localhost/feli_dev

# Production (.env.production)
NODE_ENV=production
USE_MOCK=false
JWT_SECRET=<strong_random_secret>
DATABASE_URL=<production_db_url>
REVENUECAT_WEBHOOK_SECRET=<webhook_secret>
OPENAI_API_KEY=<openai_key>
```

### Feature Flags

```javascript
const FEATURE_FLAGS = {
  ENFORCE_ENTITLEMENTS: process.env.NODE_ENV === 'production',
  ENABLE_RATE_LIMITS: process.env.NODE_ENV === 'production',
  LOG_ANALYTICS: true,
};

if (FEATURE_FLAGS.ENFORCE_ENTITLEMENTS) {
  // Check database for Pro status
} else {
  // Allow all features in development
}
```

---

## Security Checklist

### Pre-Production Audit

- [ ] Server validates all user entitlements against database
- [ ] Client-sent `isPro` flags are **ignored** in production
- [ ] JWT tokens are verified on all protected endpoints
- [ ] Rate limiting is enabled for all API endpoints
- [ ] RevenueCat webhook signature verification is implemented
- [ ] Database credentials are stored in environment variables
- [ ] HTTPS is enforced for all API endpoints
- [ ] Error messages don't leak sensitive information
- [ ] Logging captures security events (failed auth, rate limits)
- [ ] Database queries use parameterized statements (SQL injection protection)

### Ongoing Monitoring

- [ ] Monitor failed authentication attempts
- [ ] Track rate limit violations
- [ ] Alert on suspicious activity (many 403s from one user)
- [ ] Review webhook processing errors
- [ ] Audit Pro feature access logs

---

## Architecture Diagram

```
┌─────────────┐
│ Mobile App  │
│ (Client)    │
└──────┬──────┘
       │ 1. POST /analyze (with JWT)
       │    { image_base64, timestamp }
       │    ⚠️  isPro flag is sent but IGNORED
       ▼
┌─────────────────────┐
│  API Gateway        │
│  - Verify JWT       │
│  - Rate Limiting    │
└──────┬──────────────┘
       │ 2. Extract user.id from JWT
       ▼
┌─────────────────────┐
│  Database           │
│  - Get user record  │
│  - Check is_pro     │
│  - Check expires_at │
└──────┬──────────────┘
       │ 3. isPro = true/false (DATABASE TRUTH)
       ▼
┌─────────────────────┐
│  AI Service         │
│  - Call OpenAI      │
│  - Get full result  │
└──────┬──────────────┘
       │ 4. Full analysis
       ▼
┌─────────────────────┐
│  Response Filter    │
│  - If isPro: full   │
│  - If !isPro: limit │
└──────┬──────────────┘
       │ 5. Filtered response
       ▼
┌─────────────┐
│ Mobile App  │
│ (Receives)  │
└─────────────┘
```

---

## Additional Resources

- [OWASP API Security Top 10](https://owasp.org/www-project-api-security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [Rate Limiting Strategies](https://cloud.google.com/architecture/rate-limiting-strategies)

---

**Last Updated**: 2025-12-29
**Version**: 1.0.0
