export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_STREAM_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent`;

type ExpandTopicBody = {
  type: "topic";
  topic: { category: string; title: string; text: string; relevance?: string };
};

type ExpandReflectionBody = {
  type: "reflection";
  question: string;
};

type ExpandBody = ExpandTopicBody | ExpandReflectionBody;

function buildTopicPrompt(t: ExpandTopicBody["topic"]): string {
  return `És um curador intelectual a expandir um tópico do briefing diário para um leitor curioso e exigente.

Tópico:
- Categoria: ${t.category}
- Título: ${t.title}
- Resumo: ${t.text}
${t.relevance ? `- Porque importa: ${t.relevance}` : ""}

Escreve uma exploração mais profunda em português europeu, com 3 a 5 parágrafos curtos. Inclui:
1. Contexto histórico ou origem (se aplicável).
2. Dados concretos, números, exemplos reais.
3. Pelo menos uma curiosidade pouco conhecida ligada ao tema.
4. Ligações inesperadas a outras áreas (psicologia, economia, ciência, etc.).
5. Uma frase final provocadora ou que abra para mais pensamento.

NÃO uses títulos. NÃO uses bullet points. Apenas parágrafos fluidos. Linguagem envolvente, clara, evita jargão.`;
}

function buildReflectionPrompt(question: string): string {
  return `Pergunta de reflexão pessoal: "${question}"

Dá um exemplo de resposta possível em português europeu, escrito na primeira pessoa, em 2 a 3 parágrafos curtos. NÃO é uma resposta definitiva — é um ponto de partida que mostra um *modo* de pensar sobre a pergunta, com nuance e honestidade. Deve ajudar o leitor a destrancar o seu próprio pensamento, não a copiar.

Inclui pelo menos uma referência concreta (um exemplo, um conceito, um pequeno facto, uma analogia). Termina com uma sub-pergunta que aprofunde a reflexão.

NÃO uses títulos nem bullet points.`;
}

export async function POST(request: Request) {
  let body: ExpandBody;
  try {
    body = (await request.json()) as ExpandBody;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY não configurada — esta funcionalidade requer IA." },
      { status: 503 }
    );
  }

  let prompt: string;
  if (body.type === "topic" && body.topic) {
    prompt = buildTopicPrompt(body.topic);
  } else if (body.type === "reflection" && body.question) {
    prompt = buildReflectionPrompt(body.question);
  } else {
    return Response.json(
      { error: "Body inválido — type deve ser 'topic' ou 'reflection'" },
      { status: 400 }
    );
  }

  const geminiRes = await fetch(
    `${GEMINI_STREAM_ENDPOINT}?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.9 },
      }),
    }
  );

  if (!geminiRes.ok || !geminiRes.body) {
    const errorText = await geminiRes.text().catch(() => "");
    return Response.json(
      { error: `Gemini API ${geminiRes.status}: ${errorText.slice(0, 200)}` },
      { status: 502 }
    );
  }

  const upstream = geminiRes.body;
  const encoder = new TextEncoder();

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      const reader = upstream.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      try {
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });

          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const rawLine of lines) {
            const line = rawLine.trim();
            if (!line.startsWith("data:")) continue;
            const payload = line.slice(5).trim();
            if (!payload || payload === "[DONE]") continue;

            try {
              const parsed = JSON.parse(payload) as {
                candidates?: {
                  content?: { parts?: { text?: string }[] };
                }[];
              };
              const text =
                parsed.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
              if (text) {
                controller.enqueue(encoder.encode(text));
              }
            } catch {
              // ignore malformed SSE chunk
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "stream error";
        controller.enqueue(encoder.encode(`\n\n[erro de stream: ${msg}]`));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
      "X-Accel-Buffering": "no",
    },
  });
}
