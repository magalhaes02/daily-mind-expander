import PageHeader from "../PageHeader";
import PensarClient from "./PensarClient";

export const metadata = {
  title: "Vamos pensar · Daily Mind Expander",
};

export default function PensarPage() {
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
          title="Vamos pensar"
          subtitle="Uma pergunta profunda do dia para te fazer parar. Não há resposta certa — só pensar com honestidade."
        />

        <PensarClient />
      </section>
    </main>
  );
}
