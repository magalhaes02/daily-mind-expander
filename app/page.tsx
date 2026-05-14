import NotificationButton from "./NotificationButton";
import DailyBriefing from "./DailyBriefing";
import TopicSelector from "./TopicSelector";
import StreakBadge from "./StreakBadge";

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
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            padding: "6px 12px",
            borderRadius: "999px",
            background: "rgba(56, 189, 248, 0.15)",
            color: "#7dd3fc",
            fontWeight: "bold",
            marginBottom: "16px",
            fontSize: "clamp(12px, 3.2vw, 14px)",
          }}
        >
          Briefing diário às 9h
        </div>

        <h1
          style={{
            fontSize: "clamp(30px, 9vw, 52px)",
            lineHeight: 1.05,
            margin: "0 0 16px 0",
          }}
        >
          Daily Mind Expander
        </h1>

        <p
          style={{
            fontSize: "clamp(15px, 4vw, 20px)",
            color: "#cbd5e1",
            lineHeight: 1.65,
            maxWidth: "850px",
          }}
        >
          Todos os dias, esta app gera um briefing extremamente variado,
          atualizado e interessante para expandir o teu conhecimento geral,
          pensamento crítico, cultura, capacidade de conversa e compreensão do
          mundo.
        </p>

        <StreakBadge />

        <NotificationButton />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(min(260px, 100%), 1fr))",
            gap: "14px",
            marginTop: "28px",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "clamp(18px, 5vw, 28px)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "clamp(18px, 5vw, 22px)" }}>
              Objetivo
            </h2>
            <p
              style={{
                color: "#cbd5e1",
                lineHeight: 1.65,
                fontSize: "clamp(14px, 3.8vw, 16px)",
                margin: 0,
              }}
            >
              Expandir brutalmente o conhecimento geral com temas leves,
              profundos, úteis, estranhos, atuais e intemporais.
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "clamp(18px, 5vw, 28px)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "clamp(18px, 5vw, 22px)" }}>
              Formato
            </h2>
            <p
              style={{
                color: "#cbd5e1",
                lineHeight: 1.65,
                fontSize: "clamp(14px, 3.8vw, 16px)",
                margin: 0,
              }}
            >
              Entre 10 e 20 tópicos curtos, diretos e fascinantes. Cada um pode
              ser expandido para leitura mais profunda.
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid #334155",
              borderRadius: "20px",
              padding: "clamp(18px, 5vw, 28px)",
            }}
          >
            <h2 style={{ marginTop: 0, fontSize: "clamp(18px, 5vw, 22px)" }}>
              Inclui sempre
            </h2>
            <p
              style={{
                color: "#cbd5e1",
                lineHeight: 1.65,
                fontSize: "clamp(14px, 3.8vw, 16px)",
                margin: 0,
              }}
            >
              Uma pergunta de reflexão (com exemplo de resposta sob pedido) e
              uma recomendação concreta para explorar.
            </p>
          </div>
        </div>

        <TopicSelector />

        <DailyBriefing />
      </section>
    </main>
  );
}
