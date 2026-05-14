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
        position: "relative",
        marginTop: "20px",
        padding: "clamp(20px, 5.5vw, 28px) clamp(22px, 6vw, 30px)",
        borderRadius: "24px",
        background:
          "linear-gradient(135deg, rgba(56, 189, 248, 0.12), rgba(168, 85, 247, 0.12))",
        border: "2px solid rgba(56, 189, 248, 0.25)",
        boxShadow: "0 10px 32px rgba(56, 189, 248, 0.10)",
        overflow: "hidden",
      }}
    >
      <span
        aria-hidden
        style={{
          position: "absolute",
          top: "-10px",
          left: "16px",
          fontSize: "84px",
          color: "rgba(125, 211, 252, 0.18)",
          fontWeight: 900,
          lineHeight: 1,
          pointerEvents: "none",
        }}
      >
        &ldquo;
      </span>
      <p
        style={{
          position: "relative",
          margin: 0,
          fontSize: "clamp(16px, 4.5vw, 20px)",
          color: "#e0f2fe",
          lineHeight: 1.45,
          fontWeight: 700,
        }}
      >
        {quote.text}
      </p>
      <p
        style={{
          position: "relative",
          margin: "12px 0 0 0",
          fontSize: "clamp(12px, 3.4vw, 14px)",
          color: "#7dd3fc",
          textAlign: "right",
          fontWeight: 800,
          letterSpacing: "0.02em",
        }}
      >
        — {quote.author}
      </p>
    </div>
  );
}
