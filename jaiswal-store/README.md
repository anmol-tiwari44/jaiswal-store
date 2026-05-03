# Jaiswal Store — Render Deployment Guide

## Prerequisites
- A free account on [render.com](https://render.com)
- A free PostgreSQL database (use [neon.tech](https://neon.tech) for free forever)
- A free account on [github.com](https://github.com)

---

## Step 1 — Set up a Free Database on Neon

1. Go to [neon.tech](https://neon.tech) and sign up free
2. Create a new project → name it `jaiswal-store`
3. Copy the **Connection String** (looks like `postgresql://user:pass@host/dbname`)
4. Keep it safe — you'll need it in Step 3

---

## Step 2 — Upload Code to GitHub

1. Go to [github.com](https://github.com) → click **New Repository**
2. Name it `jaiswal-store` → click **Create Repository**
3. Upload all files from this zip:
   - Click **uploading an existing file**
   - Drag all the files/folders from this zip (unzipped)
   - Click **Commit changes**

---

## Step 3 — Deploy on Render

1. Go to [render.com](https://render.com) → sign up with GitHub
2. Click **New** → **Web Service**
3. Connect your `jaiswal-store` GitHub repository
4. Fill in these settings:
   - **Name**: jaiswal-store
   - **Environment**: Node
   - **Build Command**: `pnpm install && pnpm --filter @workspace/jaiswal-store run build && pnpm --filter @workspace/api-server run build`
   - **Start Command**: `node artifacts/api-server/dist/index.mjs`
5. Under **Environment Variables**, add:
   - `DATABASE_URL` → paste your Neon connection string
   - `SESSION_SECRET` → type any long random text (e.g. `my_store_secret_abc123xyz`)
   - `NODE_ENV` → `production`
6. Click **Create Web Service**
7. Wait ~5 minutes for the build to complete

---

## Step 4 — Set Up the Database (One Time Only)

After the first deploy succeeds, open the **Shell** tab in Render and run:

```bash
node scripts/setup-db.mjs
```

This creates all the tables and sets up your first admin account:
- **Username**: admin
- **Password**: admin123

Then go to your live site → Admin Login → Change Credentials to set your own username and password.

---

## Your Live URL

After deploying, Render gives you a URL like:
`https://jaiswal-store.onrender.com`

Share this with anyone — it works 24/7.

---

## Important Notes

- **Free tier sleep**: Render's free web service sleeps after 15 minutes of no traffic and takes ~30 seconds to wake up on the first visit. To avoid this, upgrade to Render's Starter plan ($7/month) or use a monitoring service.
- **Image uploads**: Uploaded product images are stored on the server. On Render's free tier, the disk is not persistent — images may be lost when the service restarts. Use image URLs instead for reliability, or upload to Cloudinary.
- **Database**: Neon's free tier keeps your database forever. Render's built-in free PostgreSQL expires after 90 days.
