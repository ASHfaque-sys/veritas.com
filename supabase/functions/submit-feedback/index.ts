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
    const payload = await req.json()
    const { 
        session_id, bank_id, loan_type, cibil_score, monthly_income, 
        loan_amount, foir, dscr, employment_type, collateral_offered, 
        was_approved, rejection_reason, interest_rate_offered, processing_time_days
    } = payload

    if (!bank_id || !loan_type || was_approved === undefined) {
        return new Response(JSON.stringify({ error: "Missing required tracking fields" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Insert the empirical outcome to train the ML system
    const { error: insertErr } = await supabase.from('approval_outcomes').insert({
        bank_id,
        loan_type,
        cibil_score,
        monthly_income,
        loan_amount,
        foir,
        dscr,
        employment_type,
        collateral_offered,
        was_approved,
        rejection_reason,
        interest_rate_offered,
        processing_time_days
    })

    if (insertErr) throw insertErr
    console.log(`[Feedback] Logged Outcome for Bank ${bank_id} - Approved: ${was_approved}`)

    // 2. ML Auto-Recalibration Logic
    // If we have hit 50 cumulative outcomes for this bank + loan_type, we recalibrate
    const { count, error: countErr } = await supabase
        .from('approval_outcomes')
        .select('*', { count: 'exact', head: true })
        .eq('bank_id', bank_id)
        .eq('loan_type', loan_type)

    if (!countErr && count !== null && count >= 50 && count % 10 === 0) {
        console.log(`[ML-Trigger] ${count} outcomes reached for Bank ${bank_id}. Recalibrating logic...`)
        
        // Fetch all 50+ outcomes
        const { data: outcomes } = await supabase
            .from('approval_outcomes')
            .select('was_approved')
            .eq('bank_id', bank_id)
            .eq('loan_type', loan_type)
            
        const approvals = outcomes.filter(o => o.was_approved).length
        const historical_approval_rate = (approvals / outcomes.length)

        // Adjust the weight in the eligibility_rules table
        // A baseline weight is 1.0. If they approve 80% (0.8), we might weight them 1.2
        // If they approve 20% (0.2), we weight them 0.6
        const new_weight = Math.max(0.5, Math.min(1.5, historical_approval_rate * 1.5))

        await supabase.from('eligibility_rules').upsert({
            bank_id,
            loan_type,
            rule_type: 'soft_preference',
            field_name: 'historical_approval_adjustment',
            operator: '=',
            value: { rate: historical_approval_rate },
            weight: new_weight
        }, { onConflict: 'bank_id,loan_type,field_name' })

        console.log(`[ML-Trigger] Recalibrated internal ML weight for Bank ${bank_id} to ${new_weight.toFixed(2)}`)
    }

    return new Response(JSON.stringify({ 
        message: "Feedback logged successfully in Veritas AI intelligence database.",
        calibration_triggered: (count !== null && count >= 50 && count % 10 === 0)
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
