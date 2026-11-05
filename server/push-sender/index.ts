// Amcolink phone alerts sender — a Supabase Edge Function named "push".
//
// The website's database already writes every alert into public.notifications (price drops on saved ads,
// saved-search matches, ad approved/removed, profile verified, Wanted matches …).
// A Database Webhook calls this function for each new row; it sends that alert to the person's phones
// (public.push_tokens) through Firebase Cloud Messaging. It never decides WHO gets an alert — the database does.
//
// Secrets (Supabase → Edge Functions → Secrets), never in code or chat:
//   FCM_SERVICE_ACCOUNT  — the whole Firebase service-account JSON file
//   PUSH_WEBHOOK_SECRET  — any long random text; the webhook sends it in the "x-push-secret" header
// SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase automatically.
//
// Safety: the webhook's payload is not trusted. The function re-reads the notification by id, only sends it if it
// is less than 10 minutes old, and only to that row's own user.

import { createClient } from "npm:@supabase/supabase-js@2.49.1";

type ServiceAccount = { project_id: string; client_email: string; private_key: string };

const SA: ServiceAccount = JSON.parse(Deno.env.get("FCM_SERVICE_ACCOUNT") ?? "{}");
const HOOK_SECRET = Deno.env.get("PUSH_WEBHOOK_SECRET") ?? "";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const b64url = (data: ArrayBuffer | Uint8Array | string) => {
  const bytes = typeof data === "string" ? new TextEncoder().encode(data) : new Uint8Array(data);
  let s = "";
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};

let cached: { token: string; until: number } | null = null;

/** A short-lived Google access token for FCM, made from the service account (kept for 50 minutes). */
async function googleToken(): Promise<string> {
  if (cached && cached.until > Date.now()) return cached.token;
  const now = Math.floor(Date.now() / 1000);
  const head = b64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const claim = b64url(JSON.stringify({
    iss: SA.client_email, scope: "https://www.googleapis.com/auth/firebase.messaging",
    aud: "https://oauth2.googleapis.com/token", iat: now, exp: now + 3600,
  }));
  const pem = SA.private_key.replace(/-----[^-]+-----/g, "").replace(/\s+/g, "");
  const der = Uint8Array.from(atob(pem), (c) => c.charCodeAt(0));
  const key = await crypto.subtle.importKey("pkcs8", der, { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" }, false, ["sign"]);
  const sig = await crypto.subtle.sign("RSASSA-PKCS1-v1_5", key, new TextEncoder().encode(`${head}.${claim}`));
  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer", assertion: `${head}.${claim}.${b64url(sig)}` }),
  });
  if (!res.ok) throw new Error(`google token ${res.status}`);
  const j = await res.json();
  cached = { token: j.access_token, until: Date.now() + 50 * 60 * 1000 };
  return cached.token;
}

Deno.serve(async (req) => {
  if (!HOOK_SECRET || req.headers.get("x-push-secret") !== HOOK_SECRET) return new Response("forbidden", { status: 403 });
  if (!SA.project_id) return new Response("FCM_SERVICE_ACCOUNT missing", { status: 500 });

  let id = 0;
  try { id = Number((await req.json())?.record?.id) || 0; } catch { /* bad body */ }
  if (!id) return new Response("no id", { status: 400 });

  const { data: n } = await db.from("notifications").select("id,user_id,title,body,link,created_at").eq("id", id).maybeSingle();
  if (!n || Date.now() - new Date(n.created_at).getTime() > 10 * 60 * 1000) return new Response("skip");

  const { data: tokens } = await db.from("push_tokens").select("token").eq("user_id", n.user_id).eq("platform", "android").limit(10);
  if (!tokens?.length) return new Response("no phones");

  const access = await googleToken();
  let sent = 0;
  for (const { token } of tokens) {
    const res = await fetch(`https://fcm.googleapis.com/v1/projects/${SA.project_id}/messages:send`, {
      method: "POST",
      headers: { authorization: `Bearer ${access}`, "content-type": "application/json" },
      body: JSON.stringify({
        message: {
          token,
          notification: { title: n.title, body: n.body || undefined },
          data: { link: n.link ?? "" },
          android: { priority: "normal", notification: { channel_id: "alerts" } },
        },
      }),
    });
    if (res.ok) { sent++; continue; }
    const err = await res.text();
    // The phone uninstalled the app or the token expired: forget it.
    if (res.status === 404 || /UNREGISTERED/.test(err)) await db.from("push_tokens").delete().eq("token", token);
    else console.error("fcm", res.status, err.slice(0, 300));
  }
  return new Response(`sent ${sent}`);
});
