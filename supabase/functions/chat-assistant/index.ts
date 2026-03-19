const ANTHROPIC_API_KEY = Deno.env.get("ANTHROPIC_API_KEY") ?? "";
const CLAUDE_MODEL = "claude-3-5-sonnet-20241022";

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

        // Claude requires the first message to be from 'user'.
        // Filter out the initial assistant greeting that the frontend adds.
        const cleanMessages = messages.filter(
            (m: { role: string; content: string }) => m.role === "user" || m.role === "assistant"
        );
        // Drop leading assistant messages
        const firstUserIdx = cleanMessages.findIndex((m: { role: string }) => m.role === "user");
        const apiMessages = firstUserIdx >= 0 ? cleanMessages.slice(firstUserIdx) : cleanMessages;

        if (apiMessages.length === 0) {
            return new Response(JSON.stringify({ reply: "Please ask me a question about your loan eligibility!" }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
        }

        const systemPrompt = `You are Veritas AI, an expert loan advisor assistant for the Indian market. 
You are currently chatting with an applicant who just completed a loan eligibility check.
Answer primarily based on the data provided below. Be helpful, concise, and actionable.
DO NOT invent fictional numbers. If you don't know, explicitly say so.

USER CONTEXT DATA:
${JSON.stringify(context || {}, null, 2)}`;

        const anthropicResponse = await fetch("https://api.anthropic.com/v1/messages", {
            method: "POST",
            headers: {
                "x-api-key": ANTHROPIC_API_KEY,
                "anthropic-version": "2023-06-01",
                "content-type": "application/json",
            },
            body: JSON.stringify({
                model: CLAUDE_MODEL,
                system: systemPrompt,
                max_tokens: 512,
                messages: apiMessages,
            }),
        });

        if (!anthropicResponse.ok) {
            const errBody = await anthropicResponse.text();
            throw new Error(`Claude API error: ${errBody}`);
        }

        const claudeData = await anthropicResponse.json();
        const replyText = claudeData.content?.[0]?.text ?? "";

        return new Response(JSON.stringify({ reply: replyText }), { headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    } catch (err) {
        return new Response(JSON.stringify({ error: String(err) }), { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } });
    }
});
