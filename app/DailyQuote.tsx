"use client";

import { useEffect, useState } from "react";
import type { Briefing, Quote } from "./lib/briefing-pool";
import { quotePool } from "./lib/briefing-pool";

const STORAGE_KEY = "daily-mind-expander-briefing";

function pickDailyFallback(): Quote {
  const today = new Date().toISOString().slice(0, 10);
  let hash = 0;
  for (let i = 0; i < today.length; i++) {
    hash = (hash * 31 + today.charCodeAt(i)) % 2147483647;
  }
  return quotePool[hash % quotePool.length];
}

export default function DailyQuote() {
  const [quote, setQuote] = useState<Quote | null>(null);

  useEffect(() => {
    let chosen: Quote | null = null;
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const briefing = JSON.parse(raw) as Briefing;
        if (briefing.quote?.text) {
          chosen = briefing.quote;
        }
      }
    } catch {}
    if (!chosen) {
      chosen = pickDailyFallback();
    }
    setQuote(chosen);
  }, []);

  if (!quote) {
    return (
      <div
        style={{
          marginTop: "16px",
          padding: "clamp(16px, 4.5vw, 20px) clamp(18px, 5vw, 24px)",
          borderRadius: "18px",
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid #1e293b",
          minHeight: "70px",
        }}
      />
    );
  }

  return (
    <div
      style={{
        marginTop: "16px",
        padding: "clamp(16px, 4.5vw, 20px) clamp(18px, 5vw, 24px)",
        borderRadius: "18px",
        background:
          "linear-gradient(135deg, rgba(56, 189, 248, 0.08), rgba(168, 85, 247, 0.08))",
        border: "1px solid rgba(56, 189, 248, 0.25)",
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: "clamp(15px, 4.2vw, 18px)",
          fontStyle: "italic",
          color: "#e0f2fe",
          lineHeight: 1.5,
        }}
      >
        &ldquo;{quote.text}&rdquo;
      </p>
      <p
        style={{
          margin: "8px 0 0 0",
          fontSize: "clamp(12px, 3.4vw, 14px)",
          color: "#7dd3fc",
          textAlign: "right",
        }}
      >
        — {quote.author}
      </p>
    </div>
  );
}
