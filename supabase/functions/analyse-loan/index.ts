

const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Prompt templates per document type
function buildPrompt(documentType: string, _loanType: string): string {
    if (documentType === "payslip") {
        return `You are a financial document analyst. Extract the following from this payslip PDF (base64) and return ONLY valid JSON with no additional text:
{
  "name": "employee name or null",
  "employer": "company name or null",
  "designation": "job title or null",
  "month": "pay period e.g. March 2025 or null",
  "gross_salary": number or null,
  "net_salary": number or null,
  "basic_salary": number or null,
  "pf_deduction": number or null,
  "tax_deduction": number or null,
  "other_deductions": number or null
}`;
    }

    if (documentType === "itr") {
        return `You are a financial document analyst. Extract the following from this ITR PDF and return ONLY valid JSON:
{
  "assessment_year": "e.g. 2024-25 or null",
  "pan": "PAN number or null",
  "gross_total_income": number or null,
  "total_tax_payable": number or null,
  "exempt_income": number or null,
  "business_income": number or null,
  "salary_income": number or null
}`;
    }

    if (documentType === "balance_sheet") {
        return `You are a chartered accountant. Extract the following from this Balance Sheet PDF and return ONLY valid JSON:
{
  "financial_year": "e.g. FY 2023-24 or null",
  "total_assets": number or null,
  "total_liabilities": number or null,
  "equity_capital": number or null,
  "reserves_surplus": number or null,
  "secured_loans": number or null,
  "unsecured_loans": number or null,
  "current_assets": number or null,
  "current_liabilities": number or null,
  "net_worth": number or null
}`;
    }

    if (documentType === "itr_pnl") {
        return `You are a chartered accountant. Extract from this ITR / P&L Statement and return ONLY valid JSON:
{
  "financial_year": "e.g. FY 2023-24 or null",
  "net_sales": number or null,
  "gross_profit": number or null,
  "net_profit": number or null,
  "depreciation": number or null,
  "interest_expense": number or null,
  "total_expenses": number or null
}`;
    }

    if (documentType === "gst_returns") {
        return `Extract the following from this GST Returns PDF and return ONLY valid JSON:
{
  "gstin": "GSTIN number or null",
  "period": "e.g. April 2024 – March 2025 or null",
  "total_taxable_value": number or null,
  "total_tax_paid": number or null,
  "filing_status": "regular/late/nil or null"
}`;
    }

    if (documentType === "bank_statements") {
        return `Analyse this bank statement PDF and return ONLY valid JSON:
{
  "account_number": "last 4 digits or null",
  "bank_name": "bank name or null",
  "period": "e.g. Apr 2024 – Mar 2025 or null",
  "average_monthly_balance": number or null,
  "total_credits": number or null,
  "total_debits": number or null,
  "emi_obligations_detected": number or null,
  "bounce_count": number or null,
  "red_flags": ["an array of any major behavioral risks you detect, such as 'Frequent ATM cash withdrawals', 'Declining daily balance', 'Cheque bounces detected', or 'High number of loan obligations', otherwise an empty array if none detect"]
}`;
    }

    return "Extract key financial figures from this document and return as JSON.";
}

Deno.serve(async (req: Request) => {
    // CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS_HEADERS });
    }

    try {
        const { base64File, documentType, loanType } = await req.json();

        if (!base64File || !documentType) {
            return new Response(
                JSON.stringify({ error: "base64File and documentType are required" }),
                { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }

        if (!ANTHROPIC_API_KEY) {
            return new Response(
                JSON.stringify({ error: "ANTHROPIC_API_KEY not configured in Edge Function secrets" }),
                { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }

        const systemPrompt = buildPrompt(documentType, loanType || "personal");

        // Call Claude Sonnet 4.6 via Anthropic Messages API
        const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                max_tokens: 1024,
                messages: [
                    {
                        role: "user",
                        content: [
                            {
                                type: "text",
                                text: systemPrompt,
                            },
                            {
                                type: "document",
                                source: {
                                    type: "base64",
                                    media_type: "application/pdf",
                                    data: base64File,
                                },
                            },
                        ],
                    },
                ],
            }),
        });

        if (!anthropicResponse.ok) {
            const errBody = await anthropicResponse.text();
            return new Response(
                JSON.stringify({ error: "Claude API error", details: errBody }),
                { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }

        const claudeData = await anthropicResponse.json();
        const rawText = claudeData.content?.[0]?.text ?? "{}";

        // Parse JSON safely — Claude should return only JSON
        let parsedData: Record<string, unknown> = {};
        try {
            // Strip any markdown code fences if present
            const clean = rawText.replace(/```(?:json)?|```/g, "").trim();
            parsedData = JSON.parse(clean);
        } catch (_) {
            parsedData = { raw: rawText };
        }

        return new Response(
            JSON.stringify({ success: true, documentType, data: parsedData }),
            { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );

    } catch (err) {
        return new Response(
            JSON.stringify({ error: String(err) }),
            { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
    }
});
