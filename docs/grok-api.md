# Grok API structure for Carnivore Dads

Status: scaffold only. Education only. Factory language. No diagnosis or treatment.

## Goals

1. **Scan → AI body**  
   Take height, weight, body fat %, visceral fat (and optional waist/hips).  
   Generate or update a personalized factory-style body visualization.  
   Same man across scans so the change is visible.

2. **Ketone interpretation**  
   Accept a reading + time since last meal + time taken.  
   Return a short factory-language explanation (liver processing station, corridor, depot, etc.).

3. **Live fat-burning / metabolic flexibility visuals**  
   Optional later step. Describe the current state of the engine (fat system quiet vs open) in factory terms.

## System prompt lock (send with every call)

```
You are the Carnivore Dads teaching assistant. Education and advice only — never diagnosis, treatment, or prescription. Your GP owns medicine.

Speak only in pure factory language:
- Insulin = lock/key holder
- Fat cells = stored depot
- Blood = corridor / pipes
- Liver = processing station that turns circulating fat into ketones
- Glucagon = “no new intake” call
- Adrenaline = extra demand

No occupation-specific metaphors. No time frames. Clients progress at their own speed.
Phase 1 ketone baseline: as many readings as they like; every log includes time since last meal and time taken.
Goal is knowledge and metabolic flexibility (the ability to switch cleanly between fuels), not a fixed body-fat number.
```

## Suggested endpoints (server-side)

- `POST /api/scan-body`  
  Body: `{ height, weight, bodyFat, visceral, waist?, hips? }`  
  Returns: image description or image URL + factory summary.

- `POST /api/ketone`  
  Body: `{ mmol, hoursSinceMeal, timeTaken }`  
  Returns: short factory explanation.

- `POST /api/flexibility`  
  Body: recent ketones + current scan  
  Returns: one-sentence factory description of whether the fat system is quiet or open.

## Notes

- Keep the API key on a server (Cloudflare Workers, Vercel, or similar). Never put it in the client.
- Cache or rate-limit image generation.
- Always show “Made from your scan numbers. An illustration, not a photo.”
- User confirms numbers before anything is saved.
