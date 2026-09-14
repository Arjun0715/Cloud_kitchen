# Marigold Kitchen — Cloud Kitchen Ordering Site

A full-stack ordering website for a cloud kitchen:

- **Customers** open your website link, browse the menu, pick dishes + quantity,
  and enter delivery address + phone number to place an order.
- **You** get a **text message on your phone** the instant an order comes in
  (via Twilio SMS).
- Every order and menu item is stored in **PostgreSQL**.
- A simple **`/admin`** page lets you manage the menu and see/update order status,
  protected by a password.

## Stack

- Backend: Node.js + Express + PostgreSQL (`pg`) + Twilio
- Frontend: React + Vite

## Folder structure

```
cloud-kitchen/
  backend/     ← Express API + Postgres schema
  frontend/    ← React ordering website + admin page
```

## 1. Set up PostgreSQL

Install Postgres if you don't have it, then create a database:

```bash
createdb cloud_kitchen
```

(No local Postgres? Use a free hosted one — Supabase, Railway, or Neon all
give you a connection string in a couple of minutes.)

## 2. Set up the backend

```bash
cd backend
npm install
cp .env.example .env
```

Open `.env` and fill in:
- `DATABASE_URL` — your Postgres connection string
- `TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_FROM_NUMBER` — from your
  [Twilio console](https://console.twilio.com) (free trial works for testing)
- `OWNER_PHONE_NUMBER` — **your** phone number, where order alerts get sent
- `ADMIN_PASSWORD` — a password you'll use to log into `/admin`

Then create the tables (and seed a starter menu):

```bash
npm run db:setup
```

Start the API:

```bash
npm run dev
```

It runs on **http://localhost:4000**.

## 3. Set up the frontend

In a new terminal:

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

It runs on **http://localhost:5173** — open that in your browser. That's the
link you'll eventually send to customers.

- Customer ordering page: `/`
- Admin page (menu + orders): `/admin`

## 4. Test it

1. Open `http://localhost:5173`, add a dish, fill in the delivery form, place
   an order.
2. Your phone (`OWNER_PHONE_NUMBER`) should get a text with the order details.
3. Go to `http://localhost:5173/admin`, log in with `ADMIN_PASSWORD`, and
   you'll see the order — update its status as you cook/deliver it.
4. Add, edit, or hide dishes from the **Menu** tab — changes show up on the
   customer page immediately.

## Before you go live

This is a solid MVP, but tighten these up before sharing the link publicly:

- **Admin auth**: right now `/admin` is a single shared password sent with
  every request. Fine for one owner testing locally; for anything public,
  swap in real authentication (sessions or JWT + hashed password).
- **HTTPS**: deploy both frontend and backend behind HTTPS (most hosts do
  this for you automatically).
- **Twilio number**: a trial Twilio number can only text *verified* numbers.
  Upgrade your Twilio account (a few dollars) before launch so it can text
  your real phone reliably.
- **Rate limiting**: add basic rate limiting to `/api/orders` so the order
  form can't be spammed.

## Deploying

- **Backend**: any Node host works — Render, Railway, Fly.io, a VPS. Set the
  same environment variables from `.env` there.
- **Database**: Render/Railway/Supabase/Neon all offer managed Postgres —
  point `DATABASE_URL` at it (and set `DATABASE_SSL=true`).
- **Frontend**: `npm run build` in `frontend/` produces a static `dist/`
  folder — deploy it to Vercel, Netlify, or Render Static Sites. Set
  `VITE_API_URL` there to your deployed backend's URL, e.g.
  `https://your-backend.onrender.com/api`.
- Update `FRONTEND_URL` in the backend's `.env` to your deployed frontend URL
  (needed for CORS).
// const db = new pg.Client({
//   user: process.env.PG_USER,
//   host: process.env.PG_HOST,
//   database: process.env.PG_DATABASE,
//   password: process.env.PG_PASSWORD,
//   port: process.env.PG_PORT,
// });
// db.connect();"# Cloud_kitchen" 
