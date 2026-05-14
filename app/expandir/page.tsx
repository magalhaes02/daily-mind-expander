import PageHeader from "../PageHeader";
import TopicSelector from "../TopicSelector";
import DailyBriefing from "../DailyBriefing";

export const metadata = {
  title: "Expandir conhecimento · Daily Mind Expander",
};

export default function ExpandirPage() {
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
      <section style={{ maxWidth: "900px", margin: "0 auto" }}>
        <PageHeader
          title="Expandir conhecimento"
          subtitle="Os tópicos do dia, variados — ciência, história, cultura, comportamento, mais. Toca em cada um para ouvir, favoritar ou ler mais."
        />

        <TopicSelector />

        <DailyBriefing />
      </section>
    </main>
  );
}
