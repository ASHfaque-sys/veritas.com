const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const SYSTEM_PROMPT = `You are the Veritas AI Financial Advisor—an expert, highly analytical, and empathetic loan underwriter for the Indian market.
Your strict rules:
1. Provide extremely concise, highly actionable, bullet-pointed answers. Do not write long paragraphs.
2. Directly reference the user's provided 'Assessment Context' (their past applications, scores, income, bank rejections/approvals) in your advice to make it hyper-personalized.
3. If they ask a hypothetical (e.g., "what if I increase salary?"), calculate a realistic estimate of how it affects their FOIR or loan capacity based on standard Indian banking rules.
4. Maintain a professional, encouraging, but realistic tone.
5. Do not offer legal advice. Format your output in clean Markdown.`;

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS_HEADERS });
    }

    try {
        const { message, chatHistory = [], context = [] } = await req.json();

        if (!message) {
            return new Response(JSON.stringify({ error: "message is required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: "API key missing" }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        // Build the prompt context
        let contextBlock = "No past assessments found for this user.";
        if (context.length > 0) {
            const summaries = context.map((c: Record<string, unknown>, i: number) => {
                const date = new Date(String(c.created_at)).toLocaleDateString("en-IN");
                return `[Assessment ${i + 1} | Date: ${date} | Type: ${c.loan_type}]
Score: ${c.probability_score}/100
Data Profile: ${JSON.stringify(c.extracted_data)}`;
            });
            contextBlock = "USER ASSESSMENT HISTORY:\n" + summaries.join("\n\n");
        }

        const fullPrompt = `${SYSTEM_PROMPT}\n\n${contextBlock}\n\nUser Question: ${message}`;

        // Build Gemini conversation history (formatting for generic generateContent API)
        const geminiHistory = chatHistory.map((msg: { role: string; content: string }) => ({
            role: msg.role === "user" ? "user" : "model",
            parts: [{ text: msg.content }]
        }));

        geminiHistory.push({
            role: "user",
            parts: [{ text: fullPrompt }]
        });

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;
        
        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                contents: geminiHistory,
                generationConfig: {
                    temperature: 0.3,
                    maxOutputTokens: 1024,
                },
            }),
        });

        if (!geminiResponse.ok) {
            const errBody = await geminiResponse.text();
            throw new Error(`Gemini API error: ${errBody}`);
        }

        const geminiData = await geminiResponse.json();
        const responseText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "I'm sorry, I couldn't process that request.";

        return new Response(
            JSON.stringify({ response: responseText }),
            { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );

    } catch (err: unknown) {
        console.error("Advisor Chat Error:", err);
        return new Response(
            JSON.stringify({ error: err instanceof Error ? err.message : String(err) }),
            { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
        );
    }
});
