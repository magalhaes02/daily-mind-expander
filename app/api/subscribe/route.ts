export const dynamic = "force-dynamic";

type PushSubscriptionJSON = {
  endpoint: string;
  expirationTime?: number | null;
  keys?: { p256dh?: string; auth?: string };
};

export async function POST(request: Request) {
  let body: PushSubscriptionJSON;
  try {
    body = (await request.json()) as PushSubscriptionJSON;
  } catch {
    return Response.json({ error: "JSON inválido" }, { status: 400 });
  }

  if (!body?.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return Response.json(
      { error: "Subscrição inválida — falta endpoint ou keys" },
      { status: 400 }
    );
  }

  const serialized = JSON.stringify(body);

  console.log("[subscribe] Nova subscrição recebida:");
  console.log("[subscribe] PUSH_SUBSCRIPTION=" + serialized);

  const stored = process.env.PUSH_SUBSCRIPTION;
  const alreadyStored = stored === serialized;

  return Response.json({
    ok: true,
    alreadyStored,
    subscriptionJson: serialized,
    instructions: alreadyStored
      ? "Já está configurada no servidor."
      : "Copia o subscriptionJson para a variável de ambiente PUSH_SUBSCRIPTION no Vercel e faz redeploy.",
  });
}
