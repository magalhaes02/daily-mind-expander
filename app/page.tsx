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
        fontFamily: "Arial, sans-serif",
        padding: "clamp(16px, 4vw, 40px)",
      }}
    >
      <section style={{ maxWidth: "900px", margin: "0 auto" }}>
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            gap: "16px",
            flexWrap: "wrap",
          }}
        >
          <div style={{ flex: "1 1 auto", minWidth: 0 }}>
            <div
              style={{
                display: "inline-block",
                padding: "5px 12px",
                borderRadius: "999px",
                background: "rgba(56, 189, 248, 0.15)",
                color: "#7dd3fc",
                fontWeight: "bold",
                fontSize: "clamp(11px, 3vw, 13px)",
                marginBottom: "10px",
              }}
            >
              Briefing diário às 9h
            </div>
            <h1
              style={{
                fontSize: "clamp(28px, 8vw, 48px)",
                lineHeight: 1.05,
                margin: 0,
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
            marginTop: "24px",
            display: "grid",
            gap: "14px",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
          }}
        >
          <HomeTile
            href="/expandir"
            emoji="📚"
            title="Expandir conhecimento"
            subtitle="Tópicos do dia em variedade — ciência, história, cultura, comportamento humano e mais."
            accent="#38bdf8"
          />
          <HomeTile
            href="/quizz"
            emoji="🧠"
            title="Quizz"
            subtitle="5 perguntas de escolha múltipla para testar o que sabes."
            accent="#a855f7"
          />
          <HomeTile
            href="/pensar"
            emoji="💭"
            title="Vamos pensar"
            subtitle="Uma pergunta profunda do dia para te fazer parar e pensar."
            accent="#facc15"
          />
          <HomeTile
            href="/glossario"
            emoji="🔍"
            title="Glossário"
            subtitle="Pergunta sobre qualquer coisa. A IA explica em profundidade."
            accent="#22d3ee"
          />
        </div>

        <footer
          style={{
            marginTop: "40px",
            textAlign: "center",
            color: "#475569",
            fontSize: "clamp(11px, 3vw, 13px)",
          }}
        >
          Construído com curiosidade · grátis · open source
        </footer>
      </section>
    </main>
  );
}
