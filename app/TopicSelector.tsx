"use client";

import { useEffect, useState } from "react";
import { ALL_TOPICS } from "./lib/topics";

const PREFS_KEY = "daily-mind-expander-preferences";

export function loadPreferences(): string[] {
  if (typeof localStorage === "undefined") return [];
  const raw = localStorage.getItem(PREFS_KEY);
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function savePreferences(topics: string[]) {
  localStorage.setItem(PREFS_KEY, JSON.stringify(topics));
}

export default function TopicSelector() {
  const [selected, setSelected] = useState<string[]>([]);
  const [expanded, setExpanded] = useState(false);
  const [showCopyHint, setShowCopyHint] = useState(false);

  useEffect(() => {
    setSelected(loadPreferences());
  }, []);

  function toggle(topic: string) {
    setSelected((prev) => {
      const next = prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic];
      savePreferences(next);
      return next;
    });
  }

  function selectAll() {
    setSelected(ALL_TOPICS);
    savePreferences(ALL_TOPICS);
  }

  function clearAll() {
    setSelected([]);
    savePreferences([]);
  }

  function copyEnvValue() {
    if (selected.length === 0) return;
    navigator.clipboard.writeText(selected.join(","));
    setShowCopyHint(true);
    setTimeout(() => setShowCopyHint(false), 3000);
  }

  const summary =
    selected.length === 0
      ? "Sem preferências — vais receber a mistura completa"
      : selected.length === ALL_TOPICS.length
      ? "Todos os temas selecionados"
      : `${selected.length} de ${ALL_TOPICS.length} temas preferidos`;

  return (
    <section
      style={{
        marginTop: "32px",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid #334155",
        borderRadius: "22px",
        padding: "clamp(18px, 5vw, 28px)",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          gap: "12px",
          flexWrap: "wrap",
        }}
      >
        <div style={{ flex: "1 1 auto", minWidth: 0 }}>
          <h2
            style={{
              marginTop: 0,
              marginBottom: "4px",
              fontSize: "clamp(18px, 5vw, 22px)",
            }}
          >
            Os teus temas preferidos
          </h2>
          <p
            style={{
              margin: 0,
              color: "#94a3b8",
              lineHeight: 1.55,
              fontSize: "clamp(13px, 3.6vw, 15px)",
            }}
          >
            {summary}
          </p>
        </div>

        <button
          onClick={() => setExpanded((v) => !v)}
          style={{
            padding: "10px 16px",
            borderRadius: "999px",
            border: "1px solid #38bdf8",
            background: "transparent",
            color: "#7dd3fc",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "clamp(12px, 3.4vw, 14px)",
            whiteSpace: "nowrap",
          }}
        >
          {expanded ? "Ocultar" : "Editar preferências"}
        </button>
      </div>

      {expanded && (
        <>
          <p
            style={{
              color: "#cbd5e1",
              lineHeight: 1.6,
              marginTop: "20px",
              marginBottom: "12px",
            }}
          >
            Toca nos chips para selecionar os temas que mais te interessam. A
            IA vai dar mais peso a estes mas continua a abrir horizontes com
            outros temas (10-20%).
          </p>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
              marginBottom: "16px",
            }}
          >
            <button
              onClick={selectAll}
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                border: "1px solid #475569",
                background: "transparent",
                color: "#e2e8f0",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Selecionar todos
            </button>
            <button
              onClick={clearAll}
              style={{
                padding: "8px 14px",
                borderRadius: "999px",
                border: "1px solid #475569",
                background: "transparent",
                color: "#e2e8f0",
                cursor: "pointer",
                fontSize: "13px",
              }}
            >
              Limpar tudo
            </button>
          </div>

          <div
            style={{
              display: "flex",
              gap: "8px",
              flexWrap: "wrap",
            }}
          >
            {ALL_TOPICS.map((topic) => {
              const active = selected.includes(topic);
              return (
                <button
                  key={topic}
                  onClick={() => toggle(topic)}
                  style={{
                    padding: "8px 14px",
                    borderRadius: "999px",
                    border: active ? "1px solid #38bdf8" : "1px solid #334155",
                    background: active
                      ? "rgba(56, 189, 248, 0.18)"
                      : "rgba(15, 23, 42, 0.6)",
                    color: active ? "#e0f2fe" : "#cbd5e1",
                    fontWeight: active ? "bold" : "normal",
                    cursor: "pointer",
                    fontSize: "13px",
                    transition: "all 0.15s",
                  }}
                >
                  {active ? "✓ " : ""}
                  {topic}
                </button>
              );
            })}
          </div>

          {selected.length > 0 && (
            <div
              style={{
                marginTop: "20px",
                padding: "16px",
                borderRadius: "14px",
                background: "rgba(15, 23, 42, 0.6)",
                border: "1px solid #1e293b",
              }}
            >
              <p
                style={{
                  margin: 0,
                  color: "#94a3b8",
                  fontSize: "13px",
                  lineHeight: 1.6,
                }}
              >
                Para o briefing das 9h também usar estas preferências, copia o
                valor abaixo para a variável <code>PREFERRED_TOPICS</code> no
                Vercel.
              </p>
              <button
                onClick={copyEnvValue}
                style={{
                  marginTop: "12px",
                  padding: "8px 14px",
                  borderRadius: "999px",
                  border: "1px solid #38bdf8",
                  background: "transparent",
                  color: "#7dd3fc",
                  fontWeight: "bold",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Copiar valor para PREFERRED_TOPICS
              </button>
              {showCopyHint && (
                <span style={{ marginLeft: "12px", color: "#86efac" }}>
                  Copiado.
                </span>
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}
