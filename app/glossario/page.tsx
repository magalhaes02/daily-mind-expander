import PageHeader from "../PageHeader";
import GlossarioClient from "./GlossarioClient";

export const metadata = {
  title: "Glossário · Daily Mind Expander",
};

export default function GlossarioPage() {
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
        <PageHeader
          title="Glossário"
          subtitle="Pergunta sobre qualquer coisa. A IA explica em profundidade — pessoa histórica, conceito, palavra, evento."
        />

        <GlossarioClient />
      </section>
    </main>
  );
}
