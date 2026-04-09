import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { 
        loan_type, cibil_score, monthly_income, loan_amount, 
        employment_type, foir_current, age, city, tenure_months 
    } = await req.json()

    if (!loan_type || !cibil_score || !monthly_income || !loan_amount) {
        return new Response(JSON.stringify({ error: "Missing required fields" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch available products for the loan type
    const { data: products, error: pErr } = await supabase
      .from('bank_loan_products')
      .select(`
        *,
        banks ( id, name, type, logo_url )
      `)
      .eq('loan_type', loan_type)
      .eq('is_active', true)

    if (pErr) throw pErr

    // 2. Fetch RBI Health Stats to blend into the score
    const { data: rbiStats } = await supabase
      .from('rbi_lending_stats')
      .select('bank_id, credit_growth_pct, npa_ratio')

    const rbiMap = new Map()
    if (rbiStats) {
        rbiStats.forEach(stat => rbiMap.set(stat.bank_id, stat))
    }

    // 3. Process and Score Each Lender
    const scoredLenders = []
    let maxOverallScore = 0

    for (const prod of products) {
        if (!prod.banks) continue

        let score = 0
        const reasons = []
        const tips = []
        let eligible = true

        // A. CIBIL Score (25%)
        if (prod.min_cibil && cibil_score < prod.min_cibil) {
            eligible = false
            tips.push(`Increase CIBIL score to ${prod.min_cibil} for ${prod.banks.name}`)
        } else {
            const headroom = cibil_score - (prod.min_cibil || 650)
            const cibilPts = Math.min(25, 10 + (headroom * 0.2)) // 25% max
            score += cibilPts
            if (cibilPts > 20) reasons.push("Excellent CIBIL match")
        }

        // B. Income Sufficiency (20%)
        if (prod.min_income && monthly_income < prod.min_income) {
            score += 0
            tips.push(`Minimum income required for ${prod.banks.name} is ${prod.min_income}`)
        } else {
            const incPts = Math.min(20, 10 + ((monthly_income / (prod.min_income || 20000)) * 5))
            score += incPts
            if (incPts > 15) reasons.push("Income well above threshold")
        }

        // C. FOIR Headroom (20%)
        const maxFoir = prod.max_foir || 0.60
        if (foir_current > maxFoir) {
            score += 0
            tips.push(`Reduce FOIR below ${maxFoir * 100}% to unlock ${prod.banks.name}`)
            eligible = eligible ? (foir_current < maxFoir + 0.05) : false // Hard drop if super high
        } else {
            const foirPts = Math.min(20, 20 * (1 - (foir_current / maxFoir)))
            score += foirPts
            if (foirPts > 15) reasons.push("Low debt burden (FOIR)")
        }

        // D. Loan Amount vs Bank Range (15%)
        if (loan_amount < (prod.min_amount || 0) || loan_amount > (prod.max_amount || 999999999)) {
            score += 0
            eligible = false
            tips.push(`Loan amount outside ${prod.banks.name} limits`)
        } else {
            score += 15
        }

        // E. Employment Type Match (10%)
        if (prod.employment_types && !prod.employment_types.includes(employment_type)) {
            score += 0
            eligible = false
        } else {
            score += 10
            reasons.push(`${employment_type} profile accepted`)
        }

        // F. RBI Bank Health/Activity (5%) - Soft boost
        const stats = rbiMap.get(prod.bank_id)
        if (stats && stats.credit_growth_pct > 10) {
             score += 5
             reasons.push("Bank showing high lending activity")
        }

        // Age (5%)
        if ((prod.min_age && age < prod.min_age) || (prod.max_age && age > prod.max_age)) {
             score += 0
             eligible = false
        } else {
             score += 5
        }

        if (!eligible && score < 40) continue // Skip rendering extremely poor matches entirely

        // Final normalization and probability blend 
        // ML Blend would inject historical outcomes here (Placeholder for pgvector lookup)
        // const mlOutcomes = await checkPgVectorSimilarity({ cibil: cibil_score, ... })
        // const final_prob = (score * 0.6) + (mlOutcomes.win_rate * 0.4)
        
        const final_prob = Math.min(99, Math.round(score))
        if(final_prob > maxOverallScore) maxOverallScore = final_prob

        // Calculate Estimated EMI
        const monthlyRate = (prod.rate_min / 12) / 100
        const n = tenure_months
        const emi = (loan_amount * monthlyRate * Math.pow(1 + monthlyRate, n)) / (Math.pow(1 + monthlyRate, n) - 1)

        scoredLenders.push({
            bank_id: prod.bank_id,
            bank_name: prod.banks.name,
            bank_type: prod.banks.type,
            product_subtype: prod.subtype,
            approval_probability: final_prob,
            estimated_rate: prod.rate_min,
            estimated_emi: Math.round(emi),
            processing_fee_estimate: Math.round(loan_amount * ((prod.processing_fee_pct || 1.0) / 100)),
            turnaround_days: prod.turnaround_days || 5,
            match_reasons: reasons.slice(0, 3),
            improvement_tips: tips.slice(0, 1),
            confidence: final_prob > 80 ? "high" : final_prob > 60 ? "medium" : "low"
        })
    }

    // Sort descending by probability
    scoredLenders.sort((a, b) => b.approval_probability - a.approval_probability)
    const bestMatch = scoredLenders.length > 0 ? scoredLenders[0].bank_name : "None"

    const responseFormat = {
        overall_score: maxOverallScore,
        best_match: bestMatch,
        total_lenders_checked: products.length,
        profile_summary: `Your profile qualifies for ${scoredLenders.filter(l => l.approval_probability > 60).length} strong bank matches.`,
        lenders: scoredLenders.slice(0, 10) // Return top 10
    }

    return new Response(JSON.stringify(responseFormat), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
