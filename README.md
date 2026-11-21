# 🦒 Resource Savanna

A JSON-driven link directory — categories act as filters, links carry descriptions.
Visual language (dark "savanna dusk" palette, ochre/terracotta accents, Fraunces display
serif, emoji-badged chips, glassy beacon cards) adapted from [www.mantics.eu](https://www.mantics.eu).

## Run it

The site fetches `data.json`, so serve it over HTTP:

```bash
python3 -m http.server 8000
# open http://localhost:8000
```

(Opening `index.html` directly via `file://` will show a friendly hint to start a server.)

## Files

| File         | Purpose                                            |
| ------------ | -------------------------------------------------- |
| `index.html` | Page shell: hero, category overview, filter toolbar |
| `styles.css` | Mantics-inspired savanna theme (CSS variables)      |
| `app.js`     | Fetches JSON, renders filters, overview and cards   |
| `data.json`  | **The only file you edit to manage content**        |

## Editing content (`data.json`)

**Categories** (act as filters; each also becomes a card in the "Herds" overview):

```json
{
  "id": "dev-tools",
  "name": "Dev Tools",
  "icon": "🛠️",
  "color": "#c96f4a",
  "description": "Editors, pipelines and infrastructure."
}
```

**Links** (grouped by `category`, shown as beacon cards with tags):

```json
{
  "title": "Docker",
  "category": "dev-tools",
  "description": "Sovereign, reproducible containers.",
  "url": "https://www.docker.com",
  "tags": ["containers", "devops"]
}
```

- `id` ↔ `category` must match; every `link.category` must exist in `categories`.
- Each category's `color` drives that herd's badge, card glow and active filter chip.
- `site.brand` and `site.searchPlaceholder` are read from JSON too.
