# UndeMananc Product Roadmap

## What is implemented in this prototype

- Restaurant discovery with category, quick filters, price filter, and sorting.
- List and map-style views using restaurant coordinates.
- Daily menu/offers surfaced on cards and detail pages.
- Email/password and Google authentication.
- Favorites, reviews, profile settings, and account deletion.
- Restaurant owner panel for publishing a restaurant and daily menu.
- Firebase Storage helper for restaurant photos.
- Baseline Firestore and Storage security rules.

## What still needs production work

- Deploy with Firebase Hosting or a web framework build pipeline.
- Add real Firestore indexes after production query patterns settle.
- Replace prototype owner permissions with verified restaurant claims.
- Add moderation for reviews and uploaded images.
- Add analytics events for views, calls, route clicks, searches, and saves.
- Add server-side Cloud Functions for notifications and denormalized counters.
- Add proper map tiles with Google Maps, Mapbox, or Leaflet.
- Build a separate admin dashboard for staff operations.
- Add restaurant onboarding, claim requests, and billing.

## Suggested business wedge

Start with daily lunch menus in Satu Mare. Onboard 10 real restaurants manually, keep their offers fresh for two weeks, and measure whether users come back around lunch time.
