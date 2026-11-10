import { projectSlidesQuery, realtime } from "@/lib/realtime";

export async function POST() {
  if (!realtime) {
    return Response.json({ error: "Neon Realtime is not configured" }, { status: 503 });
  }
  const sealedQuery = await realtime.seal({ query: projectSlidesQuery() });
  return Response.json(sealedQuery, { headers: { "Cache-Control": "no-store" } });
}
