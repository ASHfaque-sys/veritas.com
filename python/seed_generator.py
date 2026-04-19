import json
import random
import uuid

def generate_embedding(size=1536):
    return [round(random.uniform(-1, 1), 6) for _ in range(size)]

def generate_personal_data():
    return {
        "monthly_income": random.randint(20000, 250000),
        "employer": random.choice(["TCS", "Infosys", "Wipro", "HDFC Bank", "StartUp Inc.", "Amazon", "Local Business"]),
        "employment_type": random.choice(["Salaried", "Self-Employed"]),
        "annual_income": random.randint(240000, 3000000),
        "cibil_score": random.randint(550, 850)
    }

def generate_business_data():
    return {
        "net_profit": random.randint(500000, 50000000),
        "depreciation": random.randint(10000, 1000000),
        "annual_turnover": random.randint(2000000, 200000000),
        "total_liabilities": random.randint(100000, 50000000),
        "business_vintage_years": random.randint(1, 20)
    }

def create_seed_sql(num_records=50):
    sql_statements = []
    sql_statements.append("-- ==========================================")
    sql_statements.append("-- Synthetic Data for Veritas UniLoan AI ")
    sql_statements.append("-- Run this in your Supabase SQL Editor")
    sql_statements.append("-- ==========================================")
    sql_statements.append("")

    for i in range(num_records):
        session_id = str(uuid.uuid4())
        loan_type = random.choice(['personal', 'business'])
        
        extracted_data = generate_personal_data() if loan_type == 'personal' else generate_business_data()
        
        # Calculate a realistic probability score
        if loan_type == 'personal':
            score = (extracted_data["cibil_score"] - 300) / 600 * 100
        else:
            score = 60 if extracted_data["net_profit"] > extracted_data["total_liabilities"] else 30
        
        score += random.randint(-15, 15)
        probability_score = min(max(int(score), 0), 100)
        
        embedding_str = f"[{','.join(map(str, generate_embedding()))}]"
        extracted_data_json = json.dumps(extracted_data).replace("'", "''")

        sql = f"INSERT INTO public.assessments (session_id, loan_type, extracted_data, probability_score, embedding) VALUES ('{session_id}', '{loan_type}', '{extracted_data_json}'::jsonb, {probability_score}, '{embedding_str}');"
        sql_statements.append(sql)
        
        # Create a matching outcome for 70% of them
        if random.random() > 0.3:
            outcome = random.choice(['approved', 'rejected', 'pending'])
            bank_applied = random.choice(["SBI", "HDFC", "ICICI", "Axis", "Kotak"])
            interest_rate = round(random.uniform(8.5, 18.0), 2) if outcome == 'approved' else 'NULL'
            approved_amount = random.randint(100000, 5000000) if outcome == 'approved' else 'NULL'
            
            outcome_sql = f"INSERT INTO public.loan_outcomes (session_id, bank_applied, outcome, interest_rate, approved_amount) VALUES ('{session_id}', '{bank_applied}', '{outcome}', {interest_rate}, {approved_amount});"
            sql_statements.append(outcome_sql)
            
    with open('d:/Veritas/veritas.com/supabase/mock_database_seed.sql', 'w') as f:
        f.write('\n'.join(sql_statements))
        
    print(f"Generated {num_records} synthetic assessments with corresponding outcomes.")
    print("Saved to: d:/Veritas/veritas.com/supabase/mock_database_seed.sql")

if __name__ == "__main__":
    create_seed_sql(50)  # Generates 50 complete records
