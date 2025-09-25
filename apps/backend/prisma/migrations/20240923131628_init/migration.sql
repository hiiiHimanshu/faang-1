-- Enable pgcrypto for gen_random_uuid if not already available
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create app_user table
CREATE TABLE "app_user" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "firebase_uid" TEXT UNIQUE NOT NULL,
    "email" TEXT UNIQUE NOT NULL,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Create plaid_item table
CREATE TABLE "plaid_item" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "app_user"("id") ON DELETE CASCADE,
    "plaid_item_id" TEXT UNIQUE NOT NULL,
    "access_token" TEXT NOT NULL,
    "institution_name" TEXT,
    "cursor" TEXT,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Create account table
CREATE TABLE "account" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "app_user"("id") ON DELETE CASCADE,
    "plaid_item_id" UUID REFERENCES "plaid_item"("id") ON DELETE CASCADE,
    "plaid_account_id" TEXT UNIQUE NOT NULL,
    "name" TEXT,
    "official_name" TEXT,
    "mask" TEXT,
    "type" TEXT,
    "subtype" TEXT,
    "currency" TEXT DEFAULT 'USD'
);

-- Create transaction table
CREATE TABLE "transaction" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "app_user"("id") ON DELETE CASCADE,
    "account_id" UUID REFERENCES "account"("id") ON DELETE CASCADE,
    "plaid_txn_id" TEXT UNIQUE NOT NULL,
    "posted_at" DATE,
    "amount" NUMERIC(14,2) NOT NULL,
    "merchant_name" TEXT,
    "raw_category" JSONB,
    "ai_category" TEXT,
    "ai_confidence" NUMERIC(4,3),
    "is_recurring" BOOLEAN DEFAULT FALSE,
    "created_at" TIMESTAMPTZ DEFAULT now()
);

-- Create budget_rule table
CREATE TABLE "budget_rule" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "app_user"("id") ON DELETE CASCADE,
    "category" TEXT NOT NULL,
    "monthly_limit" NUMERIC(14,2) NOT NULL
);

-- Create alert table
CREATE TABLE "alert" (
    "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    "user_id" UUID REFERENCES "app_user"("id") ON DELETE CASCADE,
    "kind" TEXT NOT NULL,
    "payload" JSONB,
    "fired_at" TIMESTAMPTZ DEFAULT now(),
    "read" BOOLEAN DEFAULT FALSE
);
