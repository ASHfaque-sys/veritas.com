const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

// Prompt templates per document type
function buildPrompt(documentType: string, _loanType: string): string {
    if (documentType === "payslip") {
        return `You are a financial document analyst. Extract the following from this payslip PDF and return ONLY valid JSON with no additional text:
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
  "red_flags": ["an array of any major behavioral risks you detect, otherwise an empty array"]
}
`;
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

        if (!GEMINI_API_KEY) {
            return new Response(
                JSON.stringify({ error: "GEMINI_API_KEY not configured in Edge Function secrets" }),
                { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }

        let textPrompt = buildPrompt(documentType, loanType || "personal");

        // Force currency conversion globally
        textPrompt += "\n\nIMPORTANT INSTRUCTION: If the monetary values in the document are in a foreign currency (e.g., USD, EUR, GBP), you MUST automatically compute and convert all extracted numbers into Indian Rupees (INR) using approximate current market exchange rates (e.g., 1 USD = 83 INR). Output ONLY the final INR converted numbers in the JSON.";

        // Call Google Gemini API with inline PDF data
        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: [
                    {
                        parts: [
                            { text: textPrompt },
                            {
                                inline_data: {
                                    mime_type: "application/pdf",
                                    data: base64File,
                                },
                            },
                        ],
                    },
                ],
                generationConfig: {
                    temperature: 0.1,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!geminiResponse.ok) {
            const errBody = await geminiResponse.text();
            return new Response(
                JSON.stringify({ error: "Gemini API error", details: errBody }),
                { status: 502, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
            );
        }

        const geminiData = await geminiResponse.json();
        const rawText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "{}";

        // Parse JSON safely — Gemini should return only JSON
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
