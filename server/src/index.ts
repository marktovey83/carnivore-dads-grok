/* Carnivore Dads server — Grok only.

   POST /scan/body   { height, weight, bodyFat, visceral, waist?, hips? }
   → factory description + image prompt

   POST /scan/image  { height, weight, bodyFat, visceral, waist?, hips? }
   → professional photorealistic body image URL from the scan numbers

   POST /ketones/explain  { mmol, hoursSinceMeal?, timeTaken? }
   → factory-language explanation

   Nothing is stored. Education only. */

import { FACTORY_SYSTEM, callGrok, generateScanImage, ketonePrompt, scanBodyPrompt, type KetoneInput, type ScanBodyInput } from "./grok.ts";

export interface Env {
  GROK_API_KEY: string;
  ALLOWED_ORIGINS: string;
  SCAN_LIMIT?: RateLimit;
  KETONE_LIMIT?: RateLimit;
}

export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    try {
      return await handle(req, env);
    } catch (err) {
      console.error("server crashed", err);
      const origin = req.headers.get("Origin") || "";
      const ok = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).includes(origin);
      return new Response(JSON.stringify({ error: "server_error", message: "Something went wrong. Try again." }), {
        status: 500,
        headers: { "Content-Type": "application/json", ...(ok ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : {}) },
      });
    }
  },
};

async function handle(req: Request, env: Env): Promise<Response> {
  const origin = req.headers.get("Origin") || "";
  const allowed = (env.ALLOWED_ORIGINS || "").split(",").map((s) => s.trim()).filter(Boolean);
  const cors: Record<string, string> = allowed.includes(origin)
    ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" }
    : {};
  const json = (status: number, body: unknown) =>
    new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json", ...cors } });

  const url = new URL(req.url);

  if (url.pathname === "/health") {
    const k = env.GROK_API_KEY || "";
    return json(200, {
      ok: true,
      provider: "grok",
      key_set: Boolean(k),
      key_length: k.length,
      key_prefix: k.slice(0, 8),
      key_suffix: k.slice(-4),
    });
  }

  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: allowed.includes(origin) ? 204 : 403,
      headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" },
    });
  }

  if (!allowed.includes(origin)) return json(403, { error: "origin_not_allowed" });
  if (req.method !== "POST") return json(405, { error: "method_not_allowed" });
  if (!env.GROK_API_KEY) return json(503, { error: "not_set_up", message: "Grok key is not set yet." });

  if (url.pathname === "/scan/body") {
    if (env.SCAN_LIMIT) {
      const who = req.headers.get("CF-Connecting-IP") || "unknown";
      const { success } = await env.SCAN_LIMIT.limit({ key: who });
      if (!success) return json(429, { error: "too_many" });
    }
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json(400, { error: "bad_request" });
    }
    const scan = raw as ScanBodyInput;
    const result = await callGrok(env.GROK_API_KEY, FACTORY_SYSTEM, scanBodyPrompt(scan));
    if ("error" in result) return json(result.status, { error: result.error });
    return json(200, { text: result.text });
  }

  if (url.pathname === "/scan/image") {
    if (env.SCAN_LIMIT) {
      const who = req.headers.get("CF-Connecting-IP") || "unknown";
      const { success } = await env.SCAN_LIMIT.limit({ key: who });
      if (!success) return json(429, { error: "too_many" });
    }
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json(400, { error: "bad_request" });
    }
    const scan = raw as ScanBodyInput;
    const result = await generateScanImage(env.GROK_API_KEY, scan);
    if ("error" in result) return json(result.status, { error: result.error, raw: result.raw });
    return json(200, { image: result.url });
  }

  if (url.pathname === "/ketones/explain") {
    if (env.KETONE_LIMIT) {
      const who = req.headers.get("CF-Connecting-IP") || "unknown";
      const { success } = await env.KETONE_LIMIT.limit({ key: who });
      if (!success) return json(429, { error: "too_many" });
    }
    let raw: unknown;
    try {
      raw = await req.json();
    } catch {
      return json(400, { error: "bad_request" });
    }
    const k = raw as KetoneInput;
    if (k.mmol == null || !Number.isFinite(Number(k.mmol))) return json(400, { error: "missing_mmol" });
    const result = await callGrok(env.GROK_API_KEY, FACTORY_SYSTEM, ketonePrompt(k));
    if ("error" in result) return json(result.status, { error: result.error });
    return json(200, { text: result.text });
  }

  return json(404, { error: "not_found" });
}
