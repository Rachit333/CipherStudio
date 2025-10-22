import upstash from "@/lib/upstashClient";
import admin from "firebase-admin";

function ensureAdmin() {
  if (admin.apps && admin.apps.length) return admin.app();
  try {
    if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
      const svc = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON);
      return admin.initializeApp({ credential: admin.credential.cert(svc) });
    }
  } catch (e) {
  }
  try {
    return admin.initializeApp();
  } catch (e) {
    return admin.app();
  }
}

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}));
  const authHeader = req.headers.get("authorization") || req.headers.get("Authorization");
  let uid: string | undefined;
  if (!authHeader) {
    return new Response(JSON.stringify({ error: "authentication required" }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  const token = authHeader.replace(/^Bearer\s+/i, "");
  try {
    const adminApp = ensureAdmin();
    const decoded = await adminApp.auth().verifyIdToken(token);
    uid = decoded.uid;
  } catch (e: any) {
    return new Response(JSON.stringify({ error: 'invalid token', detail: e?.message ?? String(e) }), { status: 401, headers: { 'Content-Type': 'application/json' } });
  }
  if (body.files && typeof body.files === "object") {
    const projectId = body.projectId;
    const owner = body.owner || undefined;
    const payload = {
      files: body.files,
      savedAt: new Date().toISOString(),
      owner: owner || null,
      pushedBy: uid || null,
    };
    const keyProject = `project:${projectId}`;
    try {
      await upstash.set(keyProject, payload);
      if (owner) {
        const keyUser = `user:${owner}:project:${projectId}`;
        await upstash.set(keyUser, payload);
      }
      return new Response(JSON.stringify({ ok: true, key: keyProject, pushedBy: uid, payload }), { status: 200, headers: { "Content-Type": "application/json" } });
    } catch (e: any) {
      return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { "Content-Type": "application/json" } });
    }
  }

  const { key, value } = body as { key?: string; value?: any };
  if (!key) {
    return new Response(JSON.stringify({ error: 'key required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  }

  try {
    await upstash.set(key, value);
    return new Response(JSON.stringify({ ok: true, key, pushedBy: uid }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const key = searchParams.get("key");
  if (!key) return new Response(JSON.stringify({ error: 'key required' }), { status: 400, headers: { 'Content-Type': 'application/json' } });
  try {
    const value = await upstash.get(key);
    return new Response(JSON.stringify({ key, value }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message ?? String(e) }), { status: 500, headers: { 'Content-Type': 'application/json' } });
  }
}
