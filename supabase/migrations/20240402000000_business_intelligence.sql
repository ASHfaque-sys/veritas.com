-- Migration: Advanced Business Loan Intelligence Layer (11 Features)
-- Creates tables for GST, CF analysis, health scores, MUDRA, benchmarks, timing, and simulations.

-- 1. GST Profiles (Feature 1)
CREATE TABLE gst_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    gstin TEXT NOT NULL,
    legal_name TEXT,
    business_type TEXT,
    registration_date DATE,
    industry_hsn_sac_codes TEXT[],
    total_turnover_estimated NUMERIC,
    filing_regularity_pct NUMERIC,
    gst_health_score INT CHECK (gst_health_score BETWEEN 0 AND 100),
    raw_api_data JSONB,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Bank Statement Analysis (Feature 2 & 3)
CREATE TABLE bank_statement_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    statement_period_months INT,
    avg_monthly_inflow NUMERIC,
    avg_monthly_outflow NUMERIC,
    net_cash_flow NUMERIC,
    total_existing_emi_obligations NUMERIC,
    bounce_transactions_count INT DEFAULT 0,
    banking_health_score INT CHECK (banking_health_score BETWEEN 0 AND 100),
    claude_extraction_raw JSONB,
    claude_plain_english_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Business Health Scores (Feature 4)
CREATE TABLE business_health_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    cash_flow_score INT CHECK (cash_flow_score BETWEEN 0 AND 100),
    revenue_growth_score INT CHECK (revenue_growth_score BETWEEN 0 AND 100),
    debt_burden_score INT CHECK (debt_burden_score BETWEEN 0 AND 100),
    payment_discipline_score INT CHECK (payment_discipline_score BETWEEN 0 AND 100),
    business_stability_score INT CHECK (business_stability_score BETWEEN 0 AND 100),
    overall_score INT CHECK (overall_score BETWEEN 0 AND 100),
    bankers_view_summary TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. MUDRA Eligibility Checks (Feature 6)
CREATE TABLE mudra_eligibility_checks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    business_type TEXT,
    loan_purpose TEXT,
    years_in_business NUMERIC,
    requested_amount NUMERIC,
    eligible_category TEXT CHECK (eligible_category IN ('None', 'Shishu', 'Kishore', 'Tarun', 'Tarun Plus')),
    created_at TIMESTAMPTZ DEFAULT now()
);

-- 5. Industry Benchmarks (Feature 9)
CREATE TABLE industry_benchmarks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    industry_category TEXT NOT NULL UNIQUE,
    avg_dscr NUMERIC,
    avg_foir NUMERIC,
    avg_disbursed_amount NUMERIC,
    avg_interest_rate NUMERIC,
    npa_rate NUMERIC,
    last_updated TIMESTAMPTZ DEFAULT now()
);

-- 6. Market Timing Signals (Feature 10)
CREATE TABLE market_timing_signals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    bank_id UUID REFERENCES banks(id) ON DELETE CASCADE,
    current_quarter_climate TEXT CHECK (current_quarter_climate IN ('Favorable', 'Neutral', 'Tight')),
    best_month_to_apply INT CHECK (best_month_to_apply BETWEEN 1 AND 12),
    timing_reasoning TEXT,
    last_updated TIMESTAMPTZ DEFAULT now(),
    UNIQUE(bank_id)
);

-- 7. Improvement Simulations (Feature 11)
CREATE TABLE improvement_simulations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    baseline_score INT,
    target_score INT,
    simulated_actions JSONB, -- Array of actions e.g. [{action: 'close_loan', amount: 50000}]
    projected_rate_improvement NUMERIC,
    projected_additional_lenders INT,
    claude_action_plan TEXT,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE gst_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bank_statement_analyses ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_health_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE mudra_eligibility_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE industry_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_timing_signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE improvement_simulations ENABLE ROW LEVEL SECURITY;

-- Policies for authenticated users to see only their own data
CREATE POLICY "Users can manage own gst_profiles" ON gst_profiles FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own cf analysis" ON bank_statement_analyses FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own health scores" ON business_health_scores FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own mudra checks" ON mudra_eligibility_checks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users can manage own simulations" ON improvement_simulations FOR ALL USING (auth.uid() = user_id);

-- Public read for benchmarks and timing
CREATE POLICY "Public read benchmarks" ON industry_benchmarks FOR SELECT USING (true);
CREATE POLICY "Public read timing signals" ON market_timing_signals FOR SELECT USING (true);
