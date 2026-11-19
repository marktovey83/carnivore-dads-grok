/* Grok API helpers for Carnivore Dads.
   Education only. Factory language. No diagnosis or treatment. */

export const FACTORY_SYSTEM = `You are the Carnivore Dads teaching assistant. Education and advice only — never diagnosis, treatment, or prescription. Your GP owns medicine.

Speak only in pure factory language:
- Insulin = lock/key holder
- Fat cells = stored depot
- Blood = corridor / pipes
- Liver = processing station that turns circulating fat into ketones
- Glucagon = “no new intake” call
- Adrenaline = extra demand

No occupation-specific metaphors. No fixed time frames. Clients progress at their own speed.
Phase 1 ketone baseline: as many readings as they like; every log includes time since last meal and time taken.
Goal is knowledge and metabolic flexibility, not a fixed body-fat number.`;

export type ScanBodyInput = {
  height?: number;
  weight?: number;
  bodyFat?: number;
  visceral?: number;
  waist?: number;
  hips?: number;
};

export type KetoneInput = {
  mmol: number;
  hoursSinceMeal?: number | null;
  timeTaken?: string | null;
};

export function scanBodyPrompt(scan: ScanBodyInput): string {
  const parts = [
    scan.height ? `height ${scan.height} cm` : null,
    scan.weight ? `weight ${scan.weight} kg` : null,
    scan.bodyFat != null ? `body fat ${scan.bodyFat}%` : null,
    scan.visceral != null ? `visceral fat level ${scan.visceral}` : null,
    scan.waist ? `waist ${scan.waist} cm` : null,
    scan.hips ? `hips ${scan.hips} cm` : null,
  ].filter(Boolean);

  return `A man has these body scan numbers: ${parts.join(", ") || "incomplete scan"}.

Describe his factory in plain language for him (2–4 short sentences):
- What the numbers say about the size of the engine and the size of the depot (especially visceral / organ warehouse).
- That this is a baseline blueprint, not a score.
- That the outside paint follows the inside once the fuel and pipes are right.

Then give a single precise image prompt (one paragraph) that an image model can use to draw a respectful full-body front view of this man in training shorts, plain charcoal background, standing straight. The image must match the numbers honestly (neither flattering nor exaggerated). No face likeness required. No text in the image.`;
}

/* High-quality professional image prompt built directly from scan numbers. */
export function professionalScanImagePrompt(scan: ScanBodyInput): string {
  const h = scan.height || 180;
  const w = scan.weight || 95;
  const bf = scan.bodyFat ?? 28;
  const vis = scan.visceral ?? 12;

  const bmi = w / (h / 100) ** 2;
  const frame =
    bmi >= 32 ? "a large, heavy frame with substantial mass" :
    bmi >= 27 ? "a solid, heavy-set frame" :
    bmi >= 23 ? "a medium, solid frame" :
    "a leaner frame";

  const fatDesc =
    bf >= 35 ? "significant soft fat coverage across the torso, a large protruding belly, soft chest and sides" :
    bf >= 28 ? "noticeable midsection fat with a clear belly and soft waist, limited muscle definition" :
    bf >= 22 ? "moderate softness around the waist and lower chest, some muscle shape still visible in the shoulders and arms" :
    bf >= 15 ? "relatively lean with mild waist softness and visible muscle tone in the upper body" :
    "lean and defined with clear muscle separation and a flat stomach";

  const visDesc =
    vis >= 15 ? "thick, firm visceral fat creating a rounded, protruding midsection and wide waist" :
    vis >= 10 ? "extra visceral fat giving a thicker waist and outward belly" :
    vis >= 6 ? "mild extra around the middle" :
    "trim midsection";

  return `Photorealistic full-body studio photograph of an ordinary working dad, head to feet in frame, front view, standing straight and relaxed with arms at his sides, calm neutral expression, looking toward camera. Shirtless, wearing plain black mid-thigh training shorts, barefoot. Plain dark charcoal studio background, soft even professional lighting, sharp focus, natural skin texture, realistic proportions.

Body accurately matches these scan numbers: ${h} cm tall, ${w} kg, ${bf}% body fat, visceral fat level ${vis}. He has ${frame}. Body composition: ${fatDesc}. Midsection: ${visDesc}.

Draw the body honestly to the numbers — neither flattering nor exaggerated. Respectful fitness-assessment style photo. No text, logos, watermarks, tattoos, or jewellery.`;
}

export function ketonePrompt(k: KetoneInput): string {
  const when = k.hoursSinceMeal != null ? `${k.hoursSinceMeal} hours since last meal` : "time since last meal not given";
  const clock = k.timeTaken ? ` taken at ${k.timeTaken}` : "";
  return `He just logged a blood ketone reading of ${k.mmol} mmol/L (${when}${clock}).

Explain this reading in pure factory language (2–3 short sentences):
- What the number says about whether the fat system is quiet or open right now.
- That one reading is not a pass or fail; the trend and the time context matter.
- Education only. Do not diagnose or prescribe.`;
}

export async function callGrok(key: string, system: string, user: string): Promise<{ text: string } | { error: string; status: number }> {
  const res = await fetch("https://api.x.ai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "grok-4",
      messages: [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      temperature: 0.4,
      max_tokens: 800,
    }),
  });

  const body: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    return { error: String(body?.error?.message || "grok_failed"), status: res.status };
  }
  const text = body?.choices?.[0]?.message?.content || "";
  if (!text) return { error: "empty_reply", status: 502 };
  return { text };
}

/* Generate a professional body image from scan numbers using Grok Imagine. */
export async function generateScanImage(key: string, scan: ScanBodyInput): Promise<{ url: string } | { error: string; status: number; raw?: any }> {
  const prompt = professionalScanImagePrompt(scan);
  const res = await fetch("https://api.x.ai/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model: "grok-imagine-image",
      prompt,
      n: 1,
    }),
  });

  const body: any = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body?.error?.message || body?.message || JSON.stringify(body).slice(0, 300) || "image_failed";
    return { error: String(msg), status: res.status, raw: body };
  }
  const url = body?.data?.[0]?.url || body?.data?.[0]?.b64_json || body?.url || body?.image_url;
  if (!url) return { error: "no_image_url", status: 502, raw: body };
  return { url: url.startsWith("http") ? url : `data:image/png;base64,${url}` };
}
