# Daily Mind Expander — Guia de Setup

Este guia leva-te do código no teu portátil até estares a receber notificações
diárias às 9h no iPhone. Demora cerca de 30-45 minutos da primeira vez.

> **Importante (iPhone):** As notificações Web Push no iOS só funcionam se
> instalares a app no **ecrã principal** e a abrires por aí — não pelo Safari.
> Isto é uma restrição da Apple, não do código.

---

## Passo 1 — Obter as chaves necessárias

Vais precisar de 3 coisas:

### 1.1 Chave da Gemini (IA que gera o conteúdo)

1. Vai a [aistudio.google.com/app/apikey](https://aistudio.google.com/app/apikey).
2. Inicia sessão com a tua conta Google.
3. Clica em **Create API key** → escolhe um projeto qualquer (ou cria um).
4. Copia a chave que aparece (`AIza...`). **Guarda-a em segurança.**

> O tier gratuito da Gemini 2.5 Flash permite ~1500 pedidos por dia. Tu só
> precisas de 1 por dia.

### 1.2 Chaves VAPID (para o Web Push)

Estas são duas chaves que provam ao iPhone que os push notifications vêm de ti.

No terminal do VSCode, dentro da pasta do projeto, corre:

```bash
npx web-push generate-vapid-keys
```

Vai mostrar algo como:

```
Public Key:
BHl9...long_string...
Private Key:
xY7...another_string...
```

**Copia ambas. Guarda-as.**

### 1.3 Segredo para o cron

No terminal corre:

```bash
openssl rand -hex 32
```

(no Windows, podes usar PowerShell: `[Convert]::ToHexString((1..32 | %{Get-Random -Maximum 256}))`)

Copia esse valor. É um token aleatório.

---

## Passo 2 — Pôr o código no GitHub

A Vercel faz deploy a partir de um repositório GitHub.

1. Cria conta em [github.com](https://github.com) se ainda não tens.
2. Cria um repositório novo (privado está bem). Não adiciones README — já tens
   os ficheiros locais.
3. No terminal do VSCode, dentro da pasta `daily-mind-expander`:

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/TEU_USER/TEU_REPO.git
git push -u origin main
```

---

## Passo 3 — Deploy na Vercel

1. Vai a [vercel.com/signup](https://vercel.com/signup) e cria conta com GitHub.
2. Clica em **Add New → Project**.
3. Escolhe o repositório que acabaste de criar.
4. **Antes de fazer Deploy**, abre **Environment Variables** e adiciona:

| Nome | Valor |
|---|---|
| `GEMINI_API_KEY` | A chave da Gemini do passo 1.1 |
| `VAPID_PUBLIC_KEY` | A "Public Key" do passo 1.2 |
| `VAPID_PRIVATE_KEY` | A "Private Key" do passo 1.2 |
| `VAPID_SUBJECT` | `mailto:o_teu_email@exemplo.com` |
| `CRON_SECRET` | O hex do passo 1.3 |

(O `PUSH_SUBSCRIPTION` vais preencher mais tarde — deixa em branco por agora.)

5. Clica em **Deploy**. Vai demorar 1-2 minutos.
6. Quando terminar, a Vercel dá-te um URL como `https://daily-mind-expander-xxx.vercel.app`. **Copia-o.**

---

## Passo 4 — Instalar a app no iPhone

1. No iPhone, abre o **Safari** (tem de ser Safari, não Chrome) e vai ao URL da Vercel.
2. Toca no botão **Partilhar** (quadrado com seta para cima).
3. Desce e toca em **Adicionar ao ecrã principal**.
4. Confirma. O ícone aparece no ecrã do iPhone.
5. **Fecha o Safari.**
6. **Toca no ícone do ecrã principal** para abrir a app (é importante abrir por aí).

---

## Passo 5 — Subscrever às notificações

Com a app aberta no iPhone (a partir do ícone do ecrã principal):

1. Toca em **Ativar notificações diárias**.
2. O iOS pergunta se permites notificações — toca **Permitir**.
3. A app mostra um bloco com um JSON grande e um botão **Copiar JSON da subscrição**.
4. Toca em **Copiar JSON da subscrição**.

> Se algum passo falhar, geralmente é porque abriste a app pelo Safari em vez
> de pelo ícone. Fecha tudo e abre pelo ícone.

---

## Passo 6 — Colar a subscrição na Vercel

1. Envia o JSON copiado para ti próprio (por email, AirDrop, Notas) para o teres no portátil.
2. No site da Vercel, vai ao teu projeto → **Settings** → **Environment Variables**.
3. Adiciona uma nova variável:
   - **Name:** `PUSH_SUBSCRIPTION`
   - **Value:** o JSON completo que copiaste
4. Vai a **Deployments**, abre o deployment mais recente e clica em **Redeploy**.

---

## Passo 7 — Testar

Para forçar um envio imediato sem esperar pelas 9h:

No browser do portátil, abre:

```
https://TEU-URL.vercel.app/api/cron?force=TEU_CRON_SECRET
```

(Substitui pelo URL e pelo valor de `CRON_SECRET` que geraste.)

Deves receber:
- Uma resposta JSON com `"ok": true` e `"statusCode": 201`.
- **Uma notificação no iPhone em segundos.**
- Ao tocar na notificação, a app abre com o briefing de hoje.

Se a notificação não chegar:
- Verifica que a env var `PUSH_SUBSCRIPTION` está preenchida.
- Verifica que fizeste redeploy depois de adicionar a env var.
- Vê os logs em **Deployments → último → Functions → /api/cron**.

---

## A partir daqui

A Vercel chama `/api/cron` automaticamente todos os dias às **08:00 UTC**:
- **Horário de Verão em Portugal (final de março a final de outubro):** 9h Lisboa ✅
- **Horário de Inverno (final de outubro a final de março):** 8h Lisboa

Se quiseres mudar para 9h Inverno também, edita `vercel.json` e muda `0 8 * * *`
para `0 9 * * *` (faz o oposto no verão). Para precisão total ano inteiro, vê a
secção "Cron alternativo" abaixo.

### Cron alternativo (opcional, para precisão de DST)

Se quiseres 9h Lisboa exatas o ano todo (Vercel cron grátis só corre a horas UTC fixas):

1. Apaga `vercel.json` ou esvazia o array `crons`.
2. Cria conta grátis em [cron-job.org](https://cron-job.org).
3. Cria novo cron:
   - **URL:** `https://TEU-URL.vercel.app/api/cron`
   - **Schedule:** todos os dias às 09:00, timezone **Europe/Lisbon**.
   - **Method:** GET
   - **Headers:** adiciona `Authorization: Bearer TEU_CRON_SECRET`
4. Salva. Pronto — 9h Lisboa todo o ano.

---

## Estrutura do projeto

```
app/
  api/
    briefing/route.ts    GET → gera briefing on-demand (Gemini + fallback)
    cron/route.ts        GET → cron diário, gera + envia push
    subscribe/route.ts   POST → recebe subscrição do iPhone
    vapid/route.ts       GET → devolve VAPID public key
  lib/
    briefing-pool.ts     Pool de 40+ tópicos de fallback
    gemini.ts            Cliente da Gemini API
    push.ts              Envio Web Push (VAPID + AES128GCM)
  DailyBriefing.tsx      Componente da página principal
  NotificationButton.tsx Subscrição Web Push
  manifest.ts            PWA manifest
public/
  sw.js                  Service worker (push + notificationclick)
vercel.json              Cron config
```

---

## Problemas comuns

**"A app não aparece como instalada" no iPhone**
Tens de a abrir pelo ícone do ecrã principal, não pelo Safari. No Safari aberto,
ela continua como página web — só quando entras pelo ícone é que é PWA.

**"VAPID não configurada" ao subscrever**
As env vars `VAPID_PUBLIC_KEY` e `VAPID_PRIVATE_KEY` não estão no Vercel.
Adiciona e faz redeploy.

**"Subscrição inválida" quando o cron tenta enviar**
A `PUSH_SUBSCRIPTION` está mal formatada. Copia outra vez do iPhone.

**Receber push mas não abrir a app**
Limpa o cache do Safari e reinstala a PWA. iOS é restritivo com service
workers — uma nova install resolve.

**Recebes briefing do pool (não da IA) sempre**
Verifica que `GEMINI_API_KEY` está no Vercel, e olha os logs em
`/api/cron` para ver o erro exato.
