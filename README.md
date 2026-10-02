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

## Status

Working skeleton. Not yet connected:

- **Checkout**: the cart works in the browser; Stripe payments are next.
- **Quote requests**: validated and logged on the server only; email notification, saving and photo storage are next.
- **CMS**: products, projects and services live in `src/lib/*.ts` until the admin panel (Payload CMS) is added.
- **Content**: products, prices and contact details are placeholders (marked `TODO`); photos are wood-texture placeholders.
