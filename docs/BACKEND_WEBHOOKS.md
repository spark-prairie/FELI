# RevenueCat Webhook Integration Guide

This document outlines the backend webhook architecture for syncing subscription status from RevenueCat to your backend database.

## Table of Contents

- [Overview](#overview)
- [Webhook Endpoint](#webhook-endpoint)
- [Event Types](#event-types)
- [Security](#security)
- [Database Schema](#database-schema)
- [Implementation Flow](#implementation-flow)
- [Error Handling](#error-handling)
- [Testing](#testing)

---

## Overview

RevenueCat sends webhook events whenever a user's subscription status changes. Your backend must:

1. **Receive** webhook events at a dedicated endpoint
2. **Verify** the authenticity of incoming requests
3. **Parse** the event payload
4. **Update** the database with the user's current entitlement status
5. **Respond** with appropriate HTTP status codes

This ensures the backend always has an up-to-date, single source of truth for user entitlements.

---

## Webhook Endpoint

### Endpoint Specification

```
POST /api/v1/webhooks/revenuecat
```

### Request Headers

```http
POST /api/v1/webhooks/revenuecat HTTP/1.1
Host: api.yourapp.com
Content-Type: application/json
X-RevenueCat-Event-Type: INITIAL_PURCHASE
Authorization: Bearer YOUR_REVENUECAT_WEBHOOK_SECRET
```

### Expected Response

```http
HTTP/1.1 200 OK
Content-Type: application/json

{
  "status": "ok",
  "message": "Event processed successfully"
}
```

---

## Event Types

RevenueCat sends various event types. Handle the following critical events:

### 1. **INITIAL_PURCHASE**
- **When**: User completes their first subscription purchase
- **Action**: Set `is_pro = true` in database
- **Notes**: May include trial information

```json
{
  "event": {
    "type": "INITIAL_PURCHASE",
    "app_user_id": "user_12345",
    "product_id": "pro_monthly",
    "period_type": "NORMAL",
    "purchased_at_ms": 1234567890000,
    "expiration_at_ms": 1237159890000,
    "store": "APP_STORE"
  }
}
```

### 2. **RENEWAL**
- **When**: Subscription auto-renews successfully
- **Action**: Update `subscription_expires_at`, ensure `is_pro = true`
- **Notes**: Confirms ongoing access

```json
{
  "event": {
    "type": "RENEWAL",
    "app_user_id": "user_12345",
    "product_id": "pro_monthly",
    "expiration_at_ms": 1239751890000,
    "is_trial_conversion": false
  }
}
```

### 3. **CANCELLATION**
- **When**: User cancels subscription (but may still have access until expiration)
- **Action**: Set `subscription_will_renew = false`
- **Notes**: Do NOT immediately revoke access; wait for EXPIRATION event

```json
{
  "event": {
    "type": "CANCELLATION",
    "app_user_id": "user_12345",
    "cancelled_at_ms": 1234567890000,
    "expiration_at_ms": 1237159890000
  }
}
```

### 4. **EXPIRATION**
- **When**: Subscription expires without renewal
- **Action**: Set `is_pro = false`, update `subscription_expires_at`
- **Notes**: User loses Pro access immediately

```json
{
  "event": {
    "type": "EXPIRATION",
    "app_user_id": "user_12345",
    "expiration_at_ms": 1237159890000,
    "expiration_reason": "UNSUBSCRIBE"
  }
}
```

### 5. **BILLING_ISSUE**
- **When**: Payment fails during renewal
- **Action**: Mark `billing_issue = true`, send alert to user
- **Notes**: Give user grace period; don't immediately revoke

```json
{
  "event": {
    "type": "BILLING_ISSUE",
    "app_user_id": "user_12345",
    "grace_period_expires_at_ms": 1237159890000
  }
}
```

### 6. **PRODUCT_CHANGE**
- **When**: User upgrades/downgrades plan
- **Action**: Update `product_id`, adjust entitlements
- **Notes**: May be immediate or at next billing cycle

```json
{
  "event": {
    "type": "PRODUCT_CHANGE",
    "app_user_id": "user_12345",
    "new_product_id": "pro_annual",
    "old_product_id": "pro_monthly"
  }
}
```

---

## Security

### Webhook Authentication

RevenueCat provides two authentication methods:

#### Option 1: Bearer Token (Recommended)

Configure a secret token in RevenueCat dashboard:

```javascript
// Verify Authorization header
const authHeader = req.headers.authorization;
const expectedToken = process.env.REVENUECAT_WEBHOOK_SECRET;

if (authHeader !== `Bearer ${expectedToken}`) {
  return res.status(401).json({ error: 'Unauthorized' });
}
```

#### Option 2: Signature Verification

Use the `X-RevenueCat-Signature` header with HMAC validation:

```javascript
const crypto = require('crypto');

function verifyWebhookSignature(payload, signature, secret) {
  const hmac = crypto.createHmac('sha256', secret);
  const digest = hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(digest)
  );
}

// Usage
const rawBody = req.rawBody; // Must be raw, unparsed body
const signature = req.headers['x-revenuecat-signature'];
const isValid = verifyWebhookSignature(rawBody, signature, process.env.WEBHOOK_SECRET);
```

### Best Practices

1. **Always verify signatures** - Never trust unsigned requests
2. **Use HTTPS only** - Configure webhook URL with TLS
3. **Rate limiting** - Prevent abuse (allow ~100 req/min from RevenueCat)
4. **IP whitelisting** (optional) - Restrict to RevenueCat's IPs
5. **Log all events** - Keep audit trail for debugging

---

## Database Schema

### Users Table

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  app_user_id VARCHAR(255) UNIQUE NOT NULL,  -- RevenueCat App User ID
  email VARCHAR(255),
  is_pro BOOLEAN DEFAULT FALSE,
  subscription_product_id VARCHAR(100),
  subscription_expires_at TIMESTAMP,
  subscription_will_renew BOOLEAN DEFAULT FALSE,
  billing_issue BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_app_user_id ON users(app_user_id);
```

### Webhook Events Table (Optional, for audit)

```sql
CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE,  -- For idempotency
  event_type VARCHAR(50) NOT NULL,
  app_user_id VARCHAR(255),
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_app_user_id ON webhook_events(app_user_id);
```

---

## Implementation Flow

### High-Level Flow

```
RevenueCat Event Triggered
        ↓
POST /api/v1/webhooks/revenuecat
        ↓
Verify Authorization Header
        ↓
Check Idempotency (event_id)
        ↓
Parse event.type and event.app_user_id
        ↓
Route to Event Handler
        ↓
Update Database (users table)
        ↓
Log Event (webhook_events table)
        ↓
Return 200 OK
```

### Pseudo-Code Logic

```javascript
async function handleWebhook(req, res) {
  // 1. Verify authentication
  if (!verifyAuth(req.headers.authorization)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  // 2. Parse event
  const { event } = req.body;
  const { type, app_user_id, event_id } = event;

  // 3. Check idempotency
  const exists = await db.checkEventExists(event_id);
  if (exists) {
    return res.status(200).json({ status: 'ok', message: 'Event already processed' });
  }

  // 4. Route to handler
  switch (type) {
    case 'INITIAL_PURCHASE':
      await handleInitialPurchase(event);
      break;
    case 'RENEWAL':
      await handleRenewal(event);
      break;
    case 'EXPIRATION':
      await handleExpiration(event);
      break;
    case 'CANCELLATION':
      await handleCancellation(event);
      break;
    case 'BILLING_ISSUE':
      await handleBillingIssue(event);
      break;
    default:
      console.log(`Unhandled event type: ${type}`);
  }

  // 5. Log event
  await db.logWebhookEvent(event);

  // 6. Respond
  return res.status(200).json({ status: 'ok' });
}
```

---

## Error Handling

### Retry Logic

RevenueCat will retry failed webhooks with exponential backoff:

- **1st retry**: After 5 minutes
- **2nd retry**: After 1 hour
- **3rd retry**: After 24 hours

**Important**: Always return 200 OK for successfully processed events, even if the event doesn't require action.

### Error Response Examples

#### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Invalid webhook secret"
}
```

#### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Missing required field: app_user_id"
}
```

#### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Database connection failed"
}
```

### Idempotency

Always check if an event has been processed before:

```javascript
async function isEventProcessed(eventId) {
  const result = await db.query(
    'SELECT id FROM webhook_events WHERE event_id = $1',
    [eventId]
  );
  return result.rows.length > 0;
}
```

---

## Testing

### Test Event Payloads

Use RevenueCat's dashboard to send test webhooks, or use these example payloads:

#### Test INITIAL_PURCHASE

```bash
curl -X POST https://api.yourapp.com/api/v1/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "event": {
      "type": "INITIAL_PURCHASE",
      "app_user_id": "test_user_123",
      "product_id": "pro_monthly",
      "period_type": "NORMAL",
      "purchased_at_ms": 1234567890000,
      "expiration_at_ms": 1237159890000,
      "store": "APP_STORE",
      "event_timestamp_ms": 1234567890000
    }
  }'
```

#### Test EXPIRATION

```bash
curl -X POST https://api.yourapp.com/api/v1/webhooks/revenuecat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_SECRET" \
  -d '{
    "event": {
      "type": "EXPIRATION",
      "app_user_id": "test_user_123",
      "expiration_at_ms": 1237159890000,
      "expiration_reason": "UNSUBSCRIBE",
      "event_timestamp_ms": 1237159890000
    }
  }'
```

### Verification Checklist

- [ ] Webhook endpoint is accessible via HTTPS
- [ ] Authorization header is verified
- [ ] Idempotency is implemented
- [ ] Database updates correctly for each event type
- [ ] 200 OK is returned for valid requests
- [ ] Errors are logged for debugging
- [ ] Retry logic handles temporary failures

---

## Production Deployment

### Environment Variables

```bash
# .env
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret_here
DATABASE_URL=postgresql://user:pass@host:5432/dbname
```

### RevenueCat Dashboard Configuration

1. Navigate to **Project Settings** → **Webhooks**
2. Add webhook URL: `https://api.yourapp.com/api/v1/webhooks/revenuecat`
3. Set Authorization: `Bearer YOUR_SECRET`
4. Enable events: `INITIAL_PURCHASE`, `RENEWAL`, `EXPIRATION`, `CANCELLATION`, `BILLING_ISSUE`
5. Save and test with sample event

### Monitoring

- Monitor webhook response times (should be < 2s)
- Set up alerts for 4xx/5xx errors
- Track failed events for manual review
- Log all events for audit compliance

---

## References

- [RevenueCat Webhooks Documentation](https://www.revenuecat.com/docs/webhooks)
- [RevenueCat Event Types](https://www.revenuecat.com/docs/webhooks/event-types)
- [Security Best Practices](https://www.revenuecat.com/docs/webhooks/security)

---

**Last Updated**: 2025-12-29
**Version**: 1.0.0
