import { buildPoolBriefing } from "../../lib/briefing-pool";
import { generateBriefingWithGemini } from "../../lib/gemini";
import { parseTopicsParam } from "../../lib/topics";

export const dynamic = "force-dynamic";

function todayKeyLisbon(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export async function GET(request: Request) {
  const dateKey = todayKeyLisbon();
  const apiKey = process.env.GEMINI_API_KEY;
  const url = new URL(request.url);
  const preferredTopics = parseTopicsParam(url.searchParams.get("topics"));
  const fast = url.searchParams.get("fast") === "1";

  if (apiKey) {
    try {
      const briefing = await generateBriefingWithGemini(
        dateKey,
        apiKey,
        preferredTopics,
        fast
      );
      return Response.json(briefing);
    } catch (error) {
      const message = error instanceof Error ? error.message : "unknown";
      console.error("Gemini failed, falling back to pool:", message);
      const fallback = buildPoolBriefing(dateKey, preferredTopics);
      if (fast) fallback.items = fallback.items.slice(0, 5);
      return Response.json({ ...fallback, fallbackReason: message });
    }
  }

  const fallback = buildPoolBriefing(dateKey, preferredTopics);
  if (fast) fallback.items = fallback.items.slice(0, 5);
  return Response.json({
    ...fallback,
    fallbackReason: "GEMINI_API_KEY não configurada",
  });
}
