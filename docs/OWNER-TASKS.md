# Owner task list (things only the owner can do)

Claude works on its own and skips anything that needs the owner or an outside service; those items are kept here
and given to the owner together when asked. Updated: 5 Nov 2026, 20:19.

## To do (owner said: tomorrow)
| # | Task | Why it needs the owner |
|---|---|---|
| 1 | Staging SQL so "Create seller profile" works in the test app: `drop trigger if exists shops_location_words on public.shops;` on **staging** only, then try creating a profile in the app | runs SQL |
| 2 | Privacy page: add the app's lines (phone storage of sign-in, camera/photos, location for Near me, phone alerts, Google Firebase) — text in `docs/STORE-LISTING.md`; needs "go" + "deploy" | live website |
| 3 | Optional: delete the leftover GitHub branch `hold-status-fix` (GitHub → Branches → bin icon) | GitHub refuses deletes from Claude |

## Postponed by the owner (Google Play and paid items)
| Task | Notes |
|---|---|
| AI photo helper: `ANTHROPIC_API_KEY` on Render (paid) + green or violet website button | turns on #3 |
| Google Play developer account (one-time fee) | needed to publish |
| Release settings in GitHub (upload key, production publishable key, Turnstile site key, permanent security page) | steps in `docs/RELEASE.md` |
| Phone alerts + Wanted alerts on production, then "deploy" the website branch `wanted-alerts` | when the store app is ready |
| After the first Play upload: the public app-signing fingerprint for App Links, then "deploy" the website file | `docs/APP-LINKS.md` |

Done 5 Nov: Cloudflare purge · Wanted alerts on staging · Firebase project + `GOOGLE_SERVICES` secret · Supabase `push` function, secrets and webhook on staging · real phone alert received · Status share and Forgot password checked on the phone · app ID `com.amcolink.app` confirmed · Explore layout A chosen.
