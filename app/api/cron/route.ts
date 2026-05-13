import { buildPoolBriefing } from "../../lib/briefing-pool";
import { generateBriefingWithGemini } from "../../lib/gemini";
import { sendBriefingPush } from "../../lib/push";
import { parseTopicsParam } from "../../lib/topics";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

function todayKeyLisbon(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Europe/Lisbon",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function currentLisbonHour(): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Lisbon",
    hour: "2-digit",
    hour12: false,
  }).formatToParts(new Date());
  const hourPart = parts.find((p) => p.type === "hour");
  return hourPart ? parseInt(hourPart.value, 10) : -1;
}

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const isVercelCron = authHeader === `Bearer ${cronSecret}`;
  const isManualForce =
    new URL(request.url).searchParams.get("force") === cronSecret &&
    cronSecret !== undefined;

  if (cronSecret && !isVercelCron && !isManualForce) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const hour = currentLisbonHour();
  const dateKey = todayKeyLisbon();
  const geminiKey = process.env.GEMINI_API_KEY;
  const preferredTopics = parseTopicsParam(process.env.PREFERRED_TOPICS);

  let briefing;
  let source = "pool";
  let geminiError: string | undefined;

  if (geminiKey) {
    try {
      briefing = await generateBriefingWithGemini(
        dateKey,
        geminiKey,
        preferredTopics
      );
      source = "ai";
    } catch (error) {
      geminiError = error instanceof Error ? error.message : "unknown";
      console.error("[cron] Gemini failed:", geminiError);
      briefing = buildPoolBriefing(dateKey, preferredTopics);
    }
  } else {
    briefing = buildPoolBriefing(dateKey, preferredTopics);
  }

  const pushResult = await sendBriefingPush(briefing);

  return Response.json({
    dateKey,
    lisbonHour: hour,
    briefingSource: source,
    geminiError,
    push: pushResult,
    itemsCount: briefing.items.length,
  });
}
