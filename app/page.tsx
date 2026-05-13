import NotificationButton from "./NotificationButton";
import DailyBriefing from "./DailyBriefing";
import TopicSelector from "./TopicSelector";

export default function Home() {
  return (
    <main
      style={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at top left, #1e293b, #020617 45%, #000000)",
        color: "white",
        fontFamily: "Arial, sans-serif",
        padding: "40px",
      }}
    >
      <section style={{ maxWidth: "1100px", margin: "0 auto" }}>
        <div
          style={{
            display: "inline-block",
            padding: "8px 14px",
            borderRadius: "999px",
            background: "rgba(56, 189, 248, 0.15)",
            color: "#7dd3fc",
            fontWeight: "bold",
            marginBottom: "20px",
          }}
        >
          Briefing diário às 9h
        </div>

        <h1 style={{ fontSize: "52px", lineHeight: 1.05, margin: "0 0 20px 0" }}>
          Daily Mind Expander
        </h1>

        <p
          style={{
            fontSize: "20px",
            color: "#cbd5e1",
            lineHeight: 1.7,
            maxWidth: "850px",
          }}
        >
          Todos os dias, esta app gera um briefing extremamente variado,
          atualizado e interessante para expandir o teu conhecimento geral,
          pensamento crítico, cultura, capacidade de conversa e compreensão do
          mundo.
        </p>

        <NotificationButton />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "20px",
            marginTop: "36px",
          }}
        >
          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid #334155",
              borderRadius: "24px",
              padding: "28px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Objetivo</h2>
            <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
              Expandir brutalmente o conhecimento geral com temas leves,
              profundos, úteis, estranhos, atuais e intemporais.
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid #334155",
              borderRadius: "24px",
              padding: "28px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Formato</h2>
            <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
              Entre 10 e 20 tópicos curtos, diretos e fascinantes. Cada um pode
              ser expandido para leitura mais profunda.
            </p>
          </div>

          <div
            style={{
              background: "rgba(15, 23, 42, 0.9)",
              border: "1px solid #334155",
              borderRadius: "24px",
              padding: "28px",
            }}
          >
            <h2 style={{ marginTop: 0 }}>Inclui sempre</h2>
            <p style={{ color: "#cbd5e1", lineHeight: 1.7 }}>
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
