/**
 * RevenueCat Webhook Handler - Sample Implementation
 *
 * This is a production-ready example of a webhook endpoint that:
 * - Receives RevenueCat subscription events
 * - Verifies webhook authenticity
 * - Updates user entitlements in the database
 * - Implements idempotency and error handling
 *
 * Stack: Node.js + Express + PostgreSQL
 *
 * To use this sample:
 * 1. Install dependencies: npm install express pg dotenv
 * 2. Set environment variables (see .env.example below)
 * 3. Deploy to your backend server
 * 4. Configure webhook URL in RevenueCat dashboard
 */

const express = require('express');
const { Pool } = require('pg');
require('dotenv').config();

// ============================================================================
// Configuration
// ============================================================================

const app = express();
const PORT = process.env.PORT || 3000;

// PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

// Middleware to parse JSON bodies
app.use(express.json());

// ============================================================================
// Authentication Middleware
// ============================================================================

/**
 * Verify RevenueCat webhook authentication
 * Uses Bearer token from Authorization header
 */
function verifyWebhookAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const expectedToken = process.env.REVENUECAT_WEBHOOK_SECRET;

  if (!expectedToken) {
    console.error('[Webhook] REVENUECAT_WEBHOOK_SECRET not configured');
    return res.status(500).json({
      error: 'Server misconfiguration',
      message: 'Webhook secret not configured'
    });
  }

  if (authHeader !== `Bearer ${expectedToken}`) {
    console.warn('[Webhook] Unauthorized request received');
    return res.status(401).json({
      error: 'Unauthorized',
      message: 'Invalid webhook secret'
    });
  }

  next();
}

// ============================================================================
// Database Helper Functions
// ============================================================================

/**
 * Check if an event has already been processed (idempotency)
 */
async function isEventProcessed(eventId) {
  try {
    const result = await pool.query(
      'SELECT id FROM webhook_events WHERE event_id = $1',
      [eventId]
    );
    return result.rows.length > 0;
  } catch (error) {
    console.error('[DB] Error checking event idempotency:', error);
    throw error;
  }
}

/**
 * Log webhook event for audit trail
 */
async function logWebhookEvent(event) {
  try {
    await pool.query(
      `INSERT INTO webhook_events (event_id, event_type, app_user_id, payload, processed, created_at)
       VALUES ($1, $2, $3, $4, $5, NOW())
       ON CONFLICT (event_id) DO NOTHING`,
      [
        event.id || `${event.type}_${event.app_user_id}_${Date.now()}`,
        event.type,
        event.app_user_id,
        JSON.stringify(event),
        true,
      ]
    );
  } catch (error) {
    console.error('[DB] Error logging webhook event:', error);
    // Don't throw - logging failure shouldn't block webhook processing
  }
}

/**
 * Get user by RevenueCat app_user_id
 * Creates user if doesn't exist
 */
async function getOrCreateUser(appUserId) {
  try {
    // Try to get existing user
    let result = await pool.query(
      'SELECT * FROM users WHERE app_user_id = $1',
      [appUserId]
    );

    if (result.rows.length > 0) {
      return result.rows[0];
    }

    // Create new user if doesn't exist
    result = await pool.query(
      `INSERT INTO users (app_user_id, is_pro, created_at, updated_at)
       VALUES ($1, $2, NOW(), NOW())
       RETURNING *`,
      [appUserId, false]
    );

    console.log(`[DB] Created new user: ${appUserId}`);
    return result.rows[0];
  } catch (error) {
    console.error('[DB] Error getting/creating user:', error);
    throw error;
  }
}

/**
 * Update user's Pro status
 */
async function updateUserProStatus(appUserId, updates) {
  try {
    const {
      isPro,
      productId,
      expiresAt,
      willRenew,
      billingIssue,
    } = updates;

    await pool.query(
      `UPDATE users
       SET is_pro = $1,
           subscription_product_id = $2,
           subscription_expires_at = $3,
           subscription_will_renew = $4,
           billing_issue = $5,
           updated_at = NOW()
       WHERE app_user_id = $6`,
      [
        isPro,
        productId || null,
        expiresAt ? new Date(expiresAt) : null,
        willRenew !== undefined ? willRenew : true,
        billingIssue !== undefined ? billingIssue : false,
        appUserId,
      ]
    );

    console.log(`[DB] Updated user ${appUserId}: is_pro=${isPro}`);
  } catch (error) {
    console.error('[DB] Error updating user:', error);
    throw error;
  }
}

// ============================================================================
// Event Handlers
// ============================================================================

/**
 * Handle INITIAL_PURCHASE event
 * User completed their first subscription purchase
 */
async function handleInitialPurchase(event) {
  console.log(`[Event] INITIAL_PURCHASE for user: ${event.app_user_id}`);

  await getOrCreateUser(event.app_user_id);
  await updateUserProStatus(event.app_user_id, {
    isPro: true,
    productId: event.product_id,
    expiresAt: event.expiration_at_ms,
    willRenew: true,
    billingIssue: false,
  });

  // Optional: Send welcome email or push notification
  // await sendWelcomeEmail(event.app_user_id);
}

/**
 * Handle RENEWAL event
 * Subscription successfully renewed
 */
async function handleRenewal(event) {
  console.log(`[Event] RENEWAL for user: ${event.app_user_id}`);

  await getOrCreateUser(event.app_user_id);
  await updateUserProStatus(event.app_user_id, {
    isPro: true,
    productId: event.product_id,
    expiresAt: event.expiration_at_ms,
    willRenew: true,
    billingIssue: false,
  });
}

/**
 * Handle CANCELLATION event
 * User cancelled subscription (but may have access until expiration)
 */
async function handleCancellation(event) {
  console.log(`[Event] CANCELLATION for user: ${event.app_user_id}`);

  // Don't immediately revoke Pro access - wait for expiration
  await getOrCreateUser(event.app_user_id);
  await updateUserProStatus(event.app_user_id, {
    isPro: true, // Keep Pro until expiration
    productId: event.product_id,
    expiresAt: event.expiration_at_ms,
    willRenew: false, // Won't renew
    billingIssue: false,
  });

  // Optional: Send cancellation email
  // await sendCancellationEmail(event.app_user_id);
}

/**
 * Handle EXPIRATION event
 * Subscription expired - revoke Pro access
 */
async function handleExpiration(event) {
  console.log(`[Event] EXPIRATION for user: ${event.app_user_id}`);

  await getOrCreateUser(event.app_user_id);
  await updateUserProStatus(event.app_user_id, {
    isPro: false, // Revoke Pro access
    productId: null,
    expiresAt: event.expiration_at_ms,
    willRenew: false,
    billingIssue: false,
  });

  // Optional: Send re-engagement email
  // await sendReEngagementEmail(event.app_user_id);
}

/**
 * Handle BILLING_ISSUE event
 * Payment failed during renewal
 */
async function handleBillingIssue(event) {
  console.log(`[Event] BILLING_ISSUE for user: ${event.app_user_id}`);

  await getOrCreateUser(event.app_user_id);
  await updateUserProStatus(event.app_user_id, {
    isPro: true, // Keep Pro during grace period
    productId: event.product_id,
    expiresAt: event.grace_period_expires_at_ms || event.expiration_at_ms,
    willRenew: true,
    billingIssue: true, // Flag billing issue
  });

  // Optional: Send payment retry notification
  // await sendBillingIssueAlert(event.app_user_id);
}

/**
 * Handle PRODUCT_CHANGE event
 * User upgraded/downgraded their subscription
 */
async function handleProductChange(event) {
  console.log(`[Event] PRODUCT_CHANGE for user: ${event.app_user_id}`);

  await getOrCreateUser(event.app_user_id);
  await updateUserProStatus(event.app_user_id, {
    isPro: true,
    productId: event.new_product_id,
    expiresAt: event.expiration_at_ms,
    willRenew: true,
    billingIssue: false,
  });
}

// ============================================================================
// Webhook Endpoint
// ============================================================================

/**
 * Main webhook handler
 * POST /api/v1/webhooks/revenuecat
 */
app.post('/api/v1/webhooks/revenuecat', verifyWebhookAuth, async (req, res) => {
  try {
    const { event } = req.body;

    if (!event || !event.type || !event.app_user_id) {
      console.warn('[Webhook] Invalid payload received:', req.body);
      return res.status(400).json({
        error: 'Bad Request',
        message: 'Missing required fields: event.type or event.app_user_id',
      });
    }

    const { type, app_user_id } = event;
    const eventId = event.id || `${type}_${app_user_id}_${Date.now()}`;

    console.log(`[Webhook] Received ${type} event for user: ${app_user_id}`);

    // Check idempotency - don't process duplicate events
    const alreadyProcessed = await isEventProcessed(eventId);
    if (alreadyProcessed) {
      console.log(`[Webhook] Event ${eventId} already processed, skipping`);
      return res.status(200).json({
        status: 'ok',
        message: 'Event already processed',
      });
    }

    // Route to appropriate handler
    switch (type) {
      case 'INITIAL_PURCHASE':
        await handleInitialPurchase(event);
        break;

      case 'RENEWAL':
        await handleRenewal(event);
        break;

      case 'CANCELLATION':
        await handleCancellation(event);
        break;

      case 'EXPIRATION':
        await handleExpiration(event);
        break;

      case 'BILLING_ISSUE':
        await handleBillingIssue(event);
        break;

      case 'PRODUCT_CHANGE':
        await handleProductChange(event);
        break;

      case 'NON_RENEWING_PURCHASE':
      case 'UNCANCELLATION':
      case 'TRANSFER':
        // Handle other event types as needed
        console.log(`[Webhook] Received ${type} event, no action taken`);
        break;

      default:
        console.warn(`[Webhook] Unhandled event type: ${type}`);
    }

    // Log event for audit trail
    await logWebhookEvent({ ...event, id: eventId });

    // Always return 200 OK for successfully processed events
    return res.status(200).json({
      status: 'ok',
      message: 'Event processed successfully',
      event_type: type,
    });

  } catch (error) {
    console.error('[Webhook] Error processing webhook:', error);

    // Return 500 to trigger RevenueCat retry
    return res.status(500).json({
      error: 'Internal Server Error',
      message: 'Failed to process webhook event',
    });
  }
});

// ============================================================================
// Health Check Endpoint
// ============================================================================

app.get('/health', async (req, res) => {
  try {
    // Check database connection
    await pool.query('SELECT 1');
    res.status(200).json({ status: 'healthy', database: 'connected' });
  } catch (error) {
    res.status(503).json({ status: 'unhealthy', database: 'disconnected' });
  }
});

// ============================================================================
// Server Startup
// ============================================================================

app.listen(PORT, () => {
  console.log(`[Server] Webhook server running on port ${PORT}`);
  console.log(`[Server] Health check: http://localhost:${PORT}/health`);
  console.log(`[Server] Webhook endpoint: http://localhost:${PORT}/api/v1/webhooks/revenuecat`);
});

// ============================================================================
// Graceful Shutdown
// ============================================================================

process.on('SIGTERM', async () => {
  console.log('[Server] SIGTERM received, closing connections...');
  await pool.end();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('[Server] SIGINT received, closing connections...');
  await pool.end();
  process.exit(0);
});

// ============================================================================
// Example .env file
// ============================================================================

/*
# .env.example

# Server Configuration
PORT=3000
NODE_ENV=production

# Database
DATABASE_URL=postgresql://username:password@localhost:5432/feli_db

# RevenueCat Webhook
REVENUECAT_WEBHOOK_SECRET=your_webhook_secret_here

# Optional: Email/Notification Services
SENDGRID_API_KEY=your_sendgrid_key
PUSH_NOTIFICATION_KEY=your_push_key
*/

// ============================================================================
// Database Schema (SQL)
// ============================================================================

/*
-- Users table
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  app_user_id VARCHAR(255) UNIQUE NOT NULL,
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
CREATE INDEX idx_users_is_pro ON users(is_pro);

-- Webhook events table (for idempotency and audit)
CREATE TABLE webhook_events (
  id SERIAL PRIMARY KEY,
  event_id VARCHAR(255) UNIQUE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  app_user_id VARCHAR(255),
  payload JSONB NOT NULL,
  processed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_webhook_events_event_id ON webhook_events(event_id);
CREATE INDEX idx_webhook_events_app_user_id ON webhook_events(app_user_id);
CREATE INDEX idx_webhook_events_created_at ON webhook_events(created_at);
*/
