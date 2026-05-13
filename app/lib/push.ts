import webpush from "web-push";
import type { Briefing, BriefingItem } from "./briefing-pool";

export type PushResult = {
  ok: boolean;
  statusCode?: number;
  body?: string;
  error?: string;
};

const MAX_PAYLOAD_BYTES = 3000;

function configureVapid() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT ?? "mailto:owner@example.com";

  if (!publicKey || !privateKey) {
    throw new Error(
      "VAPID_PUBLIC_KEY ou VAPID_PRIVATE_KEY não configuradas no servidor"
    );
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
}

function truncateItem(
  item: BriefingItem,
  textMax: number,
  relMax: number,
  titleMax: number
): BriefingItem {
  return {
    category: item.category,
    title: item.title.length > titleMax ? item.title.slice(0, titleMax) : item.title,
    text: item.text.length > textMax ? item.text.slice(0, textMax - 1) + "…" : item.text,
    relevance:
      item.relevance.length > relMax ? item.relevance.slice(0, relMax - 1) + "…" : item.relevance,
  };
}

function shrinkBriefing(
  briefing: Briefing,
  itemCount: number,
  textMax: number,
  relMax: number,
  titleMax: number
): Briefing {
  return {
    generatedAt: briefing.generatedAt,
    dateKey: briefing.dateKey,
    source: briefing.source,
    items: briefing.items
      .slice(0, itemCount)
      .map((item) => truncateItem(item, textMax, relMax, titleMax)),
    reflection:
      briefing.reflection.length > 220
        ? briefing.reflection.slice(0, 219) + "…"
        : briefing.reflection,
    recommendation:
      briefing.recommendation.length > 220
        ? briefing.recommendation.slice(0, 219) + "…"
        : briefing.recommendation,
  };
}

function buildPayload(briefing: Briefing): string {
  const previewTitles = briefing.items
    .slice(0, 3)
    .map((item) => item.title)
    .join(" · ");

  const baseHeader = {
    title: "Daily Mind Expander",
    body: `${briefing.items.length} tópicos novos: ${previewTitles}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `briefing-${briefing.dateKey}`,
  };

  const tiers: Array<{ items: number; text: number; rel: number; title: number }> = [
    { items: 12, text: 260, rel: 140, title: 100 },
    { items: 10, text: 220, rel: 110, title: 90 },
    { items: 10, text: 180, rel: 90, title: 80 },
    { items: 8, text: 160, rel: 80, title: 80 },
    { items: 8, text: 130, rel: 70, title: 70 },
    { items: 7, text: 110, rel: 60, title: 60 },
    { items: 6, text: 100, rel: 50, title: 60 },
  ];

  for (const tier of tiers) {
    const trimmed = shrinkBriefing(briefing, tier.items, tier.text, tier.rel, tier.title);
    const payload = { ...baseHeader, data: { url: "/", briefing: trimmed } };
    const serialized = JSON.stringify(payload);
    if (Buffer.byteLength(serialized, "utf8") <= MAX_PAYLOAD_BYTES) {
      return serialized;
    }
  }

  // Last resort: drop the briefing entirely from the payload.
  const minimal = {
    ...baseHeader,
    data: { url: "/", briefingMissing: true, dateKey: briefing.dateKey },
  };
  return JSON.stringify(minimal);
}

export async function sendBriefingPush(briefing: Briefing): Promise<PushResult> {
  configureVapid();

  const stored = process.env.PUSH_SUBSCRIPTION;
  if (!stored) {
    return {
      ok: false,
      error:
        "PUSH_SUBSCRIPTION não configurada. Subscreve no telemóvel primeiro e copia o JSON para o Vercel.",
    };
  }

  let subscription;
  try {
    subscription = JSON.parse(stored);
  } catch {
    return { ok: false, error: "PUSH_SUBSCRIPTION com JSON inválido" };
  }

  const payload = buildPayload(briefing);

  try {
    const result = await webpush.sendNotification(subscription, payload, {
      TTL: 60 * 60 * 12,
    });
    return {
      ok: true,
      statusCode: result.statusCode,
      body: result.body,
    };
  } catch (error) {
    const err = error as { statusCode?: number; body?: string; message?: string };
    return {
      ok: false,
      statusCode: err.statusCode,
      body: err.body,
      error: err.message ?? "Erro desconhecido a enviar push",
    };
  }
}
