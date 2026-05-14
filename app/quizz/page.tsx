import PageHeader from "../PageHeader";
import QuizClient from "./QuizClient";

export const metadata = {
  title: "Quizz · Daily Mind Expander",
};

export default function QuizzPage() {
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
          title="Quizz"
          subtitle="5 perguntas de escolha múltipla. Aprende-se mais a responder do que a ler."
        />

        <QuizClient />
      </section>
    </main>
  );
}
