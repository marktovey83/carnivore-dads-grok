# Carnivore Dads

React build of the Carnivore Dads app — a five-phase men's health teaching program for dads. Design system and copy come from the locked canvases. Education only.

**Live:** https://marktovey83.github.io/carnivore-dads-grok/ (once Pages is enabled on this repo)

**Repo:** https://github.com/marktovey83/carnivore-dads-grok

## Design system (locked)

- Charcoal `#141414` · Plate `#262626` · Bone `#EDE6D6` · Ember `#C9963A`
- Type: Anton (display), Antonio (text)
- Lockup: country flag plate → CD plate → ember rule → wordmark
- Countries: AU, NZ, UK, IE, US, CA, ZA
- Mobile-first dad app, desktop admin

## Current locks (2026-11-19)

- **Factory metaphor only** for everyone. No occupation-specific language.
- **No fixed time frame** on phases. Clients progress at their own speed.
- **Phase 1 ketone baseline**: as many readings as they like on current diet. Every log captures time since last meal and time taken.
- Education and advice only. Not treatment, not a prescription, not a diagnosis. GP owns medicine.
- Profile / scan is a hard gate into later phases.

## What this build includes

Dad flow

1. Login: the lockup, the slogan, LOG IN or REGISTER, and the country plate
2. Start your reset: height, weight. Nothing else required.
3. My body: the phase picker, then Phase 1's kit, bloods, scan and lessons
4. Your factory (parametric silhouette from scan numbers)
5. Body scan entry
6. Phase 1 videos: an intro on My body, then a lesson behind every one of the kit plates
7. Tabs: Videos · Ketones · My body · Macros · Account (Shop opens from Account and My body)

## Phase 1 videos

Every kit plate on My body has a lesson behind it. The files live in `assets/`.

## Ketones

Phase 1: log as many readings as you like. Each entry records:
- mmol/L
- Hours since last meal
- Time taken

That gives a clear starting picture before Phase 2.

## Grok API (scaffold)

See `docs/grok-api.md` for the structure to:
- Generate AI body visualizations from scan numbers
- Explain ketone readings in pure factory language
- Support metabolic flexibility teaching

## Product docs

See `docs/master-map.md`, `docs/app-build-status.md`, `docs/feature-backlog.md`, `docs/grok-api.md`.

React source is in `src/`. The live app can be the root static files or a Vite build.
