"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";

const marcText = ``;

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>([
    // Start with no initial message
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState(0); // Live valuation state
  const chatRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when messages or input change
  useEffect(() => {
    chatRef.current?.scrollTo({ top: chatRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, input]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;
    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg, { role: "ai", content: "" }]);
    setInput("");
    setLoading(true);
    try {
      // Prepare chat history for API (skip the intro message)
      const chatHistory = [
        ...messages
          .slice(1) // skip the intro in state
          .map((m) => ({ role: m.role === "ai" ? "assistant" : "user", content: m.content })),
        { role: "user", content: input },
      ];
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: chatHistory }),
      });
      if (!res.body) throw new Error("No response body");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let aiText = "";
      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          aiText += decoder.decode(value, { stream: true });
          // Try to extract only the content from the OpenAI stream
          const lines = aiText.split("\n").filter(Boolean);
          let streamed = "";
          for (const line of lines) {
            if (line.startsWith("data: ")) {
              const json = line.replace("data: ", "");
              if (json === "[DONE]") continue;
              try {
                const parsed = JSON.parse(json);
                streamed += parsed.choices?.[0]?.delta?.content || "";
              } catch {}
            }
          }
          // Check for VALUATION: $X in streamed
          const valuationMatch = streamed.match(/VALUATION: \$([0-9,.]+)/i);
          if (valuationMatch) {
            setValuation(Number(valuationMatch[1].replace(/,/g, "")));
            // Do NOT remove the valuation line from the displayed message
          }
          setMessages((msgs) => {
            const newMsgs = [...msgs];
            newMsgs[newMsgs.length - 1] = { role: "ai", content: streamed };
            return newMsgs;
          });
        }
      }
    } catch (err) {
      setMessages((msgs) => [
        ...msgs.slice(0, -1),
        { role: "ai", content: "Sorry, there was an error." },
      ]);
    }
    setLoading(false);
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-white">
      <div className="max-w-[500px] mx-auto w-full h-screen flex flex-col bg-white pb-8">
        <div ref={chatRef} className="flex-1 overflow-y-auto flex flex-col gap-6 px-1 pt-12 hide-scrollbar">
          {messages.map((msg, i) => (
            <div key={i} className="flex items-start gap-4 w-full">
              {msg.role === "ai" ? (
                <Image
                  src="/assets/marc_pic.png"
                  alt="Marc Andreessen's profile picture"
                  width={40}
                  height={40}
                  className="rounded-full border border-gray-200 mt-1"
                  priority
                />
              ) : (
                <div className="w-10" />
              )}
              <div className="flex flex-col flex-1">
                {msg.role === "ai" && <span className="font-bold text-sm mb-1">Marc Andreessen</span>}
                <div className={`text-base font-mono text-gray-900 whitespace-pre-wrap ${msg.role === "ai" ? "" : "text-right"}`}>
                  {msg.content || (loading && i === messages.length - 1 ? <span className="opacity-70">...</span> : null)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form className="w-full flex justify-center bg-white pt-[25px]" onSubmit={handleSend}>
          <input
            type="text"
            placeholder="Type your answer..."
            className="w-full px-4 py-3 font-mono text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            value={input}
            onChange={e => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </form>
      </div>
    </main>
  );
}
