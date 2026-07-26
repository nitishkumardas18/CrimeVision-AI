import { createFileRoute } from "@tanstack/react-router";
import { TopBar } from "@/components/TopBar";
import { Panel } from "@/components/Panel";
import { useState } from "react";
import { Bot, Send, Sparkles, User } from "lucide-react";

export const Route = createFileRoute("/assistant")({
  head: () => ({
    meta: [
      { title: "AI Assistant — CrimeVision AI" },
      { name: "description", content: "Ask the AI intelligence assistant about crime patterns, cases, and predictions." },
      { property: "og:title", content: "AI Assistant — CrimeVision AI" },
      { property: "og:description", content: "AI intelligence assistant for Karnataka Police." },
    ],
  }),
  component: Assistant,
});

const initialMessages = [
  {
    role: "assistant" as const,
    content:
      "Namaskara. I'm CrimeVision AI. I can analyze cases, predict hotspots, cross-reference FIRs, and surface actionable intelligence. What would you like to investigate today?",
  },
  {
    role: "user" as const,
    content: "Give me a summary of Bengaluru South crime trends this week.",
  },
  {
    role: "assistant" as const,
    content:
      "Bengaluru South reported 312 incidents this week — up 8.2% WoW. Vehicle theft (34%) and chain snatching (22%) are dominant. AI models show 87% probability of vehicle theft in Jayanagar/JP Nagar in the next 48h. Recommend increased night patrolling on Kanakapura Road and CCTV escalation in 4 flagged zones.",
  },
];

const suggestions = [
  "Show repeat offenders active this month",
  "Predict crime for Mysuru next weekend",
  "Compare 2025 vs 2026 cybercrime cases",
  "Summarize FIR-2026-08419",
];

function Assistant() {
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");

  const send = (text?: string) => {
    const q = (text ?? input).trim();
    if (!q) return;
    setMessages((m) => [
      ...m,
      { role: "user", content: q },
      {
        role: "assistant",
        content:
          "Analyzing… Based on aggregated FIR data and predictive models, here's a synthesized intelligence brief matching your query. (Demo response — AI Engine disconnected in offline mode.)",
      },
    ]);
    setInput("");
  };

  return (
    <div>
      <TopBar title="AI Intelligence Assistant" subtitle="Conversational access to CrimeVision AI models" />
      <div className="p-4 md:p-8 grid gap-6 grid-cols-1 xl:grid-cols-[1fr_320px]">
        <Panel title="Conversation" subtitle="Secure channel • End-to-end encrypted">
          <div className="flex flex-col h-[560px]">
            <div className="flex-1 overflow-y-auto scrollbar-thin space-y-4 pr-2">
              {messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === "user" ? "flex-row-reverse" : ""}`}>
                  <div
                    className={`grid h-9 w-9 shrink-0 place-items-center rounded-lg ${
                      m.role === "user"
                        ? "bg-secondary text-secondary-foreground"
                        : "bg-gradient-to-br from-primary to-info text-primary-foreground gov-glow"
                    }`}
                  >
                    {m.role === "user" ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                  </div>
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      m.role === "user"
                        ? "bg-primary/15 border border-primary/25"
                        : "gov-card"
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 border-t border-border pt-4">
              <div className="flex gap-2 rounded-xl border border-border bg-input/50 p-2">
                <input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && send()}
                  placeholder="Ask about crimes, suspects, districts, predictions..."
                  className="flex-1 bg-transparent outline-none text-sm px-2"
                />
                <button
                  onClick={() => send()}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:opacity-90 transition"
                >
                  <Send className="h-4 w-4" /> Send
                </button>
              </div>
            </div>
          </div>
        </Panel>

        <div className="space-y-4">
          <Panel title="Quick Prompts" subtitle="Common intelligence queries">
            <div className="space-y-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => send(s)}
                  className="w-full text-left rounded-lg border border-border bg-card/50 px-3 py-2.5 text-xs hover:border-primary/40 hover:bg-accent/40 transition flex items-center gap-2"
                >
                  <Sparkles className="h-3.5 w-3.5 text-primary shrink-0" />
                  <span className="line-clamp-2">{s}</span>
                </button>
              ))}
            </div>
          </Panel>

          <Panel title="Model Status" subtitle="Live model diagnostics">
            {[
              { name: "Threat Prediction v4.2", status: "operational", load: 68 },
              { name: "Network Analysis v3.1", status: "operational", load: 42 },
              { name: "NLP Case Summarizer", status: "operational", load: 55 },
              { name: "Face Recognition v2.9", status: "degraded", load: 91 },
            ].map((m) => (
              <div key={m.name} className="mb-3 last:mb-0">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium truncate">{m.name}</span>
                  <span
                    className={`text-[10px] uppercase tracking-wider ${
                      m.status === "operational" ? "text-success" : "text-warning"
                    }`}
                  >
                    {m.status}
                  </span>
                </div>
                <div className="mt-1.5 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className={`h-full ${m.status === "operational" ? "bg-success" : "bg-warning"}`}
                    style={{ width: `${m.load}%` }}
                  />
                </div>
              </div>
            ))}
          </Panel>
        </div>
      </div>
    </div>
  );
}
