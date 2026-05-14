export const dynamic = "force-dynamic";
export const maxDuration = 20;

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `És um filósofo prático que cria perguntas profundas em português europeu.

Cada pergunta deve:
- Ser intelectualmente provocadora.
- Não ter resposta óbvia ou única.
- Tocar em temas universais (identidade, livre arbítrio, ética, tempo, conhecimento, sociedade, poder, sentido, morte, beleza, etc.).
- Convidar à introspecção genuína.

EVITA:
- Perguntas genéricas tipo "qual o sentido da vida?".
- Linguagem académica pesada.
- Perguntas com resposta moralmente óbvia.

FORMATO OBRIGATÓRIO (apenas JSON válido):
{
  "question": "A pergunta",
  "context": "1-2 frases curtas a enquadrar a pergunta (porque é interessante, o paradoxo subjacente, etc.)",
  "category": "uma palavra: identidade | tempo | ética | conhecimento | sociedade | sentido | livre-arbítrio | morte | poder | beleza"
}`;

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

export async function GET() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY não configurada." },
      { status: 503 }
    );
  }

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: "Dá-me 1 pergunta profunda para reflexão pessoal — algo que vou lembrar e continuar a pensar durante o dia.",
              },
            ],
          },
        ],
        generationConfig: {
          temperature: 1.1,
          responseMimeType: "application/json",
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      return Response.json(
        { error: `Gemini API ${response.status}: ${errorText.slice(0, 200)}` },
        { status: 502 }
      );
    }

    const data = (await response.json()) as GeminiResponse;
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      return Response.json({ error: "Resposta vazia" }, { status: 502 });
    }

    let cleaned = text.trim();
    if (cleaned.startsWith("```")) {
      cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
    }
    const firstBrace = cleaned.indexOf("{");
    const lastBrace = cleaned.lastIndexOf("}");
    if (firstBrace !== -1 && lastBrace !== -1) {
      cleaned = cleaned.slice(firstBrace, lastBrace + 1);
    }

    const parsed = JSON.parse(cleaned) as {
      question?: unknown;
      context?: unknown;
      category?: unknown;
    };
    return Response.json({
      question: String(parsed.question ?? ""),
      context: String(parsed.context ?? ""),
      category: String(parsed.category ?? ""),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return Response.json({ error: message }, { status: 500 });
  }
}
