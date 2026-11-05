# Owner task list (things only the owner can do)

Claude works on its own and skips anything that needs the owner or an outside service; those items are kept here
and given to the owner together when asked. Updated: 5 Nov 2026, evening.

| # | Task | Why it needs the owner | Status |
|---|---|---|---|
| 1 | Optional, paid: `ANTHROPIC_API_KEY` on Render (turns on the AI photo helper, #3). Also say whether the website's AI button should be green | paid service, Render settings | open |
| 2 | Staging SQL so "Create seller profile" works on staging (address rule difference, decision D-4) | runs SQL | open (SQL given when asked) |
| 3 | Turn on phone alerts (#2) and Wanted alerts (#5) on **production** — same steps as staging (Wanted SQL, `push` function, 2 secrets, webhook) — then "deploy" the website branch `wanted-alerts` (megaphone icon) | production database/settings, live website | waiting (store app) |
| 4 | Google Play: developer account (one-time fee) and the release signing key (created on the owner's side) | purchase, account, key | later |
| 6 | Release settings in GitHub (production publishable key, Turnstile site key, permanent security page, upload key) — exact steps in `docs/RELEASE.md` | keys and accounts are the owner's | later |
| 7 | Approve the store text and Data safety answers in `docs/STORE-LISTING.md`; "go" + "deploy" for the privacy page additions listed there | owner decision, live website | open |
| 8 | After the first Play upload: copy the app-signing SHA-256 fingerprint (public) from Play Console → App integrity, so amcolink.com links open in the app — then "deploy" the website file (`docs/APP-LINKS.md`) | Play Console, live website | later |
| 5 | Optional: delete the leftover GitHub branch `hold-status-fix` (GitHub → Branches → bin icon) | GitHub refuses deletes from Claude | open |

Done today: Cloudflare purge · Wanted alerts on staging · Firebase project + `GOOGLE_SERVICES` secret · Supabase `push` function, secrets and webhook on staging · real phone alert received · Status share and Forgot password checked on the phone · app ID `com.amcolink.app` confirmed · Explore layout A chosen.
