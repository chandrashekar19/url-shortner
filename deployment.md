# Kutt URL Shortener - Deployment Guide

This guide provides instructions for deploying Kutt in a production environment.

## 📦 Prerequisites
- **Node.js:** v20+ 
- **Database:** PostgreSQL or MySQL (SQLite NOT recommended for High Traffic)
- **Redis:** Recommended for caching and rate limiting.
- **Domain:** A domain for your shortener (e.g., `k.it`).

---

## 🚀 1. Manual Deployment (Bare Metal / VPS)

### **Step 1: Clone and Install**
```bash
git clone https://github.com/thedevs-network/kutt.git
cd kutt
npm install
cd client && npm install && npm run build
```

### **Step 2: Configuration**
Create a `.env` file in the root based on `.env.example`:
```env
# Server
PORT=3000
SITE_NAME=Kutt
DEFAULT_DOMAIN=yourdomain.com
JWT_SECRET=generate-a-long-random-string

# Database (PostgreSQL example)
DB_CLIENT=pg
DB_HOST=localhost
DB_PORT=5432
DB_NAME=kutt
DB_USER=postgres
DB_PASSWORD=your_password

# Redis (Highly Recommended)
REDIS_ENABLED=true
REDIS_HOST=127.0.0.1
REDIS_PORT=6379

# Permissions
DISALLOW_REGISTRATION=true
DISALLOW_ANONYMOUS_LINKS=true
```

### **Step 3: Run Migrations**
```bash
npx knex migrate:latest
```

### **Step 4: Process Management (PM2)**
It's recommended to use PM2 to keep the server running:
```bash
npm install -g pm2
pm2 start server/server.js --name kutt-api -- --production
```

---

## 🐳 2. Docker Deployment (Recommended)

Kutt provides a `docker-compose.yml` for quick setup.

### **Quick Start**
1. Update `docker-compose.yml` with your environment variables.
2. Run:
```bash
docker-compose up -d
```

This will spin up:
- The Kutt API server.
- The PostgreSQL database.
- A Redis instance.

---

## 🛡️ 3. Security Recommendations

### **Reverse Proxy (Nginx)**
Always run Kutt behind a reverse proxy like Nginx or Caddy to handle SSL (HTTPS) and static file serving.

**Example Nginx Config:**
```nginx
server {
    listen 80;
    server_name k.it;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### **SSL (Let's Encrypt)**
Use `certbot` to secure your shortener:
```bash
sudo certbot --nginx -d yourdomain.com
```

### **Environment Safety**
- Ensure `ENABLE_RATE_LIMIT=true` in production.
- Use a strong `JWT_SECRET`.
- Restrict `CLIENT_URL` to your specific frontend domain.

---

## 🛠️ 4. Maintenance
- **Backups:** Regularly backup your SQL database.
- **Updates:** Pull the latest changes from the repository and run `npm run migrate` to apply schema updates.
