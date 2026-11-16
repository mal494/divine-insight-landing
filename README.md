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
| `core.version` | Record of the intended Core pin. `app.js` does not read this file |

## Card data

The fetch URL is hardcoded in `app.js`. `core.version` is a separate note of the intended pin; editing that file leaves the draw on the old URL. Move `CORE_VERSION` and the dataset filename inside `CORE_URL` together:

```js
var CORE_VERSION = "v1.6.1";
var CORE_URL = "https://raw.githubusercontent.com/mal494/divine-insight-core/" +
  CORE_VERSION + "/data/tarot_data_v1.6.1.json";
```

`loadFullDeck` keeps the response when it is OK and at least 78 cards have a name and an upright description. A failed fetch, a shorter file, or opening `index.html` via `file://` (the browser blocks that `fetch`) uses `FALLBACK_DECK`: eight major-arcana teasers in `app.js`.

Each dealt card keeps three upright keywords, truncates upright and reversed text to 150 characters, and is reversed when `Math.random() < 0.28`.

## Customizing

- **Card demo data** — the draw pulls live from Core; the `FALLBACK_DECK` array at the top of `app.js` is only the offline teaser.
- **Colors** are CSS variables in `:root` in `styles.css` (`--gold`, `--violet`, `--bg`, …).
- **Branch links** are in the `#branches` section of `index.html`.
