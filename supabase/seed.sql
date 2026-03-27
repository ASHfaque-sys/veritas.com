-- Seed Script: 25 Lenders and 75 Products for Veritas AI
-- Run this via `supabase db reset` or executing against the DB directly.

-- 1. Insert 25 Banks
INSERT INTO banks (id, name, type, headquarters, listed, rbi_registered)
VALUES
  ('c01f8b44-0123-4567-89ab-000000000001', 'SBI', 'PSB', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000002', 'PNB', 'PSB', 'New Delhi', true, true),
  ('c01f8b44-0123-4567-89ab-000000000003', 'Bank of Baroda', 'PSB', 'Vadodara', true, true),
  ('c01f8b44-0123-4567-89ab-000000000004', 'Canara Bank', 'PSB', 'Bengaluru', true, true),
  ('c01f8b44-0123-4567-89ab-000000000005', 'Union Bank', 'PSB', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000006', 'Bank of India', 'PSB', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000007', 'HDFC Bank', 'Private', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000008', 'ICICI Bank', 'Private', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000009', 'Axis Bank', 'Private', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000010', 'Kotak Mahindra Bank', 'Private', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000011', 'IndusInd Bank', 'Private', 'Pune', true, true),
  ('c01f8b44-0123-4567-89ab-000000000012', 'Yes Bank', 'Private', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000013', 'Federal Bank', 'Private', 'Kochi', true, true),
  ('c01f8b44-0123-4567-89ab-000000000014', 'IDFC First Bank', 'Private', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000015', 'RBL Bank', 'Private', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000016', 'South Indian Bank', 'Private', 'Thrissur', true, true),
  ('c01f8b44-0123-4567-89ab-000000000017', 'Bajaj Finserv', 'NBFC', 'Pune', true, true),
  ('c01f8b44-0123-4567-89ab-000000000018', 'Tata Capital', 'NBFC', 'Mumbai', false, true),
  ('c01f8b44-0123-4567-89ab-000000000019', 'Fullerton India', 'NBFC', 'Mumbai', false, true),
  ('c01f8b44-0123-4567-89ab-000000000020', 'Muthoot Finance', 'NBFC', 'Kochi', true, true),
  ('c01f8b44-0123-4567-89ab-000000000021', 'Manappuram Finance', 'NBFC', 'Thrissur', true, true),
  ('c01f8b44-0123-4567-89ab-000000000022', 'HDB Financial', 'NBFC', 'Ahmedabad', false, true),
  ('c01f8b44-0123-4567-89ab-000000000023', 'Piramal Finance', 'NBFC', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000024', 'L&T Finance', 'NBFC', 'Mumbai', true, true),
  ('c01f8b44-0123-4567-89ab-000000000025', 'Aditya Birla Finance', 'NBFC', 'Mumbai', false, true)
ON CONFLICT (name) DO NOTHING;

-- 2. Insert Base Market Rates
INSERT INTO market_rates (loan_type, repo_rate, average_market_rate, min_market_rate, max_market_rate)
VALUES
  ('personal', 6.50, 12.50, 10.49, 36.00),
  ('business', 6.50, 14.50, 11.20, 26.00),
  ('home', 6.50, 8.80, 8.35, 11.00)
ON CONFLICT DO NOTHING;

-- 3. Insert Loan Products via CTE
WITH b AS (SELECT id, name FROM banks)
INSERT INTO bank_loan_products (
  bank_id, loan_type, subtype, min_cibil, max_cibil, min_income, min_age, max_age,
  min_tenure_months, max_tenure_months, max_foir, min_dscr, rate_min, rate_max, rate_type,
  min_amount, max_amount, processing_fee_pct, employment_types, turnaround_days
)
SELECT 
  b.id, p.*
FROM b 
CROSS JOIN LATERAL (
  -- Mapping 3 products based on the bank name pattern (for realistic seed data)
  -- 1) Personal
  SELECT 
    'personal' as loan_type, 
    CASE WHEN b.name IN ('SBI', 'HDFC Bank') THEN 'Premium Salaried' ELSE 'Standard Personal Loan' END as subtype,
    CASE WHEN b.name IN ('SBI', 'HDFC Bank', 'ICICI Bank') THEN 730 ELSE 680 END as min_cibil,
    900 as max_cibil,
    CASE WHEN b.name IN ('HDFC Bank', 'ICICI Bank') THEN 30000 ELSE 15000 END as min_income,
    21 as min_age, 60 as max_age,
    12 as min_tenure_months, 72 as max_tenure_months,
    0.60 as max_foir, NULL::NUMERIC as min_dscr,
    CASE WHEN b.name = 'SBI' THEN 11.15 WHEN b.name = 'HDFC Bank' THEN 10.75 WHEN b.name = 'Bajaj Finserv' THEN 13.00 ELSE 11.5 END as rate_min,
    CASE WHEN b.name = 'SBI' THEN 15.30 WHEN b.name = 'HDFC Bank' THEN 21.00 WHEN b.name = 'Bajaj Finserv' THEN 36.00 ELSE 24.0 END as rate_max,
    'fixed' as rate_type,
    50000 as min_amount, 
    CASE WHEN b.name IN ('HDFC Bank', 'ICICI Bank') THEN 4000000 ELSE 2000000 END as max_amount,
    CASE WHEN b.name = 'SBI' THEN 1.0 ELSE 2.5 END as processing_fee_pct,
    ARRAY['salaried'] as employment_types,
    CASE WHEN b.name IN ('HDFC Bank', 'ICICI Bank', 'Bajaj Finserv') THEN 1 ELSE 3 END as turnaround_days
  UNION ALL
  -- 2) Business
  SELECT 
    'business' as loan_type, 
    'Working Capital Term Loan' as subtype,
    CASE WHEN b.name IN ('SBI', 'Bank of Baroda') THEN 680 ELSE 700 END as min_cibil,
    900 as max_cibil,
    NULL as min_income,
    25 as min_age, 65 as max_age,
    12 as min_tenure_months, 120 as max_tenure_months,
    NULL as max_foir, 1.25 as min_dscr,
    CASE WHEN b.name = 'SBI' THEN 11.20 WHEN b.name = 'IDFC First Bank' THEN 14.50 ELSE 13.0 END as rate_min,
    CASE WHEN b.name = 'SBI' THEN 16.00 WHEN b.name = 'IDFC First Bank' THEN 24.00 ELSE 22.0 END as rate_max,
    'floating' as rate_type,
    100000 as min_amount, 
    10000000 as max_amount,
    2.0 as processing_fee_pct,
    ARRAY['self-employed', 'business'] as employment_types,
    CASE WHEN b.name IN ('Bajaj Finserv', 'IDFC First Bank') THEN 3 ELSE 7 END as turnaround_days
  UNION ALL
  -- 3) Home
  SELECT 
    'home' as loan_type, 
    'Housing Loan' as subtype,
    750 as min_cibil,
    900 as max_cibil,
    25000 as min_income,
    21 as min_age, 70 as max_age,
    60 as min_tenure_months, 360 as max_tenure_months,
    0.65 as max_foir, NULL as min_dscr,
    CASE WHEN b.name = 'SBI' THEN 8.50 WHEN b.name = 'HDFC Bank' THEN 8.55 ELSE 8.75 END as rate_min,
    CASE WHEN b.name = 'SBI' THEN 9.65 WHEN b.name = 'HDFC Bank' THEN 9.80 ELSE 11.00 END as rate_max,
    'floating' as rate_type,
    500000 as min_amount, 
    100000000 as max_amount,
    0.5 as processing_fee_pct,
    ARRAY['salaried', 'self-employed', 'business'] as employment_types,
    CASE WHEN b.name IN ('SBI', 'PNB') THEN 14 ELSE 7 END as turnaround_days
) p
ON CONFLICT (bank_id, loan_type, subtype) DO NOTHING;
