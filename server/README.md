# Carnivore Dads server — Grok only

Runs on Cloudflare Workers. The Grok API key stays on the server, never in the public app.

## Endpoints

### POST /scan/body
```json
{ "height": 180, "weight": 95, "bodyFat": 28, "visceral": 12 }
```
Returns a factory-language description of the body from the scan numbers, plus an image prompt.

### POST /ketones/explain
```json
{ "mmol": 0.4, "hoursSinceMeal": 14, "timeTaken": "07:30" }
```
Returns a short factory-language explanation of the reading.

### GET /health
Shows whether the Grok key is set.

Nothing is stored. Education only.

## Set it up

```bash
cd server
npm install
npx wrangler login
npx wrangler secret put GROK_API_KEY
npx wrangler deploy
```

The live server deploys from GitHub on pushes that change `server/`.

## Notes

- Factory language only.
- No Anthropic, no Gemini.
- Rate limits: 6 scan body calls / minute, 10 ketone explanations / minute per connection.
