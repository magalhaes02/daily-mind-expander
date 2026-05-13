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
              lineHeight: 1.75,
              margin: "0 0 12px 0",
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
        borderRadius: "18px",
        padding: "22px",
      }}
    >
      <p style={{ color: "#38bdf8", fontWeight: "bold", marginTop: 0 }}>
        {index + 1}. {item.category}
      </p>
      <h3 style={{ marginTop: 0, color: "#e0f2fe" }}>{item.title}</h3>
      <p style={{ color: "#e5e7eb", lineHeight: 1.7 }}>{item.text}</p>
      <p style={{ color: "#94a3b8", lineHeight: 1.6 }}>
        <strong>Porque importa:</strong> {item.relevance}
      </p>

      <button
        onClick={loadMore}
        disabled={streaming}
        style={{
          marginTop: "12px",
          padding: "10px 18px",
          borderRadius: "999px",
          border: "1px solid #38bdf8",
          background: expanded ? "rgba(56, 189, 248, 0.18)" : "transparent",
          color: "#7dd3fc",
          fontWeight: "bold",
          cursor: streaming ? "wait" : "pointer",
          fontSize: "14px",
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
        marginTop: "28px",
        padding: "24px",
        borderRadius: "20px",
        background: "linear-gradient(135deg, #0f172a, #172554)",
        border: "1px solid #1d4ed8",
      }}
    >
      <h3 style={{ marginTop: 0 }}>Pergunta para reflexão</h3>
      <p style={{ color: "#dbeafe", fontSize: "18px", lineHeight: 1.7 }}>
        {reflection}
      </p>

      <button
        onClick={loadExample}
        disabled={streaming}
        style={{
          marginTop: "4px",
          padding: "10px 18px",
          borderRadius: "999px",
          border: "1px solid #60a5fa",
          background: example ? "rgba(96, 165, 250, 0.18)" : "transparent",
          color: "#bfdbfe",
          fontWeight: "bold",
          cursor: streaming ? "wait" : "pointer",
          fontSize: "14px",
        }}
      >
        {streaming
          ? "A pensar..."
          : example
          ? "Ocultar exemplo"
          : "Ver exemplo de resposta"}
      </button>

      {error && (
        <p style={{ marginTop: "10px", color: "#fca5a5", fontSize: "14px" }}>
          {error}
        </p>
      )}

      {example && <ExpandedText text={example} streaming={streaming} />}

      <h3 style={{ marginTop: "24px" }}>Recomendação</h3>
      <p style={{ color: "#dbeafe", fontSize: "18px", lineHeight: 1.7 }}>
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
        marginTop: "48px",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid #334155",
        borderRadius: "28px",
        padding: "32px",
      }}
    >
      <p style={{ color: "#38bdf8", fontWeight: "bold", marginTop: 0 }}>
        Briefing
      </p>

      <h2 style={{ fontSize: "34px", marginTop: 0 }}>
        Expansão intelectual de hoje
      </h2>

      <p style={{ color: "#94a3b8", lineHeight: 1.7 }}>
        Em condições normais, recebes o briefing por notificação às 9h. Aqui
        podes também gerar um na hora — vai usar as tuas preferências de tema.
      </p>

      <div
        style={{
          display: "flex",
          gap: "12px",
          flexWrap: "wrap",
          marginTop: "12px",
        }}
      >
        <button
          onClick={fetchBriefing}
          disabled={loading}
          style={{
            padding: "14px 22px",
            borderRadius: "999px",
            border: "none",
            background: loading ? "#475569" : "#38bdf8",
            color: "#020617",
            fontWeight: "bold",
            cursor: loading ? "not-allowed" : "pointer",
            fontSize: "16px",
          }}
        >
          {loading ? "A gerar..." : "Gerar briefing agora"}
        </button>

        <button
          onClick={clearBriefing}
          style={{
            padding: "14px 22px",
            borderRadius: "999px",
            border: "1px solid #64748b",
            background: "transparent",
            color: "#e2e8f0",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "16px",
          }}
        >
          Limpar guardado
        </button>
      </div>

      {error && (
        <p style={{ marginTop: "16px", color: "#fbbf24" }}>{error}</p>
      )}

      {briefing && (
        <>
          <p style={{ marginTop: "16px", color: "#7dd3fc" }}>
            Briefing de {briefing.dateKey}
            {!isToday && " — não é o de hoje, gera novo para atualizar."}
            {briefing.source === "ai" ? " · gerado por IA" : " · do pool local"}
          </p>

          <div style={{ display: "grid", gap: "18px", marginTop: "24px" }}>
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
