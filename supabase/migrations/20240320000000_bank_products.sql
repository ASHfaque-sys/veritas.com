-- Create bank_products table mapping to UI recommendations
CREATE TABLE public.bank_products (
    id SERIAL PRIMARY KEY,
    loan_type TEXT NOT NULL,          -- 'personal' or 'business'
    bank_name TEXT NOT NULL,          -- e.g. 'HDFC Bank'
    product_name TEXT NOT NULL,       -- e.g. 'Business Growth Loan'
    rate_range TEXT NOT NULL,         -- e.g. '11.50% – 21.00%'
    max_amount TEXT NOT NULL,         -- e.g. '₹75 Lakh'
    min_cibil INTEGER NOT NULL,       -- e.g. 700
    application_link TEXT NOT NULL,   -- e.g. 'https://www.hdfcbank.com/...'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.bank_products ENABLE ROW LEVEL SECURITY;

-- Allow public read access to bank rates
CREATE POLICY "Allow public read access to bank products" ON public.bank_products
    FOR SELECT USING (true);

-- Insert initial seed data matching legacy static records
INSERT INTO public.bank_products (loan_type, bank_name, product_name, rate_range, max_amount, min_cibil, application_link)
VALUES 
    -- Personal Loans
    ('personal', 'HDFC Bank', 'Personal Loan', '10.75% – 14.50%', '₹40 Lakh', 750, 'https://v1.hdfcbank.com/borrow/popular-loans/personal-loan'),
    ('personal', 'SBI', 'SBI Xpress Credit', '11.15% – 15.30%', '₹20 Lakh', 700, 'https://sbi.co.in/web/personal-banking/loans/personal-loans/xpress-credit'),
    ('personal', 'ICICI Bank', 'Personal Loan', '10.85% – 16.25%', '₹50 Lakh', 720, 'https://www.icicibank.com/Personal-Banking/loans/personal-loan/index.page'),
    ('personal', 'Axis Bank', 'Personal Loan', '11.25% – 22.00%', '₹40 Lakh', 700, 'https://www.axisbank.com/retail/loans/personal-loan'),
    ('personal', 'Kotak Bank', 'Personal Loan', '10.99% – 36.00%', '₹35 Lakh', 720, 'https://www.kotak.com/en/personal-banking/loans/personal-loan.html'),

    -- Business Loans
    ('business', 'HDFC Bank', 'Business Growth Loan', '11.50% – 21.00%', '₹75 Lakh', 700, 'https://www.hdfcbank.com/sme/borrow/business-loans/business-growth-loan'),
    ('business', 'SBI', 'SME Smart Score', '11.20% – 16.00%', '₹50 Lakh', 680, 'https://sbi.co.in/web/sme-enterprise/sme-loans'),
    ('business', 'ICICI Bank', 'Business Loan', '12.00% – 19.00%', '₹2 Cr', 700, 'https://www.icicibank.com/business-banking/loans/business-loan/index.page'),
    ('business', 'Bajaj Finance', 'Business Loan', '14.00% – 26.00%', '₹80 Lakh', 650, 'https://www.bajajfinserv.in/business-loan'),
    ('business', 'IDFC First', 'Business Loan', '12.50% – 23.00%', '₹1 Cr', 680, 'https://www.idfcfirstbank.com/business-banking/loans/business-loan');
