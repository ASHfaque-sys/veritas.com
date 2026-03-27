import os
import sys
import datetime
import requests
import pandas as pd
from rapidfuzz import process, fuzz
from supabase import create_client, Client
from dotenv import load_dotenv

# Load Supabase credentials
load_dotenv('../.env')
SUPABASE_URL = os.environ.get("VITE_SUPABASE_URL")
SUPABASE_KEY = os.environ.get("VITE_SUPABASE_ANON_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("Error: Supabase environment variables missing.")
    sys.exit(1)

supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)

# ─── Configuration ────────────────────────────────────────────────────────

# Mock DBIE Data URLs for demonstration
DBIE_CREDIT_URL = "https://example.com/rbi_data/sectoral_deployment.xlsx"
DBIE_RATES_URL = "https://example.com/rbi_data/lending_rates.xlsx"
DBIE_BSR_URL = "https://example.com/rbi_data/bsr_returns.xlsx"

# ─── Helper Functions ───────────────────────────────────────────────────────

def fetch_dbie_excel(url):
    """Download the excel file from RBI DBIE portal to an in-memory Pandas dataframe."""
    print(f"Downloading from DBIE: {url}")
    try:
        # Mocking the actual HTTP request to DBIE's complex portal
        # The real RBI portal requires session handling and specific post payloads
        # response = requests.get(url, verify=False)
        # response.raise_for_status()
        # return pd.read_excel(response.content)
        
        # Simulated Data
        data = {
            'Bank Name': ['State Bank of India', 'HDFC Bank Ltd.', 'ICICI Bank Limited', 'Punjab National Bank'],
            'Personal Loan Total': [500000, 450000, 380000, 250000],
            'NPA Ratio': [4.5, 1.2, 2.1, 7.8],
            'Credit Growth': [14.2, 18.5, 16.4, 9.1]
        }
        return pd.DataFrame(data)
    except Exception as e:
        print(f"Error fetching DBIE data: {e}")
        return None

def get_banks_from_db():
    """Fetch official bank names from Supabase for fuzzy matching."""
    res = supabase.table('banks').select('id, name').execute()
    return {b['name']: b['id'] for b in res.data}

def calculate_data_freshness(month, year):
    """Calculate a 0-100 score based on how recently data was published."""
    now = datetime.datetime.now()
    report_date = datetime.datetime(year, month, 1)
    diff_months = (now.year - report_date.year) * 12 + now.month - report_date.month
    
    # 100 if current month, subtract 10 points per month elapsed, min 0
    score = max(0, 100 - (diff_months * 10))
    return score

# ─── Main Execution ─────────────────────────────────────────────────────────

def run_rbi_sync():
    """Fetches, parses, matches, and upserts RBI statistical data."""
    print("Starting RBI DBIE Synchronization process...")
    
    df = fetch_dbie_excel(DBIE_CREDIT_URL)
    if df is None:
        return
        
    db_banks = get_banks_from_db()
    bank_names = list(db_banks.keys())
    
    current_month = datetime.datetime.now().month
    current_year = datetime.datetime.now().year
    freshness_score = calculate_data_freshness(current_month, current_year)
    
    upserts = 0
    
    for _, row in df.iterrows():
        raw_name = str(row['Bank Name'])
        
        # Fuzzy match the raw DBIE name against our clean database names
        match = process.extractOne(raw_name, bank_names, scorer=fuzz.WRatio)
        
        if match and match[1] >= 85: # Require 85% confidence to map
            clean_name = match[0]
            bank_id = db_banks[clean_name]
            
            payload = {
                "bank_id": bank_id,
                "month": current_month,
                "year": current_year,
                "personal_loan_outstanding": row['Personal Loan Total'],
                "npa_ratio": row['NPA Ratio'],
                "credit_growth_pct": row['Credit Growth'],
                "data_source": f"DBIE_CR_{current_year}_{current_month} (Freshness: {freshness_score})"
            }
            
            try:
                res = supabase.table('rbi_lending_stats').upsert(
                    payload,
                    on_conflict='bank_id, month, year'
                ).execute()
                upserts += len(res.data)
                print(f"[{clean_name}] Matched from '{raw_name}'. Stats synchronized.")
            except Exception as e:
                print(f"Failed to upsert stats for {clean_name}: {e}")
        else:
            print(f"Could not conclusively map DBIE name: '{raw_name}' (Best match: {match[0]} at {match[1]}%)")

    print(f"Sync complete. {upserts} bank records updated.")

if __name__ == "__main__":
    run_rbi_sync()
