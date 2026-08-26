"use client";

import Sidebar from "@/components/Sidebar";
import { useState } from "react";

type Message = { role: "user" | "assistant"; content: string };

export default function AiPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim()) return;
    const userMessage = input;
    setMessages((m) => [...m, { role: "user", content: userMessage }]);
    setInput("");
    setLoading(true);

    const res = await fetch("/api/ai/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: userMessage }),
    });
    const data = await res.json();

    setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    setLoading(false);
  }

  return (
    <div className="flex">
      <Sidebar active="/ai" />
      <main className="flex-1 md:ml-[240px] p-6 md:p-8 max-w-[900px] mx-auto w-full flex flex-col h-screen">
        <h1 className="text-2xl text-on-background mb-6">Study assistant</h1>

        <div className="flex-1 overflow-y-auto border border-outline-variant rounded-xl p-4 mb-4 flex flex-col gap-3 bg-surface-container-lowest">
          {messages.length === 0 && (
            <p className="text-on-surface-variant text-sm">
              Try: &quot;What should I study today?&quot;
            </p>
          )}
          {messages.map((m, i) => (
            <div
              key={i}
              className={
                m.role === "user"
                  ? "self-end bg-primary text-on-primary p-3 rounded-lg max-w-[80%]"
                  : "self-start bg-surface-container p-3 rounded-lg max-w-[80%]"
              }
            >
              {m.content}
            </div>
          ))}
          {loading && <p className="text-on-surface-variant text-sm">Thinking...</p>}
        </div>

        <form onSubmit={send} className="flex gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about your study plan..."
            className="border border-outline-variant rounded-lg p-2 flex-1"
          />
          <button type="submit" className="bg-primary text-on-primary px-4 py-2 rounded-lg">
            Send
          </button>
        </form>
      </main>
    </div>
  );
}