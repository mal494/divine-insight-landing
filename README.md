# Divine Insight — Landing Page

The public landing page for the [Divine Insight](https://github.com/mal494/divine-insight-core) tarot platform.

A single static site — no build step, no dependencies. Just open `index.html`, or serve the folder with any static server.

## What's on the page

- **Animated hero** — twinkling starfield canvas with occasional shooting stars, drifting gradient orbs, and floating tarot cards
- **Interactive three-card draw** — Past / Present / Future spread with 3D card-flip reveals, upright/reversed orientations, and interpretations (a teaser drawn from the platform's card canon)
- **Platform branches** — Web, Mobile, Studio, and Core, linking out to the real repos
- **Animated stat counters**, scroll-reveal sections, sticky blur nav with mobile menu, and `prefers-reduced-motion` support throughout

## Deploy to GitHub Pages

1. Push this repo to GitHub (it's designed to live at `mal494/divine-insight-landing`)
2. Go to **Settings → Pages**
3. Under **Build and deployment**, choose **Deploy from a branch**, then `main` / `/ (root)`
4. The site goes live at `https://mal494.github.io/divine-insight-landing/`

## Files

| File | What it is |
| --- | --- |
| `index.html` | Page structure and copy |
| `styles.css` | All styling, animations, responsive layout |
| `app.js` | Starfield, reveals, counters, and the card-draw demo |
| `core.version` | Pinned Divine Insight Core release. Must match `CORE_VERSION` in `app.js` (the page does not read this file). |

## Card data

The three-card draw loads the **full 78-card canon live** from Divine Insight
Core at draw time. `loadFullDeck` in `app.js` fetches:

```text
https://raw.githubusercontent.com/mal494/divine-insight-core/<CORE_VERSION>/data/tarot_data_v1.6.1.json
```

`CORE_VERSION` is a string in `app.js` (currently `v1.6.1`). `core.version` at
the repo root records the same pin. The script never reads that file. Bump
both together, and bump the filename in `CORE_URL` if the dataset file is
renamed.

A card is kept only when it has a name and an upright description. If the
response is not OK, the JSON fails, or fewer than 78 cards survive that
filter, the draw uses `FALLBACK_DECK` (eight major-arcana teasers defined
next to `loadFullDeck`). The same fallback runs when the page is opened as a
`file://` URL, because the browser blocks that cross-origin fetch. Serve the
folder over HTTP to see the live deck.

What the demo keeps from each card: roman or arabic number, name, a suit
glyph, the first three upright keywords, and upright and reversed descriptions
truncated to 150 characters. The shuffle is `Math.random`. Each card is
reversed when `Math.random() < 0.28`.

## Customizing

- **Card demo data** — the draw pulls live from Core; `FALLBACK_DECK` in `app.js` is only the offline teaser.
- **Colors** are CSS variables in `:root` in `styles.css` (`--gold`, `--violet`, `--bg`, …).
- **Branch links** are in the `#branches` section of `index.html`.
