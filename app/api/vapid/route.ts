export const dynamic = "force-dynamic";

export async function GET() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  if (!publicKey) {
    return Response.json(
      { error: "VAPID_PUBLIC_KEY não configurada no servidor" },
      { status: 500 }
    );
  }
  return Response.json({ publicKey });
}
