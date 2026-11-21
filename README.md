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
