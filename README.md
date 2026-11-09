# Plus One Caps — Storefront

Next.js 16 (App Router) + Tailwind 4 + framer-motion. Hat-first custom headwear storefront.

## Run locally

```bash
# 1. API (separate terminal)
cd ../backend && npm install && npm run seed && npm run dev   # :4001

# 2. Storefront
cd frontend
npm install
cp .env.example .env.local      # already created for local dev
npm run dev                     # http://localhost:3000
```

If the API is down, `/shop`, `/order`, and the homepage fall back to a small built-in hat catalog
so pages still render (orders will fail to submit until the API is up).

## Routes

| Route | Purpose |
| --- | --- |
| `/` | Hero, how it works, decoration, featured hats, why Plus One, final CTA |
| `/order` | 5-step order wizard (`?hat=<slug>` preselects a hat, `?method=<id>` preselects decoration) |
| `/shop`, `/shop/[slug]` | Browse hats / hat detail (`/products/[slug]` redirects) |
| `/collections/[slug]` | Collections from the catalog API |
| `/process`, `/about`, `/contact`, `/privacy`, `/terms` | Content pages |

Legacy Plus One Promo routes (`/apparel`, `/quote`, `/order-request`, `/services`, `/account`) redirect — see `next.config.ts`.

## API contract used

- `GET /api/products?published=true`, `GET /api/products/:slug`
- `GET /api/collections/homepage`, `GET /api/collections/slug/:slug`
- `GET /api/settings/decoration`
- `POST /api/uploads/artwork` (base64 JSON)
- `POST /api/order-requests`
