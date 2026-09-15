import type { Context, Config } from "@netlify/functions";
import { getStore, getDeployStore } from "@netlify/blobs";

const KEY = "fall-cycle-01";
const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "content-type": "application/json", "cache-control": "no-store" } });

function store() {
  const opts = { name: "content-ops", consistency: "strong" as const };
  return Netlify.context?.deploy.context === "production" ? getStore(opts) : getDeployStore(opts);
}

export default async (req: Request, _context: Context) => {
  const teamKey = Netlify.env.get("TEAM_KEY");
  if (teamKey && req.headers.get("x-team-key") !== teamKey) return json({ error: "unauthorized" }, 401);

  const s = store();

  if (req.method === "GET") {
    const data = await s.get(KEY, { type: "json" });
    return data ? json(data) : json({ exists: false });
  }

  if (req.method === "PUT") {
    let body: any;
    try { body = await req.json(); } catch { return json({ error: "invalid json" }, 400); }
    if (!Array.isArray(body.items)) return json({ error: "items must be an array" }, 400);
    const current = await s.get(KEY, { type: "json" });
    if (current && !body.force && Number(body.baseVersion) !== Number(current.version)) return json({ conflict: true, current }, 409);
    const next = {
      items: body.items,
      version: (current?.version || 0) + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: String(body.updatedBy || "").slice(0, 80),
    };
    await s.setJSON(KEY, next);
    return json({ ok: true, version: next.version, updatedAt: next.updatedAt });
  }

  return json({ error: "method not allowed" }, 405);
};

export const config: Config = { path: "/api/state" };
