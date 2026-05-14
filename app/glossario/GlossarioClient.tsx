"use client";

import { useEffect, useState } from "react";

const HISTORY_KEY = "daily-mind-expander-glossary-history";
const MAX_HISTORY = 20;

type HistoryItem = {
  query: string;
  answer: string;
  at: string;
};

function loadHistory(): HistoryItem[] {
  if (typeof localStorage === "undefined") return [];
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.slice(0, MAX_HISTORY);
  } catch {}
  return [];
}

function saveHistory(items: HistoryItem[]) {
  localStorage.setItem(HISTORY_KEY, JSON.stringify(items.slice(0, MAX_HISTORY)));
}

const SUGGESTIONS = [
  "Efeito Dunning-Kruger",
  "Paradoxo de Fermi",
  "Estoicismo",
  "Como funciona um motor de combustão",
  "Por que o céu é azul",
  "O que é a fotossíntese de forma profunda",
  "Quem foi Sun Tzu",
  "Teorema de Gödel",
];

export default function GlossarioClient() {
  const [query, setQuery] = useState("");
  const [answer, setAnswer] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [error, setError] = useState("");
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    setHistory(loadHistory());
  }, []);

  async function search(q: string) {
    const text = q.trim();
    if (!text || streaming) return;
    setStreaming(true);
    setError("");
    setAnswer("");
    try {
      const res = await fetch("/api/glossary", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: text }),
      });
      if (!res.ok) {
        let msg = `Erro ${res.status}`;
        try {
          const data = await res.json();
          msg = data.error || msg;
        } catch {}
        throw new Error(msg);
      }
      if (!res.body) throw new Error("Sem corpo");
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let acc = "";
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        acc += decoder.decode(value, { stream: true });
        setAnswer(acc);
      }
      const newItem: HistoryItem = {
        query: text,
        answer: acc,
        at: new Date().toISOString(),
      };
      const newHistory = [
        newItem,
        ...history.filter((h) => h.query !== text),
      ].slice(0, MAX_HISTORY);
      setHistory(newHistory);
      saveHistory(newHistory);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setStreaming(false);
    }
  }

  function loadFromHistory(item: HistoryItem) {
    setQuery(item.query);
    setAnswer(item.answer);
    setError("");
  }

  function clearHistory() {
    setHistory([]);
    saveHistory([]);
  }

  return (
    <div>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void search(query);
        }}
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ex: o que é o efeito Streisand?"
          style={{
            flex: "1 1 220px",
            padding: "14px 18px",
            borderRadius: "999px",
            border: "1px solid #334155",
            background: "rgba(2, 6, 23, 0.95)",
            color: "#e2e8f0",
            fontSize: "clamp(14px, 3.9vw, 16px)",
            fontFamily: "inherit",
            outline: "none",
          }}
        />
        <button
          type="submit"
          disabled={streaming || !query.trim()}
          style={{
            padding: "14px 22px",
            borderRadius: "999px",
            border: "none",
            background: streaming || !query.trim() ? "#475569" : "#22d3ee",
            color: "#020617",
            fontWeight: "bold",
            cursor: streaming || !query.trim() ? "not-allowed" : "pointer",
            fontSize: "clamp(14px, 4vw, 16px)",
          }}
        >
          {streaming ? "A explicar..." : "Procurar"}
        </button>
      </form>

      {!answer && !streaming && (
        <div style={{ marginTop: "16px" }}>
          <p
            style={{
              color: "#64748b",
              fontSize: "clamp(12px, 3.4vw, 14px)",
              margin: "0 0 8px 0",
            }}
          >
            Sugestões:
          </p>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => {
                  setQuery(s);
                  void search(s);
                }}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid #334155",
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "#cbd5e1",
                  cursor: "pointer",
                  fontSize: "clamp(12px, 3.2vw, 13px)",
                }}
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {error && (
        <p
          style={{
            marginTop: "16px",
            color: "#fca5a5",
            fontSize: "clamp(13px, 3.6vw, 15px)",
          }}
        >
          {error}
        </p>
      )}

      {answer && (
        <div
          style={{
            marginTop: "20px",
            padding: "clamp(18px, 5vw, 24px)",
            borderRadius: "18px",
            background: "rgba(15, 23, 42, 0.85)",
            border: "1px solid rgba(34, 211, 238, 0.3)",
          }}
        >
          {answer.split(/\n\s*\n/).filter((p) => p.trim()).map((para, i, arr) => (
            <p
              key={i}
              style={{
                margin: "0 0 12px 0",
                color: "#e2e8f0",
                lineHeight: 1.65,
                fontSize: "clamp(14px, 3.9vw, 16px)",
              }}
            >
              {para}
              {streaming && i === arr.length - 1 && (
                <span
                  style={{
                    display: "inline-block",
                    width: "0.6em",
                    marginLeft: "2px",
                    animation: "dme-blink 1s steps(2, start) infinite",
                    background: "#22d3ee",
                    height: "1.05em",
                    verticalAlign: "text-bottom",
                    borderRadius: "1px",
                  }}
                />
              )}
            </p>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div style={{ marginTop: "32px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <h3
              style={{
                margin: 0,
                fontSize: "clamp(16px, 4.4vw, 18px)",
                color: "#cbd5e1",
              }}
            >
              Pesquisas recentes
            </h3>
            <button
              onClick={clearHistory}
              style={{
                padding: "6px 12px",
                borderRadius: "999px",
                border: "1px solid #475569",
                background: "transparent",
                color: "#94a3b8",
                cursor: "pointer",
                fontSize: "clamp(11px, 3vw, 13px)",
              }}
            >
              Limpar
            </button>
          </div>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            {history.map((item, i) => (
              <button
                key={i}
                onClick={() => loadFromHistory(item)}
                style={{
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid #334155",
                  background: "rgba(15, 23, 42, 0.6)",
                  color: "#cbd5e1",
                  cursor: "pointer",
                  fontSize: "clamp(12px, 3.2vw, 13px)",
                }}
              >
                {item.query}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
