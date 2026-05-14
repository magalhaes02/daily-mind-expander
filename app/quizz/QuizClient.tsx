"use client";

import { useEffect, useState } from "react";
import { loadPreferences } from "../TopicSelector";

type Question = {
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
};

type QuizState = {
  questions: Question[];
  currentIndex: number;
  selectedIndex: number | null;
  revealed: boolean;
  score: number;
};

export default function QuizClient() {
  const [state, setState] = useState<QuizState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [finished, setFinished] = useState(false);

  async function loadQuiz() {
    setLoading(true);
    setError("");
    setFinished(false);
    try {
      const preferences = loadPreferences();
      const url = preferences.length
        ? `/api/quiz?topics=${encodeURIComponent(preferences.join(","))}`
        : "/api/quiz";
      const res = await fetch(url, { cache: "no-store" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Erro ${res.status}`);
      if (!Array.isArray(data.questions) || data.questions.length === 0) {
        throw new Error("Quizz vazio");
      }
      setState({
        questions: data.questions,
        currentIndex: 0,
        selectedIndex: null,
        revealed: false,
        score: 0,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro a carregar quiz");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadQuiz();
  }, []);

  function selectOption(i: number) {
    if (!state || state.revealed) return;
    setState({ ...state, selectedIndex: i });
  }

  function reveal() {
    if (!state || state.selectedIndex === null) return;
    const correct = state.selectedIndex === state.questions[state.currentIndex].correctIndex;
    setState({
      ...state,
      revealed: true,
      score: state.score + (correct ? 1 : 0),
    });
  }

  function nextQuestion() {
    if (!state) return;
    const next = state.currentIndex + 1;
    if (next >= state.questions.length) {
      setFinished(true);
      return;
    }
    setState({
      ...state,
      currentIndex: next,
      selectedIndex: null,
      revealed: false,
    });
  }

  if (loading) {
    return (
      <p style={{ color: "#94a3b8", fontSize: "clamp(14px, 3.8vw, 16px)" }}>
        A preparar 5 perguntas para ti…
      </p>
    );
  }

  if (error) {
    return (
      <div
        style={{
          padding: "clamp(18px, 5vw, 24px)",
          borderRadius: "16px",
          background: "rgba(239, 68, 68, 0.08)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
        }}
      >
        <p
          style={{
            color: "#fca5a5",
            fontSize: "clamp(14px, 3.8vw, 16px)",
            margin: 0,
            lineHeight: 1.55,
          }}
        >
          {error}
        </p>
        <button
          onClick={loadQuiz}
          style={{
            marginTop: "14px",
            padding: "12px 20px",
            borderRadius: "999px",
            border: "none",
            background: "#a855f7",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "clamp(13px, 3.7vw, 15px)",
          }}
        >
          Tentar de novo
        </button>
      </div>
    );
  }

  if (!state) return null;

  if (finished) {
    const total = state.questions.length;
    const pct = Math.round((state.score / total) * 100);
    return (
      <div
        style={{
          padding: "clamp(20px, 5vw, 28px)",
          borderRadius: "22px",
          background:
            "linear-gradient(135deg, rgba(168, 85, 247, 0.15), rgba(15, 23, 42, 0.9))",
          border: "1px solid rgba(168, 85, 247, 0.35)",
          textAlign: "center",
        }}
      >
        <p style={{ fontSize: "clamp(14px, 3.8vw, 16px)", color: "#c4b5fd", margin: 0 }}>
          Pontuação final
        </p>
        <p
          style={{
            fontSize: "clamp(44px, 13vw, 64px)",
            fontWeight: "bold",
            margin: "8px 0",
            color: "#fff",
            lineHeight: 1,
          }}
        >
          {state.score}/{total}
        </p>
        <p style={{ color: "#cbd5e1", fontSize: "clamp(13px, 3.6vw, 15px)", margin: 0 }}>
          {pct >= 80
            ? "Excelente. Sabes muito mais que a média."
            : pct >= 50
            ? "Sólido. Há espaço para crescer."
            : "Aprendeste algo novo — é esse o ponto."}
        </p>
        <button
          onClick={loadQuiz}
          style={{
            marginTop: "20px",
            padding: "14px 24px",
            borderRadius: "999px",
            border: "none",
            background: "#a855f7",
            color: "#fff",
            fontWeight: "bold",
            cursor: "pointer",
            fontSize: "clamp(14px, 4vw, 16px)",
          }}
        >
          Novas 5 perguntas
        </button>
      </div>
    );
  }

  const q = state.questions[state.currentIndex];
  const correctIdx = q.correctIndex;

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          fontSize: "clamp(12px, 3.4vw, 14px)",
          color: "#94a3b8",
          marginBottom: "10px",
        }}
      >
        <span>
          Pergunta {state.currentIndex + 1} de {state.questions.length}
        </span>
        <span>Pontos: {state.score}</span>
      </div>

      <div
        style={{
          padding: "clamp(18px, 5vw, 24px)",
          borderRadius: "20px",
          background: "rgba(15, 23, 42, 0.95)",
          border: "1px solid #334155",
        }}
      >
        <h2
          style={{
            margin: "0 0 18px 0",
            fontSize: "clamp(18px, 5vw, 22px)",
            lineHeight: 1.3,
            color: "#f1f5f9",
          }}
        >
          {q.question}
        </h2>

        <div style={{ display: "grid", gap: "10px" }}>
          {q.options.map((opt, i) => {
            const isSelected = state.selectedIndex === i;
            const isCorrect = i === correctIdx;
            const showCorrect = state.revealed && isCorrect;
            const showWrong = state.revealed && isSelected && !isCorrect;

            let bg = "transparent";
            let border = "1px solid #334155";
            let color = "#e2e8f0";
            if (showCorrect) {
              bg = "rgba(34, 197, 94, 0.18)";
              border = "1px solid #22c55e";
              color = "#bbf7d0";
            } else if (showWrong) {
              bg = "rgba(239, 68, 68, 0.18)";
              border = "1px solid #ef4444";
              color = "#fecaca";
            } else if (isSelected) {
              bg = "rgba(168, 85, 247, 0.15)";
              border = "1px solid #a855f7";
              color = "#e9d5ff";
            }

            return (
              <button
                key={i}
                onClick={() => selectOption(i)}
                disabled={state.revealed}
                style={{
                  padding: "clamp(12px, 3.5vw, 14px) clamp(14px, 4vw, 18px)",
                  borderRadius: "12px",
                  border,
                  background: bg,
                  color,
                  fontSize: "clamp(14px, 3.9vw, 16px)",
                  textAlign: "left",
                  cursor: state.revealed ? "default" : "pointer",
                  fontFamily: "inherit",
                  lineHeight: 1.4,
                }}
              >
                <span
                  style={{
                    fontWeight: "bold",
                    marginRight: "8px",
                    color: "inherit",
                  }}
                >
                  {String.fromCharCode(65 + i)}.
                </span>
                {opt}
              </button>
            );
          })}
        </div>

        {state.revealed && (
          <div
            style={{
              marginTop: "16px",
              padding: "14px 16px",
              borderRadius: "12px",
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.25)",
            }}
          >
            <p
              style={{
                margin: 0,
                fontSize: "clamp(13px, 3.7vw, 15px)",
                color: "#cbd5e1",
                lineHeight: 1.6,
              }}
            >
              {q.explanation}
            </p>
          </div>
        )}

        <div
          style={{
            marginTop: "18px",
            display: "flex",
            justifyContent: "flex-end",
            gap: "10px",
          }}
        >
          {!state.revealed ? (
            <button
              onClick={reveal}
              disabled={state.selectedIndex === null}
              style={{
                padding: "12px 22px",
                borderRadius: "999px",
                border: "none",
                background:
                  state.selectedIndex === null ? "#475569" : "#a855f7",
                color: "#fff",
                fontWeight: "bold",
                cursor:
                  state.selectedIndex === null ? "not-allowed" : "pointer",
                fontSize: "clamp(14px, 4vw, 16px)",
              }}
            >
              Confirmar
            </button>
          ) : (
            <button
              onClick={nextQuestion}
              style={{
                padding: "12px 22px",
                borderRadius: "999px",
                border: "none",
                background: "#38bdf8",
                color: "#020617",
                fontWeight: "bold",
                cursor: "pointer",
                fontSize: "clamp(14px, 4vw, 16px)",
              }}
            >
              {state.currentIndex + 1 < state.questions.length
                ? "Próxima →"
                : "Ver resultado"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
