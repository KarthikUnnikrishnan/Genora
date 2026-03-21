-- ═══════════════════════════════════════════
-- Genora Database Schema
-- Run this in Supabase SQL Editor
-- ═══════════════════════════════════════════

CREATE TABLE IF NOT EXISTS medicines (
    id                    SERIAL PRIMARY KEY,
    product_name          TEXT NOT NULL,
    sub_category          TEXT,
    salt_composition      TEXT,
    dosage_form           TEXT,
    price                 NUMERIC(10, 2),
    price_available       BOOLEAN DEFAULT TRUE,
    manufacturer          TEXT,
    is_discontinued       BOOLEAN DEFAULT FALSE,
    description           TEXT,
    uses                  TEXT,
    side_effects          TEXT,
    drug_interactions     TEXT,   -- stored as JSON string
    drug_interaction_count INTEGER DEFAULT 0,
    image_url             TEXT,
    review_excellent_pct  NUMERIC(5, 2),
    review_average_pct    NUMERIC(5, 2),
    review_poor_pct       NUMERIC(5, 2),
    created_at            TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
    id             SERIAL PRIMARY KEY,
    medicine_id    INTEGER REFERENCES medicines(id) ON DELETE CASCADE,
    ingredient_name TEXT NOT NULL,
    dosage         TEXT
);

-- Indexes for fast search
CREATE INDEX IF NOT EXISTS idx_medicines_name     ON medicines USING GIN (to_tsvector('english', product_name));
CREATE INDEX IF NOT EXISTS idx_medicines_salt     ON medicines (salt_composition);
CREATE INDEX IF NOT EXISTS idx_medicines_category ON medicines (sub_category);
CREATE INDEX IF NOT EXISTS idx_medicines_price    ON medicines (price);
CREATE INDEX IF NOT EXISTS idx_ingredients_med    ON ingredients (medicine_id);

-- ═══════════════════════════════════════════
-- HOW TO IMPORT CSVs
-- ═══════════════════════════════════════════
-- 1. Go to Supabase → Table Editor → medicines
-- 2. Click "Insert" → "Import CSV"
-- 3. Upload master_medicines_fixed.csv
-- 4. Map columns exactly as named above
-- 5. Click Import
--
-- OR use psql:
-- \COPY medicines(product_name,sub_category,salt_composition,dosage_form,price,
--   price_available,manufacturer,is_discontinued,description,uses,side_effects,
--   drug_interactions,drug_interaction_count,image_url,review_excellent_pct,
--   review_average_pct,review_poor_pct)
-- FROM 'master_medicines_fixed.csv' DELIMITER ',' CSV HEADER;
