import { supabase, isSupabaseConfigured } from './supabase'

/**
 * Call the analyse-loan Edge Function via Supabase
 * @param {string} base64File - Base64 encoded PDF
 * @param {string} documentType - e.g. 'payslip', 'itr', 'balance_sheet'
 * @param {string} loanType - 'personal' | 'business'
 */
export async function analyseDocument(base64File, documentType, loanType) {
    if (!isSupabaseConfigured() || !supabase) {
        // Return mock data for demo purposes
        return getMockExtraction(documentType, loanType)
    }

    const { data, error } = await supabase.functions.invoke('analyse-loan', {
        body: { base64File, documentType, loanType },
    })

    if (error) {
        console.error('Edge Function Error:', error)
        throw new Error(error.message || 'Unknown error from edge function')
    }
    return data
}

/**
 * Save assessment to Supabase
 */
export async function saveAssessment({ loanType, extractedData, probabilityScore, embedding }) {
    if (!isSupabaseConfigured() || !supabase) {
        return { session_id: `demo-${Date.now()}` }
    }

    // Get user_id if logged in (optional — anonymous submissions still work)
    let userId = null
    try {
        const { data: userData } = await supabase.auth.getUser()
        userId = userData?.user?.id || null
    } catch (_) { /* not logged in */ }

    const { data, error } = await supabase
        .from('assessments')
        .insert({
            loan_type: loanType,
            user_id: userId,
            extracted_data: extractedData,
            probability_score: probabilityScore,
            embedding: embedding || null,
        })
        .select('session_id')
        .single()

    if (error) throw new Error(error.message)
    return data
}

/**
 * Save user feedback to loan_outcomes
 */
export async function saveFeedback({ sessionId, bankApplied, outcome, interestRate, approvedAmount }) {
    if (!isSupabaseConfigured() || !supabase) {
        return { id: `demo-feedback-${Date.now()}` }
    }

    const { data, error } = await supabase
        .from('loan_outcomes')
        .insert({
            session_id: sessionId,
            bank_applied: bankApplied,
            outcome,
            interest_rate: interestRate || null,
            approved_amount: approvedAmount || null,
        })
        .select('id')
        .single()

    if (error) throw new Error(error.message)
    return data
}

/**
 * Fetch similar profiles using pgvector (for bank recommendations)
 */
export async function fetchSimilarProfiles(embedding, limit = 3) {
    if (!isSupabaseConfigured() || !supabase || !embedding) return []

    const { data, error } = await supabase.rpc('match_assessments', {
        query_embedding: embedding,
        match_threshold: 0.7,
        match_count: limit,
    })

    if (error) return []
    return data || []
}

/**
 * Fetch dynamic bank rate products from Supabase DB
 */
export async function fetchBankProducts(loanType) {
    if (!isSupabaseConfigured() || !supabase) return null

    const { data, error } = await supabase
        .from('bank_products')
        .select('*')
        .eq('loan_type', loanType)

    if (error || !data) {
        console.error('Error fetching bank products:', error?.message)
        return null
    }
    
    return data.map(row => ({
        bank: row.bank_name,
        product: row.product_name,
        rate: row.rate_range,
        maxAmount: row.max_amount,
        minCibil: row.min_cibil,
        link: row.application_link
    }))
}

// ─── Mock data for demo (when Supabase is not configured) ─────────────────
function getMockExtraction(documentType, loanType) {
    if (loanType === 'personal') {
        return {
            success: true,
            source: 'mock',
            data: {
                name: 'Extracted from document',
                monthly_income: null,
                employer: null,
                employment_type: null,
                pan: null,
                annual_income: null,
            },
        }
    }
    return {
        success: true,
        source: 'mock',
        data: {
            net_profit: null,
            depreciation: null,
            annual_turnover: null,
            total_liabilities: null,
        },
    }
}
