export const dynamic = "force-dynamic";
export const maxDuration = 60;

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_STREAM_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:streamGenerateContent`;

type GlossaryBody = {
  query: string;
};

function buildPrompt(query: string): string {
  return `És um curador intelectual que responde a curiosidades em português europeu.

Pergunta do leitor: "${query}"

Escreve uma explicação clara, completa e fascinante em 4 a 7 parágrafos curtos.

Estrutura recomendada:
1. Definição direta (1 parágrafo).
2. Origem ou contexto histórico (se aplicável).
3. Como funciona / aspetos centrais (com dados concretos, números, exemplos).
4. Curiosidades pouco conhecidas ou aplicações inesperadas.
5. Ligações a outras áreas (psicologia, economia, ciência, arte, etc.).
6. Por que importa (1 frase forte a fechar).

REGRAS:
- NÃO uses títulos, bullet points, nem markdown.
- Parágrafos fluidos e curtos.
- Linguagem envolvente, evita jargão sem o explicar.
- Se a pergunta for vaga, aborda a interpretação mais interessante.
- Se for uma pergunta sobre uma pessoa, fala da vida + contributo + curiosidade.
- Se for uma palavra técnica, define + explica + dá exemplo.
- Se for um conceito histórico, contexto + relevância + legado.`;
}

export async function POST(request: Request) {
  let body: GlossaryBody;
  try {
    body = (await request.json()) as GlossaryBody;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  const query = (body?.query ?? "").trim();
  if (!query) {
    return Response.json({ error: "Falta query" }, { status: 400 });
  }
  if (query.length > 300) {
    return Response.json({ error: "Query demasiado longa" }, { status: 400 });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return Response.json(
      { error: "GEMINI_API_KEY não configurada." },
      { status: 503 }
    );
  }

  const prompt = buildPrompt(query);

  const geminiRes = await fetch(
    `${GEMINI_STREAM_ENDPOINT}?alt=sse&key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.85 },
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
              if (text) controller.enqueue(encoder.encode(text));
            } catch {
              // skip malformed
            }
          }
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : "stream error";
        controller.enqueue(encoder.encode(`\n\n[erro: ${msg}]`));
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
