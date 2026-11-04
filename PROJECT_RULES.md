# Amcolink mobile — project rules (read first)

1. Pictures first: show the screen before building; build only after the owner says "go".
2. Nothing goes to the stores or to real users without the owner's explicit approval.
3. Test builds use STAGING only. Never point a test build at production.
4. Never put secret keys, service_role keys or passwords in code, settings or chat.
5. Admin Dashboard stays on the website only. No admin screens, routes or admin calls in this app.
6. No payments, checkout, escrow or delivery.
7. The website is the source of truth: copy its categories, wording and rules; shared logic copied from the
   website keeps a note of the website commit it came from.
8. Design: simple, premium, phone first, Amcolink green only, Outfit font. Every colour and size comes from
   `src/theme/tokens.ts`; screens use the shared components only (`npm run check:design` enforces colours).
9. Database changes are never made from this repo. They go through the website repo as SQL the owner runs.
10. Work on branches; main is updated only with the owner's approval.
