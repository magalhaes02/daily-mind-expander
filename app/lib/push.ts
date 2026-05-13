import webpush from "web-push";
import type { Briefing } from "./briefing-pool";

export type PushResult = {
  ok: boolean;
  statusCode?: number;
  body?: string;
  error?: string;
};

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

function buildPayload(briefing: Briefing): string {
  const previewTitles = briefing.items
    .slice(0, 3)
    .map((item) => item.title)
    .join(" · ");

  const payload = {
    title: "Daily Mind Expander",
    body: `${briefing.items.length} tópicos novos: ${previewTitles}`,
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: `briefing-${briefing.dateKey}`,
    data: {
      url: "/",
      briefing,
    },
  };

  return JSON.stringify(payload);
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
