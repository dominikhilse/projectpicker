# projectpicker

Public overview page, hosting different prototypes, playtest builds and MVPs of several projects.

A plain static page (HTML/CSS/vanilla JS, no build step) that lists side projects, grouped by
status, each linking out to its own live deployment. The whole list is driven by
[`manifest.json`](manifest.json) — edit that file to add, remove, or re-categorize a project, no
other file needs to change.

## Editing the list

Each entry in `manifest.json` looks like:

```json
{
  "id": "flip",
  "name": "Flip the Number",
  "status": "wip",
  "type": "web-demo",
  "url": "https://flip.artkayenoem.workers.dev/",
  "thumbnail": "thumbs/flip.png",
  "summary": "One-line description shown on the card.",
  "note": "Optional caveat, only shown in the WIP detail view."
}
```

- `status`: one of `mvp`, `playable`, `wip`, `archived`. Controls which section the project
  appears in and how clicking it behaves (`mvp`/`playable` open the demo directly, `wip` opens a
  detail view first, `archived` is greyed out and not clickable).
- `type`: `web-demo` or `external-link`.
- `thumbnail`: path to an image under `thumbs/`. If the file doesn't exist yet, a placeholder
  tile with the project's initial is shown instead — that's expected, not a bug.

## Deploying

Served via GitHub Pages from the `main` branch, root folder (configured manually in the repo's
Settings). No build step, no dependencies.

**Note on caching:** after editing `manifest.json`, it can take a few minutes for GitHub
Pages/its CDN to serve the updated file. If a change doesn't show up immediately, that's usually
just caching — try a hard refresh or wait a bit before assuming something's broken.
