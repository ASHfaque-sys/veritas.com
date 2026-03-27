-- Migration: Advanced Loan Intelligence Layer
-- Creates tables for banks, products, RBI stats, outcomes, market rates, & rules.

-- 1. Banks
CREATE TABLE banks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    logo_url TEXT,
    type TEXT CHECK (type IN ('PSB', 'Private', 'NBFC', 'HFC', 'NBFC-MFI')),
    headquarters TEXT,
    listed BOOLEAN DEFAULT false,
    rbi_registered BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bank Loan Products
CREATE TABLE bank_loan_products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
    loan_type TEXT NOT NULL, -- personal, business, home, lap, vehicle, etc.
    subtype TEXT,
    min_cibil INT DEFAULT 0,
    max_cibil INT DEFAULT 900,
    min_income NUMERIC,
    max_income NUMERIC,
    min_age INT,
    max_age INT,
    min_tenure_months INT,
    max_tenure_months INT,
    max_foir NUMERIC, -- max allowed FOIR (decimal)
    min_dscr NUMERIC, -- minimum DSCR
    rate_min NUMERIC NOT NULL,
    rate_max NUMERIC NOT NULL,
    rate_type TEXT CHECK (rate_type IN ('fixed', 'floating', 'both')),
    min_amount NUMERIC,
    max_amount NUMERIC,
    processing_fee_pct NUMERIC,
    processing_fee_max NUMERIC,
    prepayment_charges TEXT,
    employment_types TEXT[], -- e.g., ['salaried', 'self-employed']
    collateral_required BOOLEAN DEFAULT false,
    guarantor_required BOOLEAN DEFAULT false,
    geographic_restriction TEXT[],
    turnaround_days INT,
    source_url TEXT,
    last_updated TIMESTAMPTZ DEFAULT now(),
    is_active BOOLEAN DEFAULT true,
    UNIQUE(bank_id, loan_type, subtype)
);

-- 3. RBI Lending Stats
CREATE TABLE rbi_lending_stats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
    month INT NOT NULL,
    year INT NOT NULL,
    personal_loan_outstanding NUMERIC,
    business_loan_outstanding NUMERIC,
    home_loan_outstanding NUMERIC,
    npa_ratio NUMERIC,
    credit_growth_pct NUMERIC,
    data_source TEXT,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(bank_id, month, year)
);

-- 4. Approval Outcomes (Historical dataset for ML)
CREATE TABLE approval_outcomes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
    loan_type TEXT NOT NULL,
    cibil_score INT,
    monthly_income NUMERIC,
    loan_amount NUMERIC,
    foir NUMERIC,
    dscr NUMERIC,
    employment_type TEXT,
    collateral_offered BOOLEAN,
    was_approved BOOLEAN NOT NULL,
    rejection_reason TEXT,
    interest_rate_offered NUMERIC,
    processing_time_days INT,
    created_at TIMESTAMPTZ DEFAULT now()
);
-- Optional vector extension for semantic profile matching (assuming pgvector sits on this table eventually)

-- 5. Lender Reviews
CREATE TABLE lender_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
    loan_type TEXT,
    rating INT CHECK (rating BETWEEN 1 AND 5),
    processing_speed_rating INT CHECK (processing_speed_rating BETWEEN 1 AND 5),
    transparency_rating INT CHECK (transparency_rating BETWEEN 1 AND 5),
    review_text TEXT,
    verified BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 6. Market Rates
CREATE TABLE market_rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    loan_type TEXT NOT NULL,
    repo_rate NUMERIC,
    average_market_rate NUMERIC,
    min_market_rate NUMERIC,
    max_market_rate NUMERIC,
    recorded_date DATE DEFAULT CURRENT_DATE,
    UNIQUE(loan_type, recorded_date)
);

-- 7. Eligibility Rules (Advanced soft/hard rule engine overrides)
CREATE TABLE eligibility_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
    loan_type TEXT NOT NULL,
    rule_type TEXT CHECK (rule_type IN ('hard_cutoff', 'soft_preference')),
    field_name TEXT NOT NULL,
    operator TEXT NOT NULL, -- '>', '<', '>=', '<=', '=', 'IN', 'NIN'
    value JSONB NOT NULL,
    weight NUMERIC DEFAULT 1.0,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 8. Audit & Changelog Tables
CREATE TABLE bank_product_changelog (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_id UUID REFERENCES bank_loan_products(id) ON DELETE CASCADE,
    changed_fields JSONB NOT NULL,
    changed_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE scrape_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    source TEXT NOT NULL,
    rows_updated INT DEFAULT 0,
    rows_inserted INT DEFAULT 0,
    errors JSONB DEFAULT '[]'::jsonb,
    duration_ms INT,
    run_at TIMESTAMPTZ DEFAULT now()
);

-- ─── Triggers & Functions ──────────────────────────────────────────────

-- Trigger function: Auto-update last_updated
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_updated = now();
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER update_bank_products_modtime
    BEFORE UPDATE ON bank_loan_products
    FOR EACH ROW
    EXECUTE PROCEDURE update_modified_column();

-- Trigger function: Audit log for products
CREATE OR REPLACE FUNCTION log_product_changes()
RETURNS TRIGGER AS $$
DECLARE
    changes JSONB;
BEGIN
    changes := jsonb_strip_nulls(
        jsonb_build_object(
            'rate_min', CASE WHEN OLD.rate_min IS DISTINCT FROM NEW.rate_min THEN NEW.rate_min END,
            'rate_max', CASE WHEN OLD.rate_max IS DISTINCT FROM NEW.rate_max THEN NEW.rate_max END,
            'min_cibil', CASE WHEN OLD.min_cibil IS DISTINCT FROM NEW.min_cibil THEN NEW.min_cibil END,
            'max_foir', CASE WHEN OLD.max_foir IS DISTINCT FROM NEW.max_foir THEN NEW.max_foir END,
            'processing_fee_pct', CASE WHEN OLD.processing_fee_pct IS DISTINCT FROM NEW.processing_fee_pct THEN NEW.processing_fee_pct END,
            'is_active', CASE WHEN OLD.is_active IS DISTINCT FROM NEW.is_active THEN NEW.is_active END
        )
    );
    
    IF changes != '{}'::jsonb THEN
        INSERT INTO bank_product_changelog (product_id, changed_fields)
        VALUES (OLD.id, changes);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE 'plpgsql';

CREATE TRIGGER audit_bank_products
    AFTER UPDATE ON bank_loan_products
    FOR EACH ROW
    EXECUTE PROCEDURE log_product_changes();

-- ─── RLS Policies ────────────────────────────────────────────────────────
-- Enable RLS on core tables
ALTER TABLE banks ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_loan_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_rates ENABLE ROW LEVEL SECURITY;

-- Allow public read access to data
CREATE POLICY allow_public_read_banks ON banks FOR SELECT USING (true);
CREATE POLICY allow_public_read_products ON bank_loan_products FOR SELECT USING (true);
CREATE POLICY allow_public_read_rates ON market_rates FOR SELECT USING (true);

-- Assuming service_role (edge functions/admin scrapers) bypasses RLS natively.
