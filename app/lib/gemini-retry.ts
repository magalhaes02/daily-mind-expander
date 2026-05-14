const RETRYABLE_STATUS = new Set([429, 500, 502, 503, 504]);

export async function geminiFetchWithRetry(
  url: string,
  init: RequestInit,
  maxAttempts = 3
): Promise<Response> {
  let lastResponse: Response | undefined;
  let lastError: unknown;

  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const res = await fetch(url, init);
      if (res.ok) return res;

      if (!RETRYABLE_STATUS.has(res.status) || attempt === maxAttempts - 1) {
        return res;
      }

      try {
        await res.body?.cancel();
      } catch {}

      lastResponse = res;
      const delayMs = Math.min(6000, 800 * Math.pow(2, attempt));
      await new Promise((r) => setTimeout(r, delayMs));
    } catch (err) {
      lastError = err;
      if (attempt === maxAttempts - 1) break;
      const delayMs = Math.min(6000, 800 * Math.pow(2, attempt));
      await new Promise((r) => setTimeout(r, delayMs));
    }
  }

  if (lastResponse) return lastResponse;
  if (lastError) throw lastError;
  throw new Error("Falha desconhecida ao contactar a Gemini");
}

export function friendlyGeminiError(status: number, raw: string): string {
  if (status === 503) {
    return "A IA está com muita procura agora. Tenta de novo em alguns segundos.";
  }
  if (status === 429) {
    return "Limite de pedidos atingido. Espera 1-2 minutos e tenta de novo.";
  }
  if (status === 401 || status === 403) {
    return "Problema de autenticação com a Gemini. Verifica a chave no servidor.";
  }
  if (status >= 500) {
    return "Servidores da IA temporariamente indisponíveis. Tenta de novo.";
  }
  return raw ? `Erro ${status}: ${raw.slice(0, 120)}` : `Erro ${status}`;
}
