"use client";

import { useEffect, useState } from "react";

function urlBase64ToUint8Array(base64String: string): Uint8Array<ArrayBuffer> {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const output = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    output[i] = rawData.charCodeAt(i);
  }
  return output;
}

type IosState = "not-ios" | "standalone" | "needs-install";

function detectIosState(): IosState {
  if (typeof window === "undefined") return "not-ios";
  const ua = window.navigator.userAgent;
  const isIos = /iPad|iPhone|iPod/.test(ua);
  if (!isIos) return "not-ios";
  type SafariNav = Navigator & { standalone?: boolean };
  const standalone =
    (window.navigator as SafariNav).standalone === true ||
    window.matchMedia("(display-mode: standalone)").matches;
  return standalone ? "standalone" : "needs-install";
}

export default function NotificationButton() {
  const [message, setMessage] = useState("");
  const [iosState, setIosState] = useState<IosState>("not-ios");
  const [permission, setPermission] = useState<NotificationPermission | "default">(
    "default"
  );
  const [subscriptionJson, setSubscriptionJson] = useState<string>("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    setIosState(detectIosState());
    if (typeof Notification !== "undefined") {
      setPermission(Notification.permission);
    }
  }, []);

  function withTimeout<T>(
    promise: Promise<T>,
    ms: number,
    label: string
  ): Promise<T> {
    return Promise.race([
      promise,
      new Promise<T>((_, reject) =>
        setTimeout(() => reject(new Error(`Timeout em: ${label}`)), ms)
      ),
    ]);
  }

  async function subscribePush() {
    setBusy(true);
    setMessage("");
    try {
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        setMessage(
          "Este browser não suporta Web Push. No iPhone, instala a app no ecrã principal (Partilhar → Adicionar ao ecrã principal) e abre a partir daí."
        );
        return;
      }

      setMessage("1/6 A verificar permissão...");
      let perm: NotificationPermission = Notification.permission;
      if (perm !== "granted") {
        perm = await withTimeout(
          Notification.requestPermission(),
          30000,
          "pedir permissão"
        );
        setPermission(perm);
      }
      if (perm !== "granted") {
        setMessage("Permissão de notificações não concedida.");
        return;
      }

      setMessage("2/6 A obter chave VAPID...");
      const vapidRes = await withTimeout(fetch("/api/vapid"), 15000, "fetch VAPID");
      if (!vapidRes.ok) {
        const errBody = await vapidRes.json().catch(() => ({}));
        setMessage(
          `Falta configurar VAPID no servidor: ${errBody.error ?? "erro desconhecido"}`
        );
        return;
      }
      const { publicKey } = (await vapidRes.json()) as { publicKey: string };

      setMessage("3/6 A esperar pelo service worker...");
      let registration: ServiceWorkerRegistration | undefined;
      try {
        registration = await withTimeout(
          navigator.serviceWorker.ready,
          5000,
          "SW ready inicial"
        );
      } catch {
        setMessage("3b/6 SW não estava pronto — a registar explicitamente...");
        try {
          const existingRegs = await navigator.serviceWorker.getRegistrations();
          for (const r of existingRegs) {
            await r.unregister().catch(() => {});
          }
        } catch {}

        registration = await withTimeout(
          navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }),
          15000,
          "registar SW"
        );

        setMessage("3c/6 A esperar que o SW fique ativo...");
        if (!registration.active) {
          await withTimeout(
            new Promise<void>((resolve, reject) => {
              const target = registration!.installing ?? registration!.waiting;
              if (!target) {
                if (registration!.active) return resolve();
                return reject(new Error("Sem SW a instalar/aguardar"));
              }
              target.addEventListener("statechange", () => {
                if (target.state === "activated") resolve();
              });
            }),
            20000,
            "SW activar"
          );
        }
      }
      if (!registration) {
        throw new Error("Não consegui obter registo do service worker");
      }

      setMessage("4/6 A limpar subscrição antiga...");
      const existing = await registration.pushManager.getSubscription();
      if (existing) {
        try {
          await withTimeout(existing.unsubscribe(), 10000, "unsubscribe antiga");
        } catch {
          // ignora — vamos tentar criar uma nova na mesma
        }
      }

      setMessage("5/6 A criar nova subscrição (pode demorar)...");
      const sub = await withTimeout(
        registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }),
        45000,
        "criar subscrição (iOS)"
      );

      const json = JSON.stringify(sub.toJSON());
      setSubscriptionJson(json);

      setMessage("6/6 A guardar no servidor...");
      const saveRes = await withTimeout(
        fetch("/api/subscribe", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: json,
        }),
        15000,
        "POST subscribe"
      );
      const saveBody = await saveRes.json().catch(() => ({}));

      if (saveBody.alreadyStored) {
        setMessage(
          "✓ Subscrição ativa e já configurada no servidor. Vais receber o briefing às 9h."
        );
      } else {
        setMessage(
          "✓ Subscrição criada. Falta um passo manual: copia o JSON abaixo e cola na variável PUSH_SUBSCRIPTION no Vercel."
        );
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setMessage(`Erro: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  async function unsubscribePush() {
    setBusy(true);
    try {
      const registration = await navigator.serviceWorker.ready;
      const sub = await registration.pushManager.getSubscription();
      if (sub) {
        await sub.unsubscribe();
        setSubscriptionJson("");
        setMessage("Subscrição removida deste dispositivo.");
      } else {
        setMessage("Não havia subscrição ativa.");
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Erro desconhecido";
      setMessage(`Erro: ${msg}`);
    } finally {
      setBusy(false);
    }
  }

  function copySubscription() {
    if (!subscriptionJson) return;
    navigator.clipboard.writeText(subscriptionJson).then(
      () => setMessage("JSON copiado. Cola em PUSH_SUBSCRIPTION no Vercel."),
      () => setMessage("Não consegui copiar — seleciona e copia manualmente.")
    );
  }

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "clamp(18px, 5vw, 24px)",
        borderRadius: "18px",
        background: "rgba(15, 23, 42, 0.95)",
        border: "1px solid #334155",
      }}
    >
      <h2 style={{ marginTop: 0, fontSize: "clamp(20px, 5.5vw, 24px)" }}>
        Notificações diárias
      </h2>

      {iosState === "needs-install" && (
        <div
          style={{
            background: "rgba(250, 204, 21, 0.12)",
            border: "1px solid #facc15",
            color: "#fde68a",
            padding: "clamp(12px, 3.5vw, 14px) clamp(14px, 4vw, 16px)",
            borderRadius: "12px",
            marginBottom: "14px",
            lineHeight: 1.55,
            fontSize: "clamp(13px, 3.6vw, 15px)",
          }}
        >
          <strong>Importante (iPhone):</strong> as notificações no iOS só
          funcionam depois de instalares esta app no ecrã principal.
          <br />
          No Safari, toca em <strong>Partilhar</strong> → <strong>Adicionar ao
          ecrã principal</strong>, e abre a app pelo ícone (não pelo Safari).
        </div>
      )}

      <p
        style={{
          color: "#cbd5e1",
          lineHeight: 1.6,
          fontSize: "clamp(14px, 3.8vw, 16px)",
          margin: "0 0 4px 0",
        }}
      >
        Ativa as notificações para receberes o briefing diário às 9h, mesmo com
        a app fechada.
      </p>

      <div
        style={{
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
          marginTop: "14px",
        }}
      >
        <button
          onClick={subscribePush}
          disabled={busy}
          style={{
            padding: "clamp(12px, 3.5vw, 14px) clamp(18px, 5vw, 22px)",
            borderRadius: "999px",
            border: "none",
            background: busy ? "#475569" : "#38bdf8",
            color: "#020617",
            fontWeight: "bold",
            cursor: busy ? "not-allowed" : "pointer",
            fontSize: "clamp(14px, 4vw, 16px)",
            flex: "1 1 auto",
          }}
        >
          {busy ? "A processar..." : "Ativar notificações diárias"}
        </button>

        <button
          onClick={unsubscribePush}
          disabled={busy}
          style={{
            padding: "clamp(12px, 3.5vw, 14px) clamp(18px, 5vw, 22px)",
            borderRadius: "999px",
            border: "1px solid #64748b",
            background: "transparent",
            color: "#e2e8f0",
            fontWeight: "bold",
            cursor: busy ? "not-allowed" : "pointer",
            fontSize: "clamp(14px, 4vw, 16px)",
          }}
        >
          Remover subscrição
        </button>
      </div>

      {permission === "denied" && (
        <p style={{ marginTop: "16px", color: "#fca5a5" }}>
          As notificações estão bloqueadas. Vai a Definições → Notificações →
          Daily Mind Expander e ativa.
        </p>
      )}

      {message && (
        <p style={{ marginTop: "16px", color: "#7dd3fc" }}>{message}</p>
      )}

      {subscriptionJson && (
        <div style={{ marginTop: "16px" }}>
          <button
            onClick={copySubscription}
            style={{
              padding: "10px 16px",
              borderRadius: "999px",
              border: "1px solid #38bdf8",
              background: "transparent",
              color: "#7dd3fc",
              fontWeight: "bold",
              cursor: "pointer",
              fontSize: "14px",
            }}
          >
            Copiar JSON da subscrição
          </button>
          <pre
            style={{
              marginTop: "12px",
              background: "#020617",
              border: "1px solid #1e293b",
              color: "#cbd5e1",
              padding: "12px",
              borderRadius: "12px",
              fontSize: "11px",
              overflowX: "auto",
              wordBreak: "break-all",
              whiteSpace: "pre-wrap",
            }}
          >
            {subscriptionJson}
          </pre>
          <p style={{ color: "#94a3b8", fontSize: "13px", lineHeight: 1.6 }}>
            Copia este texto e cola na variável <code>PUSH_SUBSCRIPTION</code> do
            Vercel (Settings → Environment Variables → Production). Depois faz
            um redeploy. Só é preciso fazer isto uma vez por dispositivo.
          </p>
        </div>
      )}
    </div>
  );
}
