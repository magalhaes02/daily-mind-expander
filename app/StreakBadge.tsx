"use client";

import { useEffect, useState } from "react";

const STREAK_KEY = "daily-mind-expander-streak";
const FREEZES_PER_MONTH = 2;

type StreakData = {
  current: number;
  longest: number;
  lastVisit: string;
  freezesUsed: string[];
  freezesMonth: string;
};

function todayLisbon(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function monthOf(dateStr: string): string {
  return dateStr.slice(0, 7);
}

function daysBetween(fromStr: string, toStr: string): number {
  const [y1, m1, d1] = fromStr.split("-").map(Number);
  const [y2, m2, d2] = toStr.split("-").map(Number);
  const from = Date.UTC(y1, m1 - 1, d1);
  const to = Date.UTC(y2, m2 - 1, d2);
  return Math.round((to - from) / (1000 * 60 * 60 * 24));
}

function loadStreak(): StreakData | null {
  if (typeof localStorage === "undefined") return null;
  const raw = localStorage.getItem(STREAK_KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as Partial<StreakData>;
    if (
      typeof parsed.current === "number" &&
      typeof parsed.longest === "number" &&
      typeof parsed.lastVisit === "string"
    ) {
      return {
        current: parsed.current,
        longest: parsed.longest,
        lastVisit: parsed.lastVisit,
        freezesUsed: Array.isArray(parsed.freezesUsed) ? parsed.freezesUsed : [],
        freezesMonth: parsed.freezesMonth ?? monthOf(parsed.lastVisit),
      };
    }
  } catch {}
  return null;
}

function saveStreak(data: StreakData) {
  localStorage.setItem(STREAK_KEY, JSON.stringify(data));
}

function freezesAvailable(data: StreakData, today: string): number {
  const thisMonth = monthOf(today);
  if (data.freezesMonth !== thisMonth) {
    return FREEZES_PER_MONTH;
  }
  return Math.max(0, FREEZES_PER_MONTH - data.freezesUsed.length);
}

function rolloverFreezesIfNewMonth(data: StreakData, today: string): StreakData {
  const thisMonth = monthOf(today);
  if (data.freezesMonth !== thisMonth) {
    return { ...data, freezesUsed: [], freezesMonth: thisMonth };
  }
  return data;
}

function updateStreakOnVisit(): {
  data: StreakData;
  usedFreezesNow: number;
  brokenAt: number;
} {
  const today = todayLisbon();
  const stored = loadStreak();

  if (!stored) {
    const initial: StreakData = {
      current: 1,
      longest: 1,
      lastVisit: today,
      freezesUsed: [],
      freezesMonth: monthOf(today),
    };
    saveStreak(initial);
    return { data: initial, usedFreezesNow: 0, brokenAt: 0 };
  }

  const rolled = rolloverFreezesIfNewMonth(stored, today);

  if (rolled.lastVisit === today) {
    if (rolled !== stored) saveStreak(rolled);
    return { data: rolled, usedFreezesNow: 0, brokenAt: 0 };
  }

  const gap = daysBetween(rolled.lastVisit, today);

  if (gap === 1) {
    const nextCount = rolled.current + 1;
    const next: StreakData = {
      ...rolled,
      current: nextCount,
      longest: Math.max(rolled.longest, nextCount),
      lastVisit: today,
    };
    saveStreak(next);
    return { data: next, usedFreezesNow: 0, brokenAt: 0 };
  }

  // gap >= 2 → tenta consumir freezes
  const missedDays = gap - 1;
  const available = freezesAvailable(rolled, today);

  if (missedDays <= available) {
    // Salva o streak gastando freezes
    const newFreezesUsed = [...rolled.freezesUsed];
    for (let i = 0; i < missedDays; i++) {
      newFreezesUsed.push(today);
    }
    const nextCount = rolled.current + 1;
    const next: StreakData = {
      ...rolled,
      current: nextCount,
      longest: Math.max(rolled.longest, nextCount),
      lastVisit: today,
      freezesUsed: newFreezesUsed,
    };
    saveStreak(next);
    return { data: next, usedFreezesNow: missedDays, brokenAt: 0 };
  }

  // Não chegam freezes → streak quebra
  const previousStreak = rolled.current;
  const reset: StreakData = {
    current: 1,
    longest: rolled.longest,
    lastVisit: today,
    freezesUsed: rolled.freezesUsed,
    freezesMonth: rolled.freezesMonth,
  };
  saveStreak(reset);
  return { data: reset, usedFreezesNow: 0, brokenAt: previousStreak };
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

type StreakBadgeProps = {
  compact?: boolean;
};

export default function StreakBadge({ compact = false }: StreakBadgeProps) {
  const [state, setState] = useState<{
    data: StreakData;
    usedFreezesNow: number;
    brokenAt: number;
  } | null>(null);

  useEffect(() => {
    setState(updateStreakOnVisit());
  }, []);

  if (!state) return null;

  const { data, usedFreezesNow, brokenAt } = state;
  const milestoneMsg = getMilestoneMessage(data.current);
  const isMilestone = milestoneMsg !== null;
  const today = todayLisbon();
  const freezes = freezesAvailable(data, today);

  if (compact) {
    return (
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: "8px",
          padding: "8px 14px",
          borderRadius: "999px",
          background: "rgba(249, 115, 22, 0.15)",
          border: "1px solid rgba(249, 115, 22, 0.4)",
        }}
      >
        <span style={{ fontSize: "18px", lineHeight: 1 }}>🔥</span>
        <span
          style={{
            fontWeight: "bold",
            color: "#fde68a",
            fontSize: "clamp(13px, 3.6vw, 15px)",
          }}
        >
          {data.current}
        </span>
        {freezes > 0 && (
          <>
            <span style={{ color: "#475569", fontSize: "12px" }}>·</span>
            <span style={{ fontSize: "14px" }}>❄️</span>
            <span
              style={{
                color: "#bae6fd",
                fontWeight: "bold",
                fontSize: "clamp(12px, 3.4vw, 14px)",
              }}
            >
              {freezes}
            </span>
          </>
        )}
      </div>
    );
  }

  return (
    <div
      style={{
        marginTop: "16px",
        display: "flex",
        gap: "10px",
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
          boxShadow: isMilestone ? "0 0 30px rgba(249, 115, 22, 0.35)" : "none",
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
            {data.current} {data.current === 1 ? "dia" : "dias"} seguidos
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
          ) : usedFreezesNow > 0 ? (
            <div
              style={{
                fontSize: "clamp(11px, 3vw, 13px)",
                color: "#bae6fd",
                marginTop: "4px",
              }}
            >
              ❄️ Streak salva com {usedFreezesNow}{" "}
              {usedFreezesNow === 1 ? "freeze" : "freezes"}
            </div>
          ) : brokenAt > 0 ? (
            <div
              style={{
                fontSize: "clamp(11px, 3vw, 13px)",
                color: "#fca5a5",
                marginTop: "4px",
              }}
            >
              Quebraste streak de {brokenAt} dias — recomeça aqui
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

      <div
        style={{
          padding: "clamp(14px, 4vw, 18px) clamp(16px, 4.5vw, 22px)",
          borderRadius: "20px",
          background: "rgba(56, 189, 248, 0.10)",
          border: "1px solid rgba(56, 189, 248, 0.35)",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
        title="Cada mês recebes 2 freezes. Se faltares um dia, um freeze protege a streak."
      >
        <span style={{ fontSize: "clamp(20px, 6vw, 26px)" }}>❄️</span>
        <div>
          <div
            style={{
              fontSize: "clamp(15px, 4vw, 18px)",
              fontWeight: "bold",
              color: "#7dd3fc",
              lineHeight: 1.1,
            }}
          >
            {freezes} {freezes === 1 ? "freeze" : "freezes"}
          </div>
          <div
            style={{
              fontSize: "clamp(11px, 3vw, 13px)",
              color: "#94a3b8",
              marginTop: "4px",
            }}
          >
            Protege se faltares um dia
          </div>
        </div>
      </div>

      {data.longest > data.current && (
        <div
          style={{
            padding: "clamp(14px, 4vw, 18px) clamp(16px, 4.5vw, 22px)",
            borderRadius: "20px",
            background: "rgba(168, 162, 158, 0.10)",
            border: "1px solid rgba(168, 162, 158, 0.35)",
            display: "flex",
            alignItems: "center",
            gap: "10px",
          }}
        >
          <span style={{ fontSize: "clamp(20px, 6vw, 26px)" }}>🏆</span>
          <div>
            <div
              style={{
                fontSize: "clamp(15px, 4vw, 18px)",
                fontWeight: "bold",
                color: "#e7e5e4",
                lineHeight: 1.1,
              }}
            >
              Recorde: {data.longest}
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
