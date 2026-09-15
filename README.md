# Martinez Corp — Content Operations (team version)

Single-page app + one Netlify Function. Shared state lives in Netlify Blobs, so
everyone with the link and the team access key works on the same calendar.

## Deploy (first time, ~3 minutes)

```bash
npm install
npx netlify login                 # opens the browser once
npx netlify link                  # pick the existing project "martinez-content-ops"
npx netlify deploy --prod
```

## Update later

Edit `public/index.html`, then `npx netlify deploy --prod`.

## Team access key

The function checks the `TEAM_KEY` environment variable (already set on the
project). People enter it once in the browser; it is remembered locally.
To rotate it: Netlify → Project → Environment variables → `TEAM_KEY`, then tell the team.

## Structure

- `public/index.html` — the app (calendar, content, production, strategy, performance, presentation mode)
- `netlify/functions/state.mts` — `GET/PUT /api/state`, optimistic version check (409 on conflict)
- `netlify.toml` — publish dir + esbuild for functions

## Notes

- Saves are explicit (Save Changes). The page polls every 20 s and on tab focus;
  if a teammate saved while you have unsaved edits, the sync indicator tells you.
- Export / Import JSON still works for backups or moving data elsewhere.
