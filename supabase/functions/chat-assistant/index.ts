const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY") ?? "";
const GEMINI_MODEL = "gemini-2.5-flash";

const CORS_HEADERS = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: CORS_HEADERS });
    }

    try {
        const { messages, context } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return new Response(JSON.stringify({ error: "messages array required" }), { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        if (!GEMINI_API_KEY) {
            return new Response(JSON.stringify({ error: "GEMINI_API_KEY not configured" }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        // Filter out leading assistant messages (Gemini requires first message to be 'user')
        const firstUserIdx = messages.findIndex((m: { role: string }) => m.role === "user");
        const apiMessages = firstUserIdx >= 0 ? messages.slice(firstUserIdx) : messages;

        if (apiMessages.length === 0) {
            return new Response(JSON.stringify({ reply: "Please ask me a question about your loan eligibility!" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        // Convert messages to Gemini format (role: 'user'/'model')
        const geminiContents = apiMessages.map((m: { role: string; content: string }) => ({
            role: m.role === "assistant" ? "model" : "user",
            parts: [{ text: m.content }],
        }));

        const systemInstruction = `You are Veritas AI, an expert loan advisor assistant for the Indian market. 
You are currently chatting with an applicant who just completed a loan eligibility check.
Answer primarily based on the data provided below. Be helpful, concise, and actionable.
DO NOT invent fictional numbers. If you don't know, explicitly say so.

USER CONTEXT DATA:
${JSON.stringify(context || {}, null, 2)}`;

        const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${GEMINI_API_KEY}`;

        const geminiResponse = await fetch(geminiUrl, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                systemInstruction: {
                    parts: [{ text: systemInstruction }],
                },
                contents: geminiContents,
                generationConfig: {
                    temperature: 0.7,
                    maxOutputTokens: 512,
                },
            }),
        });

        if (!geminiResponse.ok) {
            const errBody = await geminiResponse.text();
            throw new Error(`Gemini API error: ${errBody}`);
        }

        const geminiData = await geminiResponse.json();
        const replyText = geminiData.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

        return new Response(JSON.stringify({ reply: replyText }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
});
