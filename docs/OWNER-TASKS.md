# Owner task list (things only the owner can do)

Claude works on its own and skips anything that needs the owner or an outside service; those items are kept here
and given to the owner together when asked. Newest status: 5 Nov 2026.

| # | Task | Why it needs the owner | Status |
|---|---|---|---|
| 1 | Tap the "Amcolink test alert" on the phone and say which screen opened | real phone | open |
| 2 | Optional, paid: `ANTHROPIC_API_KEY` on Render (turns on the AI photo helper, #3). Also say whether the website's AI button should be green | paid service, Render settings | open |
| 3 | Turn on #2 phone alerts and #5 Wanted alerts on **production** (same steps as staging: Wanted SQL, `push` function, 2 secrets, webhook) — recommended only when the store app is ready | production database/settings | waiting (store app) |
| 4 | "deploy" for the website branch `wanted-alerts` (megaphone icon for Wanted alerts in the bell inbox) — only useful after task 3 | live website | waiting (task 3) |
| 5 | Staging SQL so "Create seller profile" works on staging (address rule difference, decision D-4) | runs SQL | open (SQL to be given) |
| 6 | Google Play: developer account (one-time fee) and store listing approval | purchase, account | later |
| 7 | Optional: delete the leftover GitHub branch `hold-status-fix` (GitHub → Branches → bin icon) | GitHub refuses deletes from Claude | open |
