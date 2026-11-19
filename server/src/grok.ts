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

/* Build a clear factory-language description from scan numbers. */
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

/* Build a ketone explanation request. */
export function ketonePrompt(k: KetoneInput): string {
  const when = k.hoursSinceMeal != null ? `${k.hoursSinceMeal} hours since last meal` : "time since last meal not given";
  const clock = k.timeTaken ? ` taken at ${k.timeTaken}` : "";
  return `He just logged a blood ketone reading of ${k.mmol} mmol/L (${when}${clock}).

Explain this reading in pure factory language (2–3 short sentences):
- What the number says about whether the fat system is quiet or open right now.
- That one reading is not a pass or fail; the trend and the time context matter.
- Education only. Do not diagnose or prescribe.`;
}

/* Call xAI Grok chat completions. */
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
