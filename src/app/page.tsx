"use client";
import Image from "next/image";
import { useRef, useState, useEffect } from "react";
import { ValuationTicker } from "./components/ValuationTicker";
import { ApiKeyManager } from "./components/ApiKeyManager";
import { BotSelector, BotType } from "./components/BotSelector";

const INITIAL_MESSAGES = {
  marc: "Hey, I'm Marc. What are you building? Let's talk about your startup.",
  farza:
    "yo! what are you building? let's see if it's actually gonna work lol 🚀",
  sam: "Hi, I'm Sam. I'd love to hear about your vision and how you see it shaping the future.",
};

export default function Home() {
  const [messages, setMessages] = useState<{ role: string; content: string }[]>(
    []
  );
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [valuation, setValuation] = useState(0);
  const [selectedBot, setSelectedBot] = useState<BotType>("marc");
  const chatRef = useRef<HTMLDivElement>(null);

  // Add initial message when component mounts
  useEffect(() => {
    setMessages([{ role: "ai", content: INITIAL_MESSAGES[selectedBot] }]);
  }, []);

  // Clear chat and add new initial message when bot changes
  const handleBotChange = (bot: BotType) => {
    setSelectedBot(bot);
    setMessages([{ role: "ai", content: INITIAL_MESSAGES[bot] }]);
    setValuation(0);
  };

  useEffect(() => {
    chatRef.current?.scrollTo({
      top: chatRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, input]);

  const parseValuation = (valStr: string): number => {
    const num = parseFloat(valStr.replace(/,/g, ""));
    if (valStr.toUpperCase().endsWith("M")) return num * 1000000;
    if (valStr.toUpperCase().endsWith("B")) return num * 1000000000;
    return num;
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const apiKey = localStorage.getItem("openai_api_key");
    if (!apiKey) {
      alert("Please set your OpenAI API key first");
      return;
    }

    const userMsg = { role: "user", content: input };
    setMessages((msgs) => [...msgs, userMsg, { role: "ai", content: "" }]);
    setInput("");
    setLoading(true);

    try {
      const chatHistory = [
        ...messages.map((m) => ({
          role: m.role === "ai" ? "assistant" : "user",
          content: m.content,
        })),
        { role: "user", content: input },
      ];

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-openai-api-key": apiKey,
        },
        body: JSON.stringify({ messages: chatHistory, bot: selectedBot }),
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
          const valuationMatch = streamed.match(
            /VALUATION: \$([0-9,.]+[MB]?)/i
          );
          if (valuationMatch) {
            setValuation(parseValuation(valuationMatch[1]));
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

  const getBotImage = () => {
    switch (selectedBot) {
      case "marc":
        return "/assets/marc_pic.png";
      case "farza":
        return "/assets/farza_pic.jpg";
      case "sam":
        return "/assets/sam_pic.png";
    }
  };

  const getBotName = () => {
    switch (selectedBot) {
      case "marc":
        return "Marc Andreessen";
      case "farza":
        return "Farza";
      case "sam":
        return "Sam Altman";
    }
  };

  return (
    <main className="flex min-h-screen flex-col bg-white">
      <ApiKeyManager />
      <BotSelector selectedBot={selectedBot} onBotChange={handleBotChange} />
      <ValuationTicker valuation={valuation} />
      <div className="max-w-[500px] ml-8 w-full h-screen flex flex-col bg-white pb-8">
        <div
          ref={chatRef}
          className="flex-1 overflow-y-auto flex flex-col gap-6 px-1 pt-12 hide-scrollbar"
        >
          {messages.map((msg, i) => (
            <div key={i} className="flex items-start gap-4 w-full">
              {msg.role === "ai" ? (
                <Image
                  src={getBotImage()}
                  alt={`${getBotName()}'s profile picture`}
                  width={40}
                  height={40}
                  className="rounded-full border border-gray-200 mt-1"
                  priority
                />
              ) : (
                <div className="w-10" />
              )}
              <div className="flex flex-col flex-1">
                {msg.role === "ai" && (
                  <span className="font-bold text-sm mb-1">{getBotName()}</span>
                )}
                <div
                  className={`text-base font-mono text-gray-900 whitespace-pre-wrap ${
                    msg.role === "ai" ? "" : "text-right"
                  }`}
                >
                  {msg.content ||
                    (loading && i === messages.length - 1 ? (
                      <span className="opacity-70">...</span>
                    ) : null)}
                </div>
              </div>
            </div>
          ))}
        </div>
        <form
          className="w-full flex justify-center bg-white pt-[25px]"
          onSubmit={handleSend}
        >
          <input
            type="text"
            placeholder="Type your answer..."
            className="w-full px-4 py-3 font-mono text-base border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={loading}
            autoFocus
          />
        </form>
      </div>
    </main>
  );
}
