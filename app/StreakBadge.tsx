"use client";

import { useEffect, useState } from "react";

const STREAK_KEY = "daily-mind-expander-streak";

type StreakData = {
  current: number;
  longest: number;
  lastVisit: string;
};

function todayLisbon(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function yesterdayOf(dateStr: string): string {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d));
  date.setUTCDate(date.getUTCDate() - 1);
  return date.toISOString().slice(0, 10);
}

function loadStreak(): StreakData | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STREAK_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as StreakData;
    if (
      typeof parsed.current === "number" &&
      typeof parsed.longest === "number" &&
      typeof parsed.lastVisit === "string"
    ) {
      return parsed;
    }
  } catch {}
  return null;
}

function saveStreak(data: StreakData) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function updateStreakOnVisit(): StreakData {
  const today = todayLisbon();
  const stored = loadStreak();

  if (!stored) {
    const initial = { current: 1, longest: 1, lastVisit: today };
    saveStreak(initial);
    return initial;
  }

  if (stored.lastVisit === today) {
    return stored;
  }

  const yesterday = yesterdayOf(today);
  if (stored.lastVisit === yesterday) {
    const nextCount = stored.current + 1;
    const next = {
      current: nextCount,
      longest: Math.max(stored.longest, nextCount),
      lastVisit: today,
    };
    saveStreak(next);
    return next;
  }

  const reset = { current: 1, longest: stored.longest, lastVisit: today };
  saveStreak(reset);
  return reset;
}

function getMilestoneMessage(streak: number): string | null {
  switch (streak) {
    case 3:
      return "3 dias. Já é um padrão.";
    case 7:
      return "Uma semana! Os hábitos começam a colar.";
    case 14:
      return "Duas semanas. Já não é por acaso.";
    case 21:
      return "21 dias. Diz a lenda que é o tempo para um hábito.";
    case 30:
      return "Um mês inteiro. Outro patamar.";
    case 50:
      return "50 dias. Top 10% de quem começou.";
    case 100:
      return "100 dias. Disciplina rara.";
    case 200:
      return "200 dias. Isto já é parte de quem és.";
    case 365:
      return "UM ANO. Excelência total.";
    case 500:
      return "500 dias. Lenda.";
    case 1000:
      return "Mil dias. Inacreditável.";
    default:
      return null;
  }
}

export default function StreakBadge() {
  const [streak, setStreak] = useState<StreakData | null>(null);

  useEffect(() => {
    setStreak(updateStreakOnVisit());
  }, []);

  if (!streak) return null;

  const milestoneMsg = getMilestoneMessage(streak.current);
  const isMilestone = milestoneMsg !== null;
  const showRecord = streak.longest > streak.current;

  return (
    <div
      style={{
        marginTop: "20px",
        display: "flex",
        gap: "12px",
        flexWrap: "wrap",
      }}
    >
      <div
        style={{
          padding: "clamp(14px, 4vw, 18px) clamp(18px, 5vw, 24px)",
          borderRadius: "20px",
          background: isMilestone
            ? "linear-gradient(135deg, #f97316, #dc2626)"
            : "rgba(249, 115, 22, 0.13)",
          border: isMilestone
            ? "1px solid #fbbf24"
            : "1px solid rgba(249, 115, 22, 0.45)",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          flex: "1 1 auto",
          minWidth: 0,
          boxShadow: isMilestone
            ? "0 0 30px rgba(249, 115, 22, 0.35)"
            : "none",
        }}
      >
        <span style={{ fontSize: "clamp(26px, 7vw, 34px)", lineHeight: 1 }}>
          🔥
        </span>
        <div style={{ minWidth: 0 }}>
          <div
            style={{
              fontSize: "clamp(18px, 5vw, 24px)",
              fontWeight: "bold",
              color: isMilestone ? "#fff" : "#fde68a",
              lineHeight: 1.1,
            }}
          >
            {streak.current} {streak.current === 1 ? "dia" : "dias"} seguidos
          </div>
          {milestoneMsg ? (
            <div
              style={{
                fontSize: "clamp(11px, 3vw, 13px)",
                color: "#fff",
                marginTop: "4px",
                fontWeight: "bold",
              }}
            >
              {milestoneMsg}
            </div>
          ) : (
            <div
              style={{
                fontSize: "clamp(11px, 3vw, 13px)",
                color: "#fbbf24",
                marginTop: "4px",
                opacity: 0.8,
              }}
            >
              Volta amanhã para continuar a streak
            </div>
          )}
        </div>
      </div>

      {showRecord && (
        <div
          style={{
            padding: "clamp(14px, 4vw, 18px) clamp(18px, 5vw, 24px)",
            borderRadius: "20px",
            background: "rgba(56, 189, 248, 0.10)",
            border: "1px solid rgba(56, 189, 248, 0.35)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
            flex: "0 1 auto",
          }}
        >
          <span style={{ fontSize: "clamp(20px, 6vw, 26px)" }}>🏆</span>
          <div>
            <div
              style={{
                fontSize: "clamp(15px, 4vw, 18px)",
                fontWeight: "bold",
                color: "#7dd3fc",
                lineHeight: 1.1,
              }}
            >
              Recorde: {streak.longest} dias
            </div>
            <div
              style={{
                fontSize: "clamp(11px, 3vw, 13px)",
                color: "#94a3b8",
                marginTop: "4px",
              }}
            >
              A tua melhor sequência
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
