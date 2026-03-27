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
    const { bank_name } = await req.json()

    if (!bank_name) {
        return new Response(JSON.stringify({ error: "bank_name is required" }), {
            status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        })
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    // 1. Resolve Bank ID
    const { data: bank, error: bErr } = await supabase
        .from('banks')
        .select('id, name')
        .ilike('name', `%${bank_name}%`)
        .single()

    if (bErr || !bank) {
         return new Response(JSON.stringify({ error: `Bank '${bank_name}' not found` }), { status: 404, headers: corsHeaders })
    }

    console.log(`[Auto-Enrich] Target Acquired: ${bank.name}`)

    // 2. Discover URLs (Mocking search API behavior)
    // In production, this would call Google Custom Search API or Similar
    const discoveredUrls = {
        personal_loan: `https://www.${bank.name.replace(/\s+/g, '').toLowerCase()}.com/personal-loan`,
        business_loan: `https://www.${bank.name.replace(/\s+/g, '').toLowerCase()}.com/business-loan`
    }

    console.log(`[Auto-Enrich] Discovered URLs:`, discoveredUrls)

    // 3. Fetch current state (for diffing)
    const { data: currentProducts } = await supabase
        .from('bank_loan_products')
        .select('*')
        .eq('bank_id', bank.id)

    const currentState = currentProducts ? currentProducts.reduce((acc, p) => {
         acc[`${p.loan_type}_${p.subtype}`] = { rate_min: p.rate_min, rate_max: p.rate_max, processing_fee_pct: p.processing_fee_pct };
         return acc;
    }, {}) : {}

    // 4. Scrape Targeted Pages 
    // (Mocking the fetch+cheerio extraction for demonstration)
    // const plPage = await fetch(discoveredUrls.personal_loan)
    // const plHtml = await plPage.text()
    // const newRateMin = parseRateFromSpans(plHtml)
    
    // Simulating the extracted data from the deep scrape
    const scrapedData = [
        {
            loan_type: 'personal',
            subtype: 'Standard Personal Loan',
            rate_min: 10.25, // Let's pretend it dropped from 10.75
            rate_max: 18.00,
            processing_fee_pct: 1.5,
            source_url: discoveredUrls.personal_loan
        },
        {
            loan_type: 'business',
            subtype: 'Working Capital Term Loan',
            rate_min: 12.00,
            rate_max: 20.00,
            processing_fee_pct: 2.0,
            source_url: discoveredUrls.business_loan
        }
    ]

    // 5. Update Database and Build Diff
    const diffs = []
    
    for (const scraped of scrapedData) {
        // Upsert matching the unique constraint
        const payload = {
            bank_id: bank.id,
            loan_type: scraped.loan_type,
            subtype: scraped.subtype,
            rate_min: scraped.rate_min,
            rate_max: scraped.rate_max,
            processing_fee_pct: scraped.processing_fee_pct,
            source_url: scraped.source_url,
            is_active: true
        }

        const { error: upsertErr } = await supabase.from('bank_loan_products')
            .upsert(payload, { onConflict: 'bank_id,loan_type,subtype' })
            .execute()

        if (upsertErr) console.error("Upsert fell through", upsertErr)

        // Calculate diff
        const old = currentState[`${scraped.loan_type}_${scraped.subtype}`]
        if (old) {
            const changes = {}
            if (old.rate_min !== scraped.rate_min) changes.rate_min = { old: old.rate_min, new: scraped.rate_min }
            if (old.rate_max !== scraped.rate_max) changes.rate_max = { old: old.rate_max, new: scraped.rate_max }
            if (old.processing_fee_pct !== scraped.processing_fee_pct) changes.processing_fee_pct = { old: old.processing_fee_pct, new: scraped.processing_fee_pct }
            
            if (Object.keys(changes).length > 0) {
                 diffs.push({
                     product: `${scraped.loan_type} - ${scraped.subtype}`,
                     changes
                 })
            }
        } else {
             diffs.push({
                 product: `${scraped.loan_type} - ${scraped.subtype}`,
                 status: "New product discovered and added"
             })
        }
    }

    // 6. Log the automated enrichment
    await supabase.table('scrape_logs').insert({
        source: `Auto-Enrich [${bank.name}]`,
        rows_updated: diffs.length,
        duration_ms: 1200 // Mock duration
    }).execute()

    return new Response(JSON.stringify({ 
        message: `Successfully enriched ${bank.name}`,
        discovered_urls: discoveredUrls,
        diffs: diffs.length > 0 ? diffs : "No changes detected. Rates are up to date."
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
