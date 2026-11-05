# Google Play store listing pack (draft for the owner to approve)

## Main details
- **App name (30):** Amcolink — Buy & Sell Locally
- **Short description (80):** Find items, services and houses near you. Contact sellers on WhatsApp or call.
- **Category:** Shopping · **Tags:** marketplace, classifieds, local shopping
- **Contact email:** info@amcolink.com · **Website:** https://amcolink.com · **Privacy policy:** https://amcolink.com/privacy
- **Countries:** start with Kenya, Somalia, Ethiopia, Uganda, Tanzania, Rwanda, Djibouti (East Africa first, like the website)
- **Content rating:** answer the questionnaire as a marketplace with user-generated listings (no violence etc.); expect "Everyone" / "Teen" depending on Google's answers about user content.

## Full description (≤ 4000)
Amcolink is the simple way to buy and sell in your town.

• Browse phones, electronics, home items, fashion, beauty, vehicles, food and farming, building tools, services and property.
• Near me: see the closest items and shops first.
• Contact the seller directly — WhatsApp or call. No middleman, no fees for buyers.
• Save items and get a phone alert when the price drops. Save a search and get an alert when something new matches.
• Wanted: post what you need and let sellers come to you.
• Sellers: post an ad from your phone in a minute, mark items Reserved or Sold, see your views and contacts, pin your best items, share any ad to your WhatsApp Status.
• Trust: verified sellers, reviews, a trust score and a reminder to never pay in advance.

Amcolink does not handle payments. Meet the seller, check the item, then pay.

## Data safety form — answers (match what the app really does)
| Data type | Collected? | Shared? | Required? | Why |
|---|---|---|---|---|
| Email address | Yes | No | Required for an account (browsing needs none) | Account, sign-in, account emails |
| Name, phone number (sellers) | Yes | Shown publicly on the seller's profile by the seller's choice | Required for sellers only | Buyers contact the seller |
| Photos (listings, logo, cover) | Yes | Shown publicly | Required to post an ad | The listing |
| Approximate location | Yes — when you tap Near me (rounded ~0.5 km, used for that search only, not stored); and the seller's optional shop location (rounded, never shown) | No | Optional | Near me |
| App interactions (views, WhatsApp taps, calls, shares) | Yes | No | — | Seller statistics, trust score, abuse prevention |
| Device or other IDs (phone alert token) | Yes, if alerts are allowed | No (delivered through Google Firebase) | Optional | Phone alerts |
| Messages, contacts, payment info, health, files | No | — | — | — |

- Data is encrypted in transit: **Yes**. · Users can ask for deletion: **Yes** — in the app (Account → Delete my account) and on the website.
- **Account deletion URL** (Google asks for one): https://amcolink.com/account (sign in → Delete account).

## Screenshots (phone, 1080×2400; from the emulator runs on branch `ci-results`)
Home · a listing (with Share to WhatsApp Status) · Explore · Near me · profile page · Post Ad · Saved with price drop · Property filters. Take the final set from the release build (production data), not staging "[TEST]" listings.

## Privacy page additions the website still needs (website change — needs your "go" and "deploy")
1. **The Android app**: your sign-in is kept in the phone's encrypted storage; the app uses the camera and photos only when you add a photo; location only when you tap Near me or set your shop's location.
2. **Phone alerts**: if you allow them, we store a phone token to send your alerts (price drops, saved searches, your ads, Wanted matches); delivered through Google Firebase Cloud Messaging; turned off by switching off notifications or signing out.
3. Providers list: add **Google Firebase** (phone alerts).
