# Old Red Chisel — website & shop

Website and online shop for Old Red Chisel Home Improvements (Athlone, Ireland): handmade joinery shop, bespoke kitchens and wardrobes, and building & renovation services.

Plan and decisions: [`docs/PLAN.md`](docs/PLAN.md) · Logo and brand colours: [`assets/brand/README.md`](assets/brand/README.md)

## Run locally

```bash
npm install
npm run dev      # http://localhost:3000
npm run build    # production build
npm run lint
```

## Structure

| Path | What it is |
|---|---|
| `src/app/` | Pages (Next.js App Router): home, shop, product, bespoke, build & renovate, projects, quote, cart, contact, delivery, legal |
| `src/components/` | Header, footer, logo, product buy box, quote form, shared sections |
| `src/lib/site.ts` | Company details (phone, email, service area, survey fee) |
| `src/lib/catalog.ts` | Shop products and categories (sample data for now) |
| `src/lib/services.ts` | Bespoke and building services |
| `src/lib/delivery.ts` | Delivery zones and prices |
| `public/brand/` | Logo files |

## Orders, payments and admin

- **Checkout** (`/checkout`): no customer accounts. Prices are recalculated on the server; card payment uses Stripe's Payment Element styled to match the site.
- After payment the customer gets an **order number and password** on screen and by email, and uses them at **`/track`** to follow the order.
- **Admin panel**: served only at the secret `ADMIN_PATH` (rewritten in `src/proxy.ts`); the internal route answers 404. Sign-in needs password + authenticator code.
- Data lives in Postgres (Neon in production, embedded PGlite in `.data/` locally).

Setup of the services and environment variables: [`docs/SETUP.md`](docs/SETUP.md) and [`.env.example`](.env.example).

## Status

- **Payments, email, database**: code complete; need Stripe, Resend and Neon connected in Vercel (see setup). Until then the site shows "online payment opens soon"; a simulated payment button exists only in local development.
- **Quote requests**: validated and logged on the server only; saving and emailing them is next.
- **Products**: still in `src/lib/catalog.ts`; editing them from the admin panel is next.
- **Content**: products, prices and contact details are placeholders (marked `TODO`); photos are wood-texture placeholders.
