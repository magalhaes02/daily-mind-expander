import { parseTopicsParam } from "../../lib/topics";

export const dynamic = "force-dynamic";
export const maxDuration = 30;

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `És um criador de perguntas de quizz cultas e desafiantes em português europeu.

OBJETIVO: testar e expandir conhecimento geral do leitor. As perguntas devem ser intelectualmente estimulantes — nem demasiado fáceis nem obscuras de mais.

TEMAS POSSÍVEIS: ciência, história, filosofia, geopolítica, psicologia, economia, tecnologia, arte, literatura, cinema, espaço, biologia, paradoxos, curiosidades, factos pouco conhecidos, frases históricas, comportamento humano.

FORMATO OBRIGATÓRIO (responde APENAS com JSON válido, sem markdown):
{
  "questions": [
    {
      "question": "Pergunta clara e direta",
      "options": ["opção A", "opção B", "opção C", "opção D"],
      "correctIndex": 0,
      "explanation": "1-2 frases a explicar a resposta correta e algo interessante sobre o tema"
    }
  ]
}

REGRAS:
- Gera exatamente 5 perguntas.
- Cada pergunta tem exatamente 4 opções.
- correctIndex é o índice (0-3) da opção correta.
- Mistura temas — não 5 do mesmo.
- Nível médio-alto: não trivial mas justo.
- A explanation deve adicionar valor (não só "a resposta é X").
- Em português de Portugal.
- Não uses cabeçalhos nem markdown.`;

type GeminiResponse = {
  candidates?: { content?: { parts?: { text?: string }[] } }[];
};

export async function GET(request: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY não configurada." },
      { status: 503 }
    );
  }

  const url = new URL(request.url);
  const preferredTopics = parseTopicsParam(url.searchParams.get("topics"));
  const preferredBlock =
    preferredTopics.length > 0
      ? `\n\nDá maior peso a estes temas: ${preferredTopics.join(", ")}`
      : "";

  const userPrompt = `Gera 5 perguntas de escolha múltipla variadas para hoje.${preferredBlock}

Surpreende com escolhas inesperadas. Foge do óbvio.`;

  try {
    const response = await fetch(`${GEMINI_ENDPOINT}?key=${apiKey}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
        contents: [{ role: "user", parts: [{ text: userPrompt }] }],
        generationConfig: {
          temperature: 1.0,
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
      return Response.json(
        { error: "Resposta vazia da Gemini" },
        { status: 502 }
      );
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

    type ParsedQuestion = {
      question?: unknown;
      options?: unknown;
      correctIndex?: unknown;
      explanation?: unknown;
    };
    const parsed = JSON.parse(cleaned) as { questions?: ParsedQuestion[] };
    if (!parsed.questions || !Array.isArray(parsed.questions)) {
      return Response.json(
        { error: "Formato inválido — falta questions[]" },
        { status: 502 }
      );
    }

    const questions = parsed.questions
      .filter((q) => Array.isArray(q.options) && q.options.length >= 2)
      .map((q) => {
        const options = (q.options as unknown[]).map((o) => String(o));
        const correctIndex =
          typeof q.correctIndex === "number" &&
          q.correctIndex >= 0 &&
          q.correctIndex < options.length
            ? q.correctIndex
            : 0;
        return {
          question: String(q.question ?? ""),
          options,
          correctIndex,
          explanation: String(q.explanation ?? ""),
        };
      });

    return Response.json({ questions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return Response.json({ error: message }, { status: 500 });
  }
}
