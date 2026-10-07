import { eq } from "drizzle-orm";
import { getDb } from "@/lib/db";
import { heartbeat } from "@/lib/db/schema";

// Supabase pauses free projects after a week without activity; Vercel Cron calls this daily.
export async function GET(request: Request) {
  if (request.headers.get("authorization") !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  const [row] = await getDb()
    .update(heartbeat)
    .set({ pingedAt: new Date() })
    .where(eq(heartbeat.id, 1))
    .returning({ pingedAt: heartbeat.pingedAt });
  return Response.json({ ok: true, pingedAt: row?.pingedAt });
}
