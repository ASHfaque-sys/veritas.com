# Veritas AI

> AI-powered loan eligibility checker for Indian consumers — Personal & Business Loans

## Stack
- **Frontend**: React 18 + Vite + Tailwind CSS
- **Backend**: Supabase (PostgreSQL + Edge Functions + pgvector)
- **AI**: Claude Sonnet 4.6 (`claude-sonnet-4-20250514`) — accessed only via Edge Function
- **Hosting**: Vercel

---

## Getting Started

### 1. Prerequisites
- [Node.js 18+](https://nodejs.org/) and npm
- A [Supabase](https://supabase.com) project
- An [Anthropic API key](https://console.anthropic.com)

### 2. Install dependencies
```bash
npm install
```

### 3. Configure environment
```bash
cp .env.example .env
```
Fill in `.env` with your Supabase URL and anon key:
```
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

### 4. Set up the database
1. Open your Supabase project → **SQL Editor**
2. Paste and run the contents of `supabase/schema.sql`

### 5. Deploy the Edge Function
```bash
# Install Supabase CLI if needed
npm install -g supabase

# Login and link project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# Set your Anthropic API key as a secret (never in .env)
supabase secrets set ANTHROPIC_API_KEY=sk-ant-...

# Deploy
supabase functions deploy analyse-loan
```

### 6. Load Kaggle Real-World Dataset (Optional)
To test the AI `pgvector` similarity matching against realistic data:
1. Ensure your `.env` is configured with Supabase credentials.
2. Run the provided Python ETL pipeline:
```bash
cd python
pip install pandas requests python-dotenv
python import_kaggle_data.py
```
This script cleanly translates Kaggle's "Loan Approval Prediction" dataset into matching JSON schemas, generates mathematical embeddings, and securely pushes them directly to your Supabase cloud via the REST API.

### 7. Run locally
```bash
npm run dev
```

---

## Project Structure
```
src/
  components/
    Navbar.jsx          # Sticky header with logo + badge
    CibilSlider.jsx     # Live colour-coded CIBIL slider
    FileUpload.jsx      # Drag-and-drop PDF uploader
    ScoreGauge.jsx      # Circular canvas gauge
    MetricRow.jsx       # Green/amber/red metric row
    PillButton.jsx      # Selectable pill button
    LoadingScreen.jsx   # Animated 5-step progress screen
  pages/
    Home.jsx            # Landing with two loan-type cards
    PersonalLoan.jsx    # Personal loan flow
    BusinessLoan.jsx    # Business loan flow (8 loan types)
    Results.jsx         # Score, metrics, banks, improvements
    Feedback.jsx        # Outcome form + PDF report download
  utils/
    supabase.js         # Supabase client
    api.js              # Edge Function + DB calls
    scoring.js          # FOIR, DSCR, weighted scoring
supabase/
  schema.sql            # DB schema with pgvector
  functions/
    analyse-loan/       # Claude API Edge Function
      index.ts
```

---

## Deployment (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```
Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to Vercel environment variables.

---

## Security
- Anthropic API key is **never** in the frontend — it lives only in Supabase Edge Function secrets
- Supabase anon key has RLS policies restricting write access
- PDFs are converted to base64 client-side and sent through the Edge Function — never stored
