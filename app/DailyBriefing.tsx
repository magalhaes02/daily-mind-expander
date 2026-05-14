"use client";

import { useEffect, useState } from "react";
import type { Briefing, BriefingItem } from "./lib/briefing-pool";
import { loadPreferences } from "./TopicSelector";

const STORAGE_KEY = "daily-mind-expander-briefing";

function todayKeyLisbon(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function loadFromStorage(): Briefing | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Briefing;
    if (!parsed || !Array.isArray(parsed.items)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function saveToStorage(briefing: Briefing) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(briefing));
}

function ExpandedText({
  text,
  streaming,
}: {
  text: string;
  streaming?: boolean;
}) {
  const paragraphs = text.split(/\n\s*\n/).filter((p) => p.trim().length > 0);
  return (
    <div style={{ marginTop: "14px" }}>
      {paragraphs.map((para, i) => {
        const isLast = i === paragraphs.length - 1;
        return (
          <p
            key={i}
            style={{
              color: "#dbeafe",
              lineHeight: 1.65,
              margin: "0 0 12px 0",
              fontSize: "clamp(14px, 3.9vw, 16px)",
            }}
          >
            {para}
            {streaming && isLast && (
              <span
                style={{
                  display: "inline-block",
                  width: "0.6em",
                  marginLeft: "2px",
                  animation: "dme-blink 1s steps(2, start) infinite",
                  background: "#7dd3fc",
                  height: "1.05em",
                  verticalAlign: "text-bottom",
                  borderRadius: "1px",
                }}
              />
            )}
          </p>
        );
      })}
    </div>
  );
}

async function streamExpand(
  body: object,
  onChunk: (acc: string) => void
): Promise<void> {
  const res = await fetch("/api/expand", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    let msg = `Erro ${res.status}`;
    try {
      const data = await res.json();
      msg = data.error || msg;
    } catch {}
    throw new Error(msg);
  }

  if (!res.body) {
    throw new Error("Resposta sem corpo");
  }

  const reader = res.body.getReader();
  const decoder = new TextDecoder();
  let acc = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    acc += decoder.decode(value, { stream: true });
    onChunk(acc);
  }
}

function TopicCard({
  item,
  index,
}: {
  item: BriefingItem;
  index: number;
}) {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  async function loadMore() {
    if (streaming) return;
    if (expanded) {
      setExpanded(null);
      return;
    }
    setStreaming(true);
    setError("");
    setExpanded("");
    try {
      await streamExpand(
        {
          type: "topic",
          topic: {
            category: item.category,
            title: item.title,
            text: item.text,
            relevance: item.relevance,
          },
        },
        setExpanded
      );
    } catch (err) {
      setExpanded(null);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <article
      style={{
        background: "#020617",
        border: "1px solid #1e293b",
        borderRadius: "16px",
        padding: "clamp(16px, 4.5vw, 22px)",
      }}
    >
      <p
        style={{
          color: "#38bdf8",
          fontWeight: "bold",
          marginTop: 0,
          fontSize: "clamp(13px, 3.6vw, 15px)",
          marginBottom: "8px",
        }}
      >
        {index + 1}. {item.category}
      </p>
      <h3
        style={{
          marginTop: 0,
          marginBottom: "10px",
          color: "#e0f2fe",
          fontSize: "clamp(17px, 4.8vw, 20px)",
          lineHeight: 1.3,
        }}
      >
        {item.title}
      </h3>
      <p
        style={{
          color: "#e5e7eb",
          lineHeight: 1.6,
          fontSize: "clamp(14px, 3.9vw, 16px)",
          margin: "0 0 10px 0",
        }}
      >
        {item.text}
      </p>
      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.55,
          fontSize: "clamp(13px, 3.6vw, 15px)",
          margin: 0,
        }}
      >
        <strong>Porque importa:</strong> {item.relevance}
      </p>

      <button
        onClick={loadMore}
        disabled={streaming}
        style={{
          marginTop: "14px",
          padding: "10px 16px",
          borderRadius: "999px",
          border: "1px solid #38bdf8",
          background: expanded ? "rgba(56, 189, 248, 0.18)" : "transparent",
          color: "#7dd3fc",
          fontWeight: "bold",
          cursor: streaming ? "wait" : "pointer",
          fontSize: "clamp(12px, 3.4vw, 14px)",
        }}
      >
        {streaming
          ? "A explorar..."
          : expanded
          ? "Ocultar exploração"
          : "Ler mais ↓"}
      </button>

      {error && (
        <p style={{ marginTop: "10px", color: "#fca5a5", fontSize: "14px" }}>
          {error}
        </p>
      )}

      {expanded && <ExpandedText text={expanded} streaming={streaming} />}
    </article>
  );
}

function ReflectionSection({
  reflection,
  recommendation,
}: {
  reflection: string;
  recommendation: string;
}) {
  const [example, setExample] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");

  async function loadExample() {
    if (streaming) return;
    if (example) {
      setExample(null);
      return;
    }
    setStreaming(true);
    setError("");
    setExample("");
    try {
      await streamExpand(
        { type: "reflection", question: reflection },
        setExample
      );
    } catch (err) {
      setExample(null);
      setError(err instanceof Error ? err.message : "Erro desconhecido");
    } finally {
      setStreaming(false);
    }
  }

  return (
    <div
      style={{
        marginTop: "24px",
        padding: "clamp(18px, 5vw, 24px)",
        borderRadius: "18px",
        background: "linear-gradient(135deg, #0f172a, #172554)",
        border: "1px solid #1d4ed8",
      }}
    >
      <h3
        style={{
          marginTop: 0,
          marginBottom: "8px",
          fontSize: "clamp(16px, 4.5vw, 19px)",
        }}
      >
        Pergunta para reflexão
      </h3>
      <p
        style={{
          color: "#dbeafe",
          fontSize: "clamp(15px, 4.1vw, 17px)",
          lineHeight: 1.55,
          margin: "0 0 12px 0",
        }}
      >
        {reflection}
      </p>

      <button
        onClick={loadExample}
        disabled={streaming}
        style={{
          marginTop: "2px",
          padding: "10px 16px",
          borderRadius: "999px",
          border: "1px solid #60a5fa",
          background: example ? "rgba(96, 165, 250, 0.18)" : "transparent",
          color: "#bfdbfe",
          fontWeight: "bold",
          cursor: streaming ? "wait" : "pointer",
          fontSize: "clamp(12px, 3.4vw, 14px)",
        }}
      >
        {streaming
          ? "A pensar..."
          : example
          ? "Ocultar exemplo"
          : "Ver exemplo de resposta"}
      </button>

      {error && (
        <p
          style={{
            marginTop: "10px",
            color: "#fca5a5",
            fontSize: "clamp(12px, 3.4vw, 14px)",
          }}
        >
          {error}
        </p>
      )}

      {example && <ExpandedText text={example} streaming={streaming} />}

      <h3
        style={{
          marginTop: "20px",
          marginBottom: "8px",
          fontSize: "clamp(16px, 4.5vw, 19px)",
        }}
      >
        Recomendação
      </h3>
      <p
        style={{
          color: "#dbeafe",
          fontSize: "clamp(15px, 4.1vw, 17px)",
          lineHeight: 1.55,
          margin: 0,
        }}
      >
        {recommendation}
      </p>
    </div>
  );
}

export default function DailyBriefing() {
  const [briefing, setBriefing] = useState<Briefing | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const stored = loadFromStorage();
    const today = todayKeyLisbon();
    if (stored && stored.dateKey === today) {
      setBriefing(stored);
      return;
    }
    if (stored) setBriefing(stored);
    void fetchBriefingAuto();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function fetchBriefingAuto() {
    setLoading(true);
    setError("");
    try {
      const preferences = loadPreferences();
      const url = preferences.length
        ? `/api/briefing?topics=${encodeURIComponent(preferences.join(","))}`
        : "/api/briefing";
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) return;
      const data = (await res.json()) as Briefing;
      if (Array.isArray(data.items) && data.items.length > 0) {
        setBriefing(data);
        saveToStorage(data);
      }
    } catch {
      // silent — user can use the manual button
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (typeof navigator === "undefined" || !("serviceWorker" in navigator))
      return;

    function onMessage(event: MessageEvent) {
      if (event.data?.type === "briefing-received" && event.data.briefing) {
        const incoming = event.data.briefing as Briefing;
        setBriefing(incoming);
        saveToStorage(incoming);
      }
    }

    navigator.serviceWorker.addEventListener("message", onMessage);
    return () => {
      navigator.serviceWorker.removeEventListener("message", onMessage);
    };
  }, []);

  async function fetchBriefing() {
    setLoading(true);
    setError("");
    try {
      const preferences = loadPreferences();
      const url = preferences.length
        ? `/api/briefing?topics=${encodeURIComponent(preferences.join(","))}`
        : "/api/briefing";

      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error(`API ${res.status}`);
      const data = (await res.json()) as Briefing & { fallbackReason?: string };
      setBriefing(data);
      saveToStorage(data);
      if (data.fallbackReason) {
        setError(`Usado pool local: ${data.fallbackReason}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro a gerar briefing");
    } finally {
      setLoading(false);
    }
  }

  function clearBriefing() {
    localStorage.removeItem(STORAGE_KEY);
    setBriefing(null);
    setError("");
  }

  const today = todayKeyLisbon();
  const isToday = briefing?.dateKey === today;

  return (
    <section
      style={{
        marginTop: "32px",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid #334155",
        borderRadius: "22px",
        padding: "clamp(18px, 5vw, 32px)",
      }}
    >
      <p
        style={{
          color: "#38bdf8",
          fontWeight: "bold",
          marginTop: 0,
          fontSize: "clamp(13px, 3.5vw, 15px)",
          marginBottom: "6px",
        }}
      >
        Briefing
      </p>

      <h2
        style={{
          fontSize: "clamp(22px, 6.5vw, 34px)",
          marginTop: 0,
          marginBottom: "10px",
          lineHeight: 1.15,
        }}
      >
        Expansão intelectual de hoje
      </h2>

      <p
        style={{
          color: "#94a3b8",
          lineHeight: 1.6,
          fontSize: "clamp(14px, 3.8vw, 16px)",
          margin: 0,
        }}
      >
        Em condições normais, recebes o briefing por notificação às 9h. Aqui
        podes também gerar um na hora — vai usar as tuas preferências de tema.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "14px",
        }}
      >
        <button
          onClick={fetchBriefing}
          disabled={loading}
          style={{
            padding: "clamp(12px, 3.5vw, 14px) clamp(18px, 5vw, 22px)",
            borderRadius: "999px",
            border: "none",
            background: loading ? "#475569" : "#38bdf8",
            color: "#020617",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "clamp(14px, 4vw, 16px)",
            flex: "1 1 auto",
          }}
        >
          {loading ? "A gerar..." : "Gerar briefing agora"}
        </button>

        <button
          onClick={clearBriefing}
          style={{
            padding: "clamp(12px, 3.5vw, 14px) clamp(18px, 5vw, 22px)",
            borderRadius: "999px",
            border: "1px solid #64748b",
            background: "transparent",
            color: "#e2e8f0",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "clamp(14px, 4vw, 16px)",
          }}
        >
          Limpar guardado
        </button>
      </div>

      {error && (
        <p
          style={{
            marginTop: "14px",
            color: "#fbbf24",
            fontSize: "clamp(13px, 3.6vw, 15px)",
          }}
        >
          {error}
        </p>
      )}

      {briefing && (
        <>
          <p
            style={{
              marginTop: "14px",
              color: "#7dd3fc",
              fontSize: "clamp(13px, 3.6vw, 15px)",
            }}
          >
            Briefing de {briefing.dateKey}
            {!isToday && " — não é o de hoje, gera novo para atualizar."}
            {briefing.source === "ai" ? " · gerado por IA" : " · do pool local"}
          </p>

          <div style={{ display: "grid", gap: "14px", marginTop: "20px" }}>
            {briefing.items.map((item, index) => (
              <TopicCard
                key={`${item.title}-${index}`}
                item={item}
                index={index}
              />
            ))}
          </div>

          <ReflectionSection
            reflection={briefing.reflection}
            recommendation={briefing.recommendation}
          />
        </>
      )}

      {!briefing && !loading && (
        <p style={{ marginTop: "20px", color: "#94a3b8" }}>
          Ainda não há briefing guardado. Toca em &quot;Gerar briefing
          agora&quot;.
        </p>
      )}
    </section>
  );
}
