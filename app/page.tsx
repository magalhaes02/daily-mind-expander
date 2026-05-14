import NotificationButton from "./NotificationButton";
import StreakBadge from "./StreakBadge";
import DailyQuote from "./DailyQuote";
import HomeTile from "./HomeTile";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #1e293b, #020617 45%, #000000)",
        color: "white",
        padding: "clamp(16px, 4vw, 40px)",
        paddingBottom: "calc(env(safe-area-inset-bottom) + 96px)",
      }}
    >
      <section style={{ maxWidth: "720px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            flexWrap: "wrap",
            marginBottom: "8px",
          }}
        >
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <div
              style={{
                display: "inline-block",
                padding: "5px 12px",
                borderRadius: "999px",
                background:
                  "linear-gradient(90deg, rgba(56, 189, 248, 0.18), rgba(168, 85, 247, 0.18))",
                color: "#7dd3fc",
                fontWeight: 800,
                fontSize: "clamp(10px, 2.8vw, 12px)",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                marginBottom: "12px",
                border: "1px solid rgba(56, 189, 248, 0.3)",
              }}
            >
              Briefing diário às 9h
            </div>
            <h1
              style={{
                fontSize: "clamp(30px, 9vw, 48px)",
                lineHeight: 1.0,
                margin: 0,
                fontWeight: 900,
                background:
                  "linear-gradient(135deg, #f8fafc 0%, #38bdf8 70%, #a855f7 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              Daily Mind Expander
            </h1>
          </div>
          <div style={{ flex: "0 0 auto" }}>
            <StreakBadge compact />
          </div>
        </header>

        <DailyQuote />

        <NotificationButton />

        <div
          style={{
            marginTop: "28px",
            display: "grid",
            gap: "16px",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(280px, 100%), 1fr))",
          }}
        >
          <HomeTile
            href="/expandir"
            emoji="📚"
            title="Expandir conhecimento"
            subtitle="Tópicos do dia em variedade — ciência, história, cultura e mais."
            accent="#38bdf8"
            badge="Hoje"
          />
          <HomeTile
            href="/quizz"
            emoji="🧠"
            title="Quizz"
            subtitle="5 perguntas para testar o que sabes."
            accent="#c084fc"
          />
          <HomeTile
            href="/pensar"
            emoji="💭"
            title="Vamos pensar"
            subtitle="Uma pergunta profunda para parar e pensar."
            accent="#fbbf24"
          />
          <HomeTile
            href="/glossario"
            emoji="🔍"
            title="Glossário"
            subtitle="Pergunta sobre qualquer coisa. A IA explica."
            accent="#5eead4"
          />
        </div>

        <footer
          style={{
            marginTop: "40px",
            textAlign: "center",
            color: "#475569",
            fontSize: "clamp(11px, 3vw, 13px)",
            fontWeight: 700,
          }}
        >
          Curiosidade · grátis · open source
        </footer>
      </section>
    </main>
  );
}
