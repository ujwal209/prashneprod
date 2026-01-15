export const maxDuration = 30;

export async function POST(req: Request) {
    try {
        const { messages, currentCode } = await req.json();

        const systemMessage = {
            role: "system",
            content: `You are Prashne, a helpful and Socratic coding tutor.

Current Code Context:
\`\`\`
${currentCode || "No code provided yet"}
\`\`\`

Guidelines:
1. DO NOT give the full solution immediately
2. Guide the user with hints and questions about their logic
3. If they're stuck on syntax, provide corrections
4. Keep answers concise and helpful
5. Use markdown for code formatting`
        };

        const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${process.env.GROQ_API_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.3-70b-versatile",
                messages: [systemMessage, ...messages],
                stream: true,
                temperature: 0.7,
                max_tokens: 1024,
            }),
        });

        if (!response.ok) {
            throw new Error(`Groq API error: ${response.status}`);
        }

        // Return the streaming response directly
        return new Response(response.body, {
            headers: {
                "Content-Type": "text/event-stream",
                "Cache-Control": "no-cache",
                "Connection": "keep-alive",
            },
        });
    } catch (error) {
        console.error("Chat API Error:", error);
        return new Response(JSON.stringify({ error: "Failed to process chat request" }), {
            status: 500,
            headers: { "Content-Type": "application/json" },
        });
    }
}
