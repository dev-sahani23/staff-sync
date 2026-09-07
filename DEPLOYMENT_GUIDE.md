# StaffSync Complete Cloud Deployment Guide

This guide walks you through deploying **StaffSync** (PostgreSQL Database, Node/Express Backend, and React Vite Frontend) to the cloud for free using:
- **Database**: [Neon](https://neon.tech) or [Supabase](https://supabase.com) (Serverless PostgreSQL)
- **Backend**: [Render](https://render.com) or [Railway](https://railway.app)
- **Frontend**: [Vercel](https://vercel.com) or [Netlify](https://netlify.com)

---

## Step 1: Set Up Cloud PostgreSQL Database (Neon or Supabase)

Your local PostgreSQL on `localhost:5432` cannot be reached directly by cloud servers. We recommend creating a free cloud PostgreSQL instance on **Neon** (simplest) or **Supabase**:

### Option A: Neon (Recommended, 2 minutes)
1. Go to [Neon.tech](https://neon.tech) and sign up / log in with GitHub.
2. Create a new project named `staff-sync`.
3. Copy your **Connection Details** / `DATABASE_URL` string. It will look like:
   ```text
   postgresql://username:password@ep-cool-fog-123456.us-east-2.aws.neon.tech/neondb?sslmode=require
   ```

### Migrate and Seed the Cloud Database:
On your local machine, run the following in `backend/` using your new cloud connection string:
```bash
cd backend
# Temporarily test or push schema to cloud DB:
npx prisma db push
# Seed the initial administrative users, salary rules, contracts & sample data:
npm run db:seed
```
*(Tip: Update `backend/.env` with your new `DATABASE_URL` during this step).*

---

## Step 2: Deploy the Backend to Render

1. Go to [Render Dashboard](https://dashboard.render.com/) and click **New +** -> **Web Service**.
2. Connect your GitHub repository: `https://github.com/dev-sahani23/staff-sync`.
3. Configure the service settings:
   - **Name**: `staff-sync-backend`
   - **Root Directory**: `backend`
   - **Runtime**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
4. Add the following **Environment Variables**:
   | Key | Value | Note |
   |---|---|---|
   | `DATABASE_URL` | `postgresql://username:password@hostname/dbname?sslmode=require` | Your Neon/Supabase connection string |
   | `JWT_SECRET` | `a-strong-random-secret-key-string` | Used to sign auth tokens |
   | `NODE_ENV` | `production` | Production mode |
5. Click **Deploy Web Service**.
6. Once deployed, Render will provide your public backend URL, e.g.:
   `https://staff-sync-backend.onrender.com`
   Test it in your browser: `https://staff-sync-backend.onrender.com/api/health` should return `{"status":"ok"}`.

---

## Step 3: Deploy the Frontend to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New** -> **Project**.
2. Select your repository: `staff-sync`.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: Click "Edit" and choose `frontend`
   - **Build Command**: `npm run build` (or leave default)
   - **Output Directory**: `dist` (default)
4. Add the **Environment Variable**:
   | Key | Value |
   |---|---|
   | `VITE_API_URL` | `https://staff-sync-backend.onrender.com/api` |
   *(Replace with your actual Render backend URL followed by `/api`)*
5. Click **Deploy**.
6. Once deployment finishes, Vercel will give you a live URL, e.g. `https://staff-sync.vercel.app`.

---

## Summary of Configured Files

- **`backend/package.json`**:
  - `npm run build` -> `prisma generate`
  - `npm start` -> `tsx src/index.ts`
  - `npm run db:push` & `npm run db:seed`
  - `prisma` and `tsx` moved to dependencies so cloud Node runners have them in production.
- **`backend/src/routes/index.ts` & `backend/src/index.ts`**:
  - Added root `/` and `/api/health` healthcheck endpoints for cloud uptime monitoring.
- **`frontend/vercel.json`**:
  - Handles client-side SPA routing (`react-router-dom`) so page refresh on nested routes works.
- **`frontend/src/lib/apiClient.ts`, `api.ts`, `payslips.ts`**:
  - Standardized to automatically read `VITE_API_URL` or `VITE_API_BASE_URL` with fallback to localhost.
