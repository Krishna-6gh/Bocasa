export const POSTGRES_SCHEMA_DDL = `-- ============================================================================
-- MARGINGUARD PRODUCTION POSTGRESQL SCHEMA
-- Five Decoupled Layers Shared Repository
-- ============================================================================

-- 1. Sellers and Authentication
CREATE TABLE IF NOT EXISTS sellers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    gstin VARCHAR(15),
    plan_tier VARCHAR(50) DEFAULT 'pro_monthly', -- Razorpay subscription tier
    razorpay_customer_id VARCHAR(100),
    razorpay_subscription_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Marketplace Credentials & OAuth Tokens (Encrypted at Rest via pgcrypto / KMS)
CREATE TABLE IF NOT EXISTS marketplace_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL, -- 'amazon', 'flipkart', 'meesho_fynd'
    encrypted_refresh_token TEXT NOT NULL,
    encrypted_access_token TEXT,
    token_expires_at TIMESTAMP WITH TIME ZONE,
    seller_marketplace_id VARCHAR(100) NOT NULL, -- Amazon Merchant ID or Flipkart Seller ID
    is_active BOOLEAN DEFAULT TRUE,
    sync_status VARCHAR(50) DEFAULT 'HEALTHY', -- 'HEALTHY', 'DEGRADED', 'TOKEN_EXPIRED'
    last_synced_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seller_id, platform)
);

-- 3. Core Product & SKU Master
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_id UUID REFERENCES sellers(id) ON DELETE CASCADE,
    sku VARCHAR(100) NOT NULL,
    title VARCHAR(500) NOT NULL,
    category VARCHAR(50) NOT NULL, -- 'electronics', 'apparel', 'home_kitchen', etc.
    landed_cost NUMERIC(10,2) NOT NULL, -- True cost to produce / purchase & box
    min_margin NUMERIC(10,2) NOT NULL, -- Absolute bottom profit floor seller requires
    target_margin NUMERIC(10,2) NOT NULL, -- Target margin under normal conditions
    mrp NUMERIC(10,2) NOT NULL,
    gst_rate NUMERIC(4,2) NOT NULL DEFAULT 18.00,
    sales_tier VARCHAR(20) DEFAULT 'tier1_fast', -- 'tier1_fast' (1-2h), 'tier2_standard' (1-2x/day)
    asin VARCHAR(20),
    fsn VARCHAR(30),
    meesho_pid VARCHAR(50),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(seller_id, sku)
);

-- 4. Dynamic Platform Fee Tables (Editable per Platform x Category)
CREATE TABLE IF NOT EXISTS platform_fee_matrix (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    platform VARCHAR(50) NOT NULL,
    category VARCHAR(50) NOT NULL,
    commission_pct NUMERIC(5,2) NOT NULL,
    logistics_fee NUMERIC(10,2) NOT NULL,
    closing_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    pick_pack_fee NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    gst_slab NUMERIC(4,2) NOT NULL DEFAULT 18.00,
    effective_from DATE NOT NULL DEFAULT CURRENT_DATE,
    notes TEXT,
    UNIQUE(platform, category, effective_from)
);

-- 5. Collector Layer: Seller-Pasted Competitor Target URLs (Restrained scraping)
CREATE TABLE IF NOT EXISTS competitor_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    competitor_url TEXT NOT NULL,
    competitor_seller_name VARCHAR(255),
    polling_frequency_minutes INT DEFAULT 60,
    is_active BOOLEAN DEFAULT TRUE,
    last_polled_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Time-Series Scraped Competitor Price History
CREATE TABLE IF NOT EXISTS price_snapshots (
    id BIGSERIAL PRIMARY KEY,
    competitor_source_id UUID REFERENCES competitor_sources(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    scraped_price NUMERIC(10,2) NOT NULL,
    in_stock BOOLEAN NOT NULL DEFAULT TRUE,
    fulfillment_type VARCHAR(50),
    seller_rating NUMERIC(3,2),
    is_buybox_winner BOOLEAN DEFAULT FALSE,
    scraped_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
CREATE INDEX idx_price_snapshots_lookup ON price_snapshots(product_id, scraped_at DESC);

-- 7. Decision Engine Records & AI Explanations
CREATE TABLE IF NOT EXISTS repricing_decisions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    platform VARCHAR(50) NOT NULL,
    competitor_price NUMERIC(10,2) NOT NULL,
    computed_floor_price NUMERIC(10,2) NOT NULL,
    recommended_price NUMERIC(10,2) NOT NULL,
    action_taken VARCHAR(50) NOT NULL, -- 'HOLD_AT_FLOOR', 'MATCH', 'UNDERCUT', 'DEMAND_BOOST'
    demand_score INT NOT NULL,
    ai_plain_language_explanation TEXT NOT NULL,
    dispatched_to_marketplace BOOLEAN DEFAULT FALSE,
    marketplace_http_code INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Demand Intelligence Signals (Google Trends & Festivals)
CREATE TABLE IF NOT EXISTS demand_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category VARCHAR(50) NOT NULL,
    google_trends_index INT CHECK (google_trends_index BETWEEN 0 AND 100),
    active_festival_id VARCHAR(100),
    festival_multiplier NUMERIC(4,2) DEFAULT 1.00,
    recorded_date DATE NOT NULL DEFAULT CURRENT_DATE
);
`;

export const BULLMQ_QUEUE_ARCHITECTURE = `// ============================================================================
// REDIS + BULLMQ WORKER QUEUES (Layer 1 Polling & Layer 4 Distribution)
// ============================================================================

import { Queue, Worker, QueueScheduler } from 'bullmq';
import IORedis from 'ioredis';

const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null,
  enableReadyCheck: false,
});

// Queue 1: Tiered Competitor Price Polling Cadence
export const pricePollQueue = new Queue('competitor-price-poll', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 30000 }, // 30s exponential backoff on proxy 429s
    removeOnComplete: 1000,
    removeOnFail: 5000,
  },
});

// Scheduling:
// Tier 1 Fast-Moving SKUs -> repeat: { cron: '0 */1 * * *' } (Every 1 hour)
// Tier 2 Standard SKUs    -> repeat: { cron: '0 8,20 * * *' } (2x / day at 08:00 & 20:00)

// Queue 2: Marketplace Price Dispatch (Graceful isolated retries per platform)
export const distributionQueue = new Queue('marketplace-price-push', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: 'exponential', delay: 15000 },
    removeOnComplete: true,
  },
});
`;
