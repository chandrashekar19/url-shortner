# 🚀 Kutt URL Shortener - Deployment Guide

## Overview
This app has two parts requiring different hosting:
- **Frontend (React)** → Vercel, Netlify, or Cloudflare Pages
- **Backend (Node.js + SQLite)** → Railway, Render, or Fly.io

---

## Option 1: Recommended Stack (Free Tier)

### Backend → Railway (Free)
1. Go to [railway.app](https://railway.app)
2. Connect your GitHub repo
3. Railway will auto-detect the Node.js app
4. Add environment variables:
   ```
   PORT=3000
   JWT_SECRET=your-super-secret-key-here
   DB_FILENAME=db/data.sqlite
   CLIENT_URL=https://your-frontend.vercel.app
   ```
5. Deploy! Railway gives you a URL like: `https://kutt-backend.up.railway.app`

### Frontend → Vercel (Free)
1. Go to [vercel.com](https://vercel.com)
2. Import your repo
3. Set:
   - **Root Directory:** `client`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
4. Add environment variable:
   ```
   VITE_API_BASE_URL=https://kutt-backend.up.railway.app/api
   ```
5. Deploy!

---

## Option 2: All-in-One on Railway

Deploy the entire app (frontend + backend) on Railway:

1. Build the frontend first:
   ```bash
   cd client && npm run build
   ```
2. The server already serves static files from `client/dist`
3. Deploy to Railway with these env vars:
   ```
   PORT=3000
   JWT_SECRET=your-secret
   DB_FILENAME=db/data.sqlite
   NODE_ENV=production
   ```

---

## Option 3: Docker (VPS/Cloud)

Use the existing `Dockerfile` and `docker-compose.yml`:

```bash
docker compose up -d
```

Works on: DigitalOcean, AWS EC2, Google Cloud, Linode, etc.

---

## Environment Variables Reference

| Variable | Description | Example |
|----------|-------------|---------|
| `PORT` | Server port | `3000` |
| `JWT_SECRET` | Secret for signing tokens | `my-super-secret-key` |
| `DB_FILENAME` | SQLite database path | `db/data.sqlite` |
| `CLIENT_URL` | Frontend URL (for CORS) | `https://kutt.vercel.app` |
| `VITE_API_BASE_URL` | Backend API URL (frontend) | `https://api.kutt.com/api` |

---

## Post-Deployment Checklist

- [ ] Update `CLIENT_URL` in backend to match your frontend domain
- [ ] Update `VITE_API_BASE_URL` in frontend to match your backend domain
- [ ] Test signup, login, and link creation
- [ ] Set up a custom domain (optional)
