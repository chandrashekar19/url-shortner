# 🚀 URL Shortener (Kutt-Based Custom Setup)

A modern, self-hosted **URL Shortener** built with **Node.js (Express)**, **React + Vite**, and **PostgreSQL / SQLite**.  
It supports custom domains, secure authentication, and link management — all through a clean web interface.

---

## 🧩 Features

- 🔗 Shorten URLs with custom aliases  
- 👥 User authentication (Signup / Login)  
- 🧰 Admin dashboard to manage users, domains, and links  
- 📊 View statistics for each short link  
- 🌍 Supports PostgreSQL, MySQL, or SQLite  
- ⚡ Frontend built with React + Vite + TypeScript  
- 🐳 Docker support for one-command setup  
- 🔒 JWT-based authentication  

---
## ⚙️ Environment Setup

### 🔸 Backend (`server/.kutt.env`)
Example:
```env
PORT=3000
SITE_NAME=URL Shortener
DEFAULT_DOMAIN=localhost:3000
DB_CLIENT=pg
DB_HOST=postgres
DB_PORT=5432
DB_NAME=kutt
DB_USER=postgres
DB_PASSWORD=yourpassword
JWT_SECRET=supersecurekey
REDIS_ENABLED=false
DISALLOW_ANONYMOUS_LINKS=false
DISALLOW_REGISTRATION=false
🔸 Frontend (client/.env)
env
Copy code
VITE_API_BASE_URL=http://localhost:3000/api/v2
🐳 Run with Docker
You can start the entire setup using Docker Compose.

bash
Copy code
docker compose up
This will start:

🧠 server → Node.js backend

🗄️ postgres or sqlite (depending on compose file)

🧰 redis (optional caching layer)

Visit the app at 👉 http://localhost:3000

🧠 Development Setup (Manual)
If you prefer to run manually instead of Docker:

1️⃣ Backend
bash
Copy code
cd server
npm install
npm run migrate
npm run dev
2️⃣ Frontend
bash
Copy code
cd client
npm install
npm run dev
Frontend runs on http://localhost:5173
Backend runs on http://localhost:3000

🧾 API Reference
The backend exposes RESTful APIs under:

bash
Copy code
/api/v2
Example routes:

Method	Endpoint	Description
POST	/auth/signup	Register a new user
POST	/auth/login	Login and get token
POST	/links	Create a short link
GET	/links	Get all user links
DELETE	/links/:id	Delete a link

Use the JWT token returned during login in Authorization headers.

🧑‍💻 Development Notes
Backend environment file must be named .kutt.env (inside server/).

Frontend .env must stay in the client/ root folder.

custom/ folder (optional) can override backend styles or images if needed.

API base URL for frontend is configured via VITE_API_BASE_URL.

Use npm run migrate to initialize or update database tables.

Example URLs
Component	URL
Frontend	http://localhost:5173
Backend	http://localhost:3000/api/v2
Health Check	http://localhost:3000/health

🧰 Tech Stack
Layer	Tech
Frontend	React, TypeScript, Vite, Axios
Backend	Node.js, Express, Knex.js
Database	PostgreSQL / SQLite
Cache	Redis (optional)
Auth	JWT
Deployment	Docker Compose

🧑‍🤝‍🧑 Author
Built and customized by Chandrashekar Kalal
Based on the open-source Kutt project.


###  Instructions

1. Create a new file in your project root (same level as `docker-compose.yml`):  
touch README.md

sql
Copy code
2. Paste the entire content above into it.
3. Commit it to your repository:
```bash
git add README.md
git commit -m "Add project documentation"
