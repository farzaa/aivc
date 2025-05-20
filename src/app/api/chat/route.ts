import { NextRequest } from "next/server";
import { BOT_PROMPTS } from "@/app/data/botPrompts";

export const runtime = "edge";

export async function POST(req: NextRequest) {
  const { messages, bot } = await req.json();
  const apiKey = req.headers.get("x-openai-api-key");

  if (!apiKey) {
    return new Response("OpenAI API key not provided", { status: 401 });
  }

  const apiRes = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-4",
      stream: true,
      messages: [
        {
          role: "system",
          content: BOT_PROMPTS[bot as keyof typeof BOT_PROMPTS],
        },
        ...messages,
      ],
      temperature: 1.0,
    }),
  });

  if (!apiRes.ok) {
    console.error("OpenAI API error:", await apiRes.text());
    throw new Error("OpenAI API error");
  }

  return new Response(apiRes.body, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
