import type { Briefing, BriefingItem } from "./briefing-pool";

const GEMINI_MODEL = "gemini-2.5-flash";
const GEMINI_ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`;

const SYSTEM_PROMPT = `És um curador intelectual que prepara um briefing diário em português europeu para um leitor curioso e exigente.

OBJETIVO: expandir brutalmente o conhecimento geral, pensamento crítico, cultura, capacidade de conversa e compreensão do mundo do leitor.

TEMAS POSSÍVEIS (mistura sempre temas leves, profundos e inesperados — não te limites a esta lista):
notícias mundiais, economia, investimentos, finanças pessoais, negócios, empreendedorismo, psicologia, comportamento humano, manipulação, negociação, comunicação, liderança, história, filosofia, política, geopolítica, sociologia, ciência, física, química, biologia, espaço, inteligência artificial, tecnologia, cibersegurança, carros, motas, aviação, barcos, arquitetura, design, engenharia, medicina, nutrição, fitness, longevidade, sobrevivência, produtividade, hábitos, curiosidades, crimes famosos, teorias científicas, invenções, como objetos/sistemas funcionam, luxo, marcas, marketing, vendas, linguagem corporal, estatística, matemática aplicada, animais, oceanos, países, culturas, religião, arte, música, cinema, poesia, frases filosóficas, frases históricas, leis estranhas, paradoxos, mistérios do mundo, descobertas recentes, tendências futuras, ideias bizarras mas reais, factos pouco conhecidos, skills para a vida, conceitos que pessoas cultas conhecem.

INCLUI OCASIONALMENTE (não em todos os dias):
- rankings, comparações, factos chocantes, "sabias que?", mini debates, previsões de futuro, dilemas morais, conceitos de filmes/séries/livros, experiências psicológicas famosas, curiosidades científicas absurdas mas reais, truques mentais, erros cognitivos, rabbit holes da internet, poemas curtos, citações fortes, analogias inteligentes, perguntas que façam pensar.

FORMATO OBRIGATÓRIO (responde APENAS com JSON válido, sem markdown, sem \`\`\`):
{
  "items": [
    {
      "category": "string curta — o tema",
      "title": "título fascinante, máx 80 chars",
      "text": "explicação clara e envolvente em 2-3 frases, simples mas inteligente",
      "relevance": "1 frase CURTA e direta — máximo 15 palavras — porque importa"
    }
  ],
  "reflection": "1 pergunta para reflexão pessoal",
  "recommendation": "1 recomendação concreta (livro, filme, documentário, canal, artigo ou conceito) com markdown bold no nome",
  "quote": {
    "text": "1 citação inspiradora poderosa, ligada a algum dos tópicos",
    "author": "Autor da citação"
  }
}

REGRAS:
- Entre 12 e 16 tópicos.
- Cada tópico curto, direto, fascinante.
- "relevance" é OBRIGATORIAMENTE 1 frase curta, máximo 15 palavras. Como um lema. Direta ao osso.
- Mistura temas — nunca dois tópicos do mesmo tema seguidos, e variedade real (leve, profundo, inesperado).
- Linguagem envolvente, fácil de ler, em português de Portugal.
- Inclui pelo menos 1 tópico de cada bloco amplo: ciência/tecnologia, comportamento humano/psicologia, dinheiro/poder/mundo, cultura/arte/curiosidades.
- Inclui pelo menos 1 facto chocante, "sabias que?" ou curiosidade absurda mas real.
- Não repetir conceitos óbvios todos os dias.
- A reflection deve ser provocadora, não genérica.
- A recommendation deve ser concreta e específica.
- A quote deve ser real (atribuída a pessoa real ou anónima como "Provérbio"), poderosa, e ligada a algum dos tópicos.`;

type GeminiResponse = {
  candidates?: {
    content?: { parts?: { text?: string }[] };
  }[];
};

function parseBriefingJSON(text: string): {
  items: BriefingItem[];
  reflection: string;
  recommendation: string;
  quote?: { text: string; author: string };
} {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```(json)?/i, "").replace(/```$/, "").trim();
  }
  const firstBrace = cleaned.indexOf("{");
  const lastBrace = cleaned.lastIndexOf("}");
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.slice(firstBrace, lastBrace + 1);
  }

  const parsed = JSON.parse(cleaned);

  if (!parsed.items || !Array.isArray(parsed.items)) {
    throw new Error("Resposta da Gemini não contém items[]");
  }

  let quote: { text: string; author: string } | undefined;
  if (parsed.quote && typeof parsed.quote === "object") {
    const qText = String(parsed.quote.text ?? "").trim();
    const qAuthor = String(parsed.quote.author ?? "").trim();
    if (qText) {
      quote = { text: qText, author: qAuthor || "Anónimo" };
    }
  }

  return {
    items: parsed.items.map((item: BriefingItem) => ({
      category: String(item.category ?? ""),
      title: String(item.title ?? ""),
      text: String(item.text ?? ""),
      relevance: String(item.relevance ?? ""),
    })),
    reflection: String(parsed.reflection ?? ""),
    recommendation: String(parsed.recommendation ?? ""),
    quote,
  };
}

export async function generateBriefingWithGemini(
  dateKey: string,
  apiKey: string,
  preferredTopics: string[] = [],
  fast = false
): Promise<Briefing> {
  const lisbonDate = new Date().toLocaleDateString("pt-PT", {
    timeZone: "Europe/Lisbon",
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const preferredBlock =
    preferredTopics.length > 0
      ? `\n\nPREFERÊNCIAS DO LEITOR: dá maior peso a estes temas, mas mantém alguma variedade fora deles (10-20%) para abrir horizontes:\n- ${preferredTopics.join(
          "\n- "
        )}`
      : "";

  const fastBlock = fast
    ? `\n\nMODO RÁPIDO: gera APENAS 5 tópicos (em vez de 12-16). Escolhe os mais impactantes e variados. Textos um pouco mais curtos.`
    : "";

  const userPrompt = `Gera o briefing intelectual para hoje (${lisbonDate}, chave: ${dateKey}).

Mistura temas atuais com conhecimento intemporal. Surpreende. Foge do óbvio. Não repetas o estilo dos exemplos típicos — escolhe ângulos inesperados sobre cada tema.${preferredBlock}${fastBlock}`;

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
    const errorText = await response.text();
    throw new Error(`Gemini API ${response.status}: ${errorText}`);
  }

  const data = (await response.json()) as GeminiResponse;
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
  if (!text) {
    throw new Error("Resposta da Gemini vazia");
  }

  const parsed = parseBriefingJSON(text);

  return {
    generatedAt: new Date().toISOString(),
    dateKey,
    source: "ai",
    items: parsed.items,
    reflection: parsed.reflection,
    recommendation: parsed.recommendation,
    quote: parsed.quote,
  };
}
