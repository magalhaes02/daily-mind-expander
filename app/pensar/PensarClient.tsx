"use client";

import { useEffect, useState } from "react";

type ReflectionData = {
  question: string;
  context: string;
  category: string;
};

type ExpandStreamCallback = (acc: string) => void;

async function streamExpand(
  body: object,
  onChunk: ExpandStreamCallback
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
  if (!res.body) throw new Error("Sem corpo");
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

const NOTES_KEY = "daily-mind-expander-pensar-notes";

type SavedNotes = Record<string, string>;

function loadNotes(): SavedNotes {
  if (typeof localStorage === "undefined") return {};
  try {
    const raw = localStorage.getItem(NOTES_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === "object") return parsed as SavedNotes;
  } catch {}
  return {};
}

function saveNotes(notes: SavedNotes) {
  localStorage.setItem(NOTES_KEY, JSON.stringify(notes));
}

export default function PensarClient() {
  const [data, setData] = useState<ReflectionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [example, setExample] = useState<string | null>(null);
  const [exampleStreaming, setExampleStreaming] = useState(false);
  const [exampleError, setExampleError] = useState("");
  const [note, setNote] = useState("");
  const [savedFeedback, setSavedFeedback] = useState(false);

  async function load() {
    setLoading(true);
    setError("");
    setExample(null);
    setExampleError("");
    try {
      const res = await fetch("/api/reflection", { cache: "no-store" });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || `Erro ${res.status}`);
      setData(json);
      const notes = loadNotes();
      setNote(notes[json.question] ?? "");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function showExample() {
    if (!data) return;
    if (example) {
      setExample(null);
      return;
    }
    setExampleStreaming(true);
    setExampleError("");
    setExample("");
    try {
      await streamExpand(
        { type: "reflection", question: data.question },
        setExample
      );
    } catch (err) {
      setExample(null);
      setExampleError(err instanceof Error ? err.message : "Erro");
    } finally {
      setExampleStreaming(false);
    }
  }

  function saveNote() {
    if (!data) return;
    const notes = loadNotes();
    if (note.trim()) {
      notes[data.question] = note;
    } else {
      delete notes[data.question];
    }
    saveNotes(notes);
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  }

  if (loading) {
    return (
      <p style={{ color: "#94a3b8", fontSize: "clamp(14px, 3.8vw, 16px)" }}>
        A procurar uma pergunta digna do teu tempo…
      </p>
    );
  }

  if (error) {
    return (
      <div>
        <p style={{ color: "#fca5a5", fontSize: "clamp(14px, 3.8vw, 16px)" }}>
          {error}
        </p>
        <button
          onClick={load}
          style={{
            marginTop: "12px",
            padding: "12px 20px",
            borderRadius: "999px",
            border: "none",
            background: "#facc15",
            color: "#020617",
            fontWeight: "bold",
            cursor: "pointer",
          }}
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div>
      <div
        style={{
          padding: "clamp(20px, 5.5vw, 28px)",
          borderRadius: "22px",
          background:
            "linear-gradient(135deg, rgba(250, 204, 21, 0.10), rgba(15, 23, 42, 0.95))",
          border: "1px solid rgba(250, 204, 21, 0.30)",
        }}
      >
        {data.category && (
          <p
            style={{
              margin: "0 0 10px 0",
              color: "#facc15",
              fontWeight: "bold",
              fontSize: "clamp(12px, 3.3vw, 14px)",
              textTransform: "uppercase",
              letterSpacing: "0.05em",
            }}
          >
            {data.category}
          </p>
        )}
        <h2
          style={{
            margin: "0 0 12px 0",
            fontSize: "clamp(20px, 5.5vw, 26px)",
            lineHeight: 1.3,
            color: "#fef3c7",
          }}
        >
          {data.question}
        </h2>
        {data.context && (
          <p
            style={{
              margin: 0,
              color: "#cbd5e1",
              fontSize: "clamp(14px, 3.8vw, 16px)",
              lineHeight: 1.6,
              fontStyle: "italic",
            }}
          >
            {data.context}
          </p>
        )}
      </div>

      <div
        style={{
          marginTop: "16px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={showExample}
          disabled={exampleStreaming}
          style={{
            padding: "12px 20px",
            borderRadius: "999px",
            border: "1px solid #60a5fa",
            background: example ? "rgba(96, 165, 250, 0.18)" : "transparent",
            color: "#bfdbfe",
            fontWeight: "bold",
            cursor: exampleStreaming ? "wait" : "pointer",
            fontSize: "clamp(13px, 3.7vw, 15px)",
          }}
        >
          {exampleStreaming
            ? "A pensar..."
            : example
            ? "Ocultar exemplo"
            : "Ver exemplo de resposta"}
        </button>
        <button
          onClick={load}
          style={{
            padding: "12px 20px",
            borderRadius: "999px",
            border: "1px solid #64748b",
            background: "transparent",
            color: "#e2e8f0",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "clamp(13px, 3.7vw, 15px)",
          }}
        >
          Nova pergunta
        </button>
      </div>

      {exampleError && (
        <p
          style={{
            marginTop: "12px",
            color: "#fca5a5",
            fontSize: "clamp(13px, 3.6vw, 15px)",
          }}
        >
          {exampleError}
        </p>
      )}

      {example && (
        <div
          style={{
            marginTop: "16px",
            padding: "clamp(16px, 4.5vw, 20px)",
            borderRadius: "16px",
            background: "rgba(15, 23, 42, 0.7)",
            border: "1px solid #334155",
          }}
        >
          {example.split(/\n\s*\n/).filter((p) => p.trim()).map((para, i) => (
            <p
              key={i}
              style={{
                margin: "0 0 12px 0",
                color: "#dbeafe",
                lineHeight: 1.65,
                fontSize: "clamp(14px, 3.9vw, 16px)",
              }}
            >
              {para}
              {exampleStreaming &&
                i ===
                  example.split(/\n\s*\n/).filter((p) => p.trim()).length -
                    1 && (
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
          ))}
        </div>
      )}

      <div
        style={{
          marginTop: "24px",
          padding: "clamp(16px, 4.5vw, 22px)",
          borderRadius: "16px",
          background: "rgba(15, 23, 42, 0.6)",
          border: "1px solid #334155",
        }}
      >
        <label
          style={{
            display: "block",
            color: "#cbd5e1",
            fontSize: "clamp(13px, 3.6vw, 15px)",
            fontWeight: "bold",
            marginBottom: "8px",
          }}
        >
          As tuas notas
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Escreve aqui o que pensaste — fica guardado neste dispositivo."
          rows={5}
          style={{
            width: "100%",
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #334155",
            background: "#020617",
            color: "#e2e8f0",
            fontSize: "clamp(14px, 3.8vw, 16px)",
            fontFamily: "inherit",
            lineHeight: 1.5,
            resize: "vertical",
          }}
        />
        <div
          style={{
            marginTop: "10px",
            display: "flex",
            gap: "10px",
            alignItems: "center",
          }}
        >
          <button
            onClick={saveNote}
            style={{
              padding: "10px 18px",
              borderRadius: "999px",
              border: "none",
              background: "#facc15",
              color: "#020617",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "clamp(13px, 3.6vw, 15px)",
            }}
          >
            Guardar nota
          </button>
          {savedFeedback && (
            <span style={{ color: "#86efac", fontSize: "13px" }}>Guardado.</span>
          )}
        </div>
      </div>
    </div>
  );
}
