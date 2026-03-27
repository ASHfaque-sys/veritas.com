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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Fetch Banks and Products
    const { data: banks, error: bErr } = await supabase.from('banks').select('id, name')
    if (bErr) throw bErr

    const { data: products, error: pErr } = await supabase.from('bank_loan_products').select('*')
    if (pErr) throw pErr

    // 2. Fetch Last Scrape Run
    const { data: lastScrape } = await supabase
        .from('scrape_logs')
        .select('run_at, source')
        .order('run_at', { ascending: false })
        .limit(1)

    // 3. Process Data Health Metrics
    const now = new Date()
    const bankHealthList = []
    let totalCompleteness = 0
    let totalFreshnessScore = 0

    // Key fields expected to be populated
    const required_fields = ['min_cibil', 'rate_min', 'rate_max', 'processing_fee_pct', 'turnaround_days']

    for (const bank of banks) {
        const bankProducts = products.filter(p => p.bank_id === bank.id)
        
        if (bankProducts.length === 0) {
            bankHealthList.push({
                bank_name: bank.name,
                products_count: 0,
                last_updated: null,
                data_completeness_score: 0,
                freshness_status: "missing"
            })
            continue
        }

        // Aggregate completeness
        let filled_fields = 0
        let total_fields = 0
        let newest_update = new Date(0)

        for (const prod of bankProducts) {
             const updateTime = new Date(prod.last_updated)
             if (updateTime > newest_update) newest_update = updateTime
             
             for (const field of required_fields) {
                 total_fields++
                 if (prod[field] !== null && prod[field] !== undefined) filled_fields++
             }
        }

        const completeness = Math.round((filled_fields / total_fields) * 100)
        
        // Calculate freshness based on last_updated
        const days_old = Math.floor((now.getTime() - newest_update.getTime()) / (1000 * 3600 * 24))
        let freshness_status = "fresh"
        let f_score = 100
        
        if (days_old > 30) {
            freshness_status = "stale"
            f_score = 50
        }
        if (days_old > 90) {
            freshness_status = "severely_stale"
            f_score = 0
        }

        totalCompleteness += completeness
        totalFreshnessScore += f_score

        bankHealthList.push({
            bank_id: bank.id,
            bank_name: bank.name,
            products_count: bankProducts.length,
            last_updated: newest_update,
            days_since_update: days_old,
            data_completeness_score: completeness,
            freshness_status
        })
    }

    // 4. Global Metrics
    const totalBanks = banks.length
    const overallCompleteness = totalBanks > 0 ? Math.round(totalCompleteness / totalBanks) : 0
    const overallFreshness = totalBanks > 0 ? Math.round(totalFreshnessScore / totalBanks) : 0
    const overallHealthScore = Math.round((overallCompleteness * 0.6) + (overallFreshness * 0.4))

    const needsRefresh = bankHealthList
        .filter(b => b.freshness_status === 'stale' || b.freshness_status === 'severely_stale' || b.freshness_status === 'missing')
        .map(b => b.bank_name)

    const responseFormat = {
        database_health: {
            overall_health_score: overallHealthScore,
            global_completeness_pct: overallCompleteness,
            global_freshness_pct: overallFreshness,
            status: overallHealthScore > 80 ? "Healthy" : overallHealthScore > 50 ? "Degraded" : "Critical"
        },
        inventory: {
            total_lenders: totalBanks,
            total_products: products.length,
            banks_needing_refresh: needsRefresh
        },
        system: {
            last_scrape_run: lastScrape && lastScrape.length > 0 ? lastScrape[0].run_at : null,
            last_scrape_source: lastScrape && lastScrape.length > 0 ? lastScrape[0].source : "None"
        },
        banks: bankHealthList.sort((a,b) => a.data_completeness_score - b.data_completeness_score) // worst first
    }

    return new Response(JSON.stringify(responseFormat), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error) {
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
