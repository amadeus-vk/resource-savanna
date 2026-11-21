# 🦒 Resource Savanna

A full-width, JSON-driven link catalog — one column per category, side by side.
Toggle buttons switch each category on and off, and the search bar filters every
column at once. Visual language (savanna dusk palette, ochre/terracotta accents,
Fraunces serif, glassy cards) adapted from [www.mantics.eu](https://www.mantics.eu).

## Run it

The site fetches `catalog.json`, so serve it over HTTP:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly via `file://` will show a friendly hint to start a server.)

## Files

| File           | Purpose                                                    |
| -------------- | ---------------------------------------------------------- |
| `index.html`   | Page shell: hero, sticky toolbar, category columns          |
| `styles.css`   | Mantics-inspired savanna theme (full-width column layout)   |
| `app.js`       | Fetches `catalog.json`, renders toggles, columns and cards  |
| `catalog.json` | **The only file you edit to manage content**                |
| `src/images/`   | Ambient background layer (`Giraffe_BG.png`), wallpaper slot   |
| `src/transparant/` | Official Mantics transparent logo PNGs (icon + wordmark)    |

## Brand assets (`src/`)

The site mirrors the asset layout of **www.mantics.eu** (lowercase `transparant`,
lowercase `images`) so drop-in files resolve at runtime exactly like on the
official site. Currently present in the repo:

| File | Status | Used for |
| ---- | ------ | -------- |
| `src/images/Giraffe_BG.png` | present (2400 x 1792) | Ambient fixed background layer behind the content, slow zoom/pan like mantics.eu |
| `src/transparant/mantics-icon-logo-color-on-trans@4x.png` | to add | Compact header brand icon + favicon fallback |
| `src/transparant/mantics-text-color-on-trans@4x.png` | to add | Compact header wordmark next to the icon |
| `src/images/background.jpeg` | to add | Savanna wallpaper under the sunset gradients (page renders fine without it) |

Missing files degrade gracefully: the header falls back to a text lock-up
("Resource Savanna"), and the background blends into the savanna sunset gradient.

Other style-guide rules applied: Font Awesome for iconography, gradient text on
the main headline, primary logo links to [www.mantics.eu](https://www.mantics.eu),
and the required contact + social footer (email, phone, website, LinkedIn,
Facebook, Instagram, "Support us" pointing at `www.mantics.eu/#connect`).

## Editing content (`catalog.json`)

A flat array of links — add any object matching this shape and the page re-derives
categories, colors, counts and columns automatically:

```json
{
  "name": "Operation Scorecard",
  "url": "https://operation-scorecard.pages.dev",
  "category": "Operational Metrics / Performance Tracking",
  "description": "Dashboard for tracking key performance indicators."
}
```

- **Category columns** are derived from the `category` values (order of first appearance).
- **Toggle buttons** (top bar) switch each column on/off; "Show all / Hide all" resets.
- **Search** filters by name, description, URL or category across all columns.
- Missing `description` is fine — the card simply renders without one.
- Column colors rotate through the savanna palette by category order.
