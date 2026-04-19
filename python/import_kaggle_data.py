import os
import uuid
import json
import random
import pandas as pd
import requests

from dotenv import load_dotenv

CSV_FILE_PATH = "dataset.csv"

# Load env variables
load_dotenv('../.env')

SUPABASE_URL = os.environ.get('VITE_SUPABASE_URL', '').rstrip('/')
SUPABASE_KEY = os.environ.get('VITE_SUPABASE_ANON_KEY', '').strip()

def generate_embedding(size=1536):
    """Generates a dummy 1536-d vector since we aren't calling OpenAI/Claude for every row."""
    # Round to limit size
    return [round(random.uniform(-1, 1), 5) for _ in range(size)]

def map_kaggle_to_veritas(row):
    try:
        ann_income = row.get('income_annum', row.get('income', 500000))
        loan_amount = row.get('loan_amount', 1000000)
        cibil = row.get('cibil_score', 700)
        
        self_emp = str(row.get('self_employed', 'No')).strip().lower()
        emp_type = "Self-Employed" if self_emp == "yes" else "Salaried"
        
        extracted_data = {
            "employmentType": emp_type,
            "monthlyIncome": int(ann_income / 12) if pd.notnull(ann_income) else 40000,
            "annual_income": int(ann_income) if pd.notnull(ann_income) else 480000,
            "cibilScore": int(cibil) if pd.notnull(cibil) else 700,
            "loanAmount": int(loan_amount) if pd.notnull(loan_amount) else 500000,
            "city": "Unknown",  
            "yearsAtEmployer": random.randint(1, 10), 
            "existingEMI": int((ann_income / 12) * random.uniform(0.1, 0.4)) 
        }
        
        score = (extracted_data["cibilScore"] - 300) / 600 * 100
        probability_score = min(max(int(score), 0), 100)
        
        status_value = str(row.get('loan_status', 'Approved')).strip().lower()
        outcome = "approved" if status_value == "approved" else "rejected"
        
        return extracted_data, probability_score, outcome
    except Exception as e:
        print(f"Error mapping row: {e}")
        return None, None, None

def run_import():
    if not SUPABASE_URL or not SUPABASE_KEY:
        print("Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY in ../.env")
        return

    headers = {
        "apikey": SUPABASE_KEY,
        "Authorization": f"Bearer {SUPABASE_KEY}",
        "Content-Type": "application/json",
        "Prefer": "return=minimal"
    }
    
    if not os.path.exists(CSV_FILE_PATH):
        print(f"File not found: {CSV_FILE_PATH}")
        return

    print(f"Reading {CSV_FILE_PATH}...")
    df = pd.read_csv(CSV_FILE_PATH)
    df.columns = df.columns.str.strip()
    
    df_sample = df.head(100)
    
    print(f"Extracting and compiling payload for {len(df_sample)} Kaggle records...")
    
    # We will upload in chunks of 50 to avoid any network timeouts
    chunk_size = 50
    chunks = [df_sample[i:i + chunk_size] for i in range(0, df_sample.shape[0], chunk_size)]
    
    for i, chunk in enumerate(chunks):
        assessments_payload = []
        outcomes_payload = []
        
        for index, row in chunk.iterrows():
            session_id = str(uuid.uuid4())
            extracted_data, probability_score, outcome = map_kaggle_to_veritas(row)
            if not extracted_data:
                continue
                
            embedding_str = f"[{','.join(map(str, generate_embedding()))}]"
            
            assessments_payload.append({
                "session_id": session_id,
                "loan_type": "personal",
                "extracted_data": extracted_data,
                "probability_score": probability_score,
                "embedding": embedding_str
            })
            
            bank_applied = random.choice(["SBI", "HDFC", "ICICI", "Axis Bank"])
            interest_rate = round(random.uniform(9.5, 16.0), 2) if outcome == "approved" else None
            approved_amount = extracted_data["loanAmount"] if outcome == "approved" else None
            
            outcomes_payload.append({
                "session_id": session_id,
                "bank_applied": bank_applied,
                "outcome": outcome,
                "interest_rate": interest_rate,
                "approved_amount": approved_amount
            })

        print(f"Pushing Chunk {i+1} to database (via APIs directly)...")
        res1 = requests.post(f"{SUPABASE_URL}/rest/v1/assessments", headers=headers, json=assessments_payload)
        if res1.status_code >= 400:
            print(f"Failed to insert assessments: {res1.text}")
            return
            
        res2 = requests.post(f"{SUPABASE_URL}/rest/v1/loan_outcomes", headers=headers, json=outcomes_payload)
        if res2.status_code >= 400:
            print(f"Failed to insert outcomes: {res2.text}")
            return

    print("\nSUCCESS! All data was perfectly pushed to your Supabase cloud.")
    print("You NO LONGER need to use the SQL editor to import this data!")

if __name__ == "__main__":
    run_import()
