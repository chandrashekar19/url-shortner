# 🚀 Kutt Core (Minimized & Modernized)

A streamlined, high-performance **URL Shortener** built with modern **Node.js (Vertical Slice Architecture)**, **React + Vite**, and **Drizzle ORM**. This version is refactored for simplicity, speed, and standard industry practices.

---

## 🏗️ Architecture: Vertical Slice
Unlike traditional layered architectures, this project uses **Vertical Slicing**. Each feature (Links, Auth, Users) is self-contained in its own module.
- `server/modules/links`: Routes, Logic, and SQL Schema for link management.
- `server/modules/auth`: Identity and access management.
- `server/db`: Modern database connection using **Drizzle ORM**.

---

## ⚡ Quick Start: One-Command Dev

You no longer need to manage multiple terminals. Simply run from the root:

```bash
npm install:all   # Install all dependencies (Root, Client, Server)
npm run dev       # Start Backend + Frontend + Migrations concurrently
```

- **Frontend:** [http://localhost:5173](http://localhost:5173)
- **Backend:** [http://localhost:3000](http://localhost:3000)

---

## 🛠️ Tech Stack
| Layer | Technology |
| :--- | :--- |
| **Frontend** | React 19, TypeScript, Vite, Tailwind CSS |
| **Backend** | Node.js, Express (Modular) |
| **Database** | SQLite (Better-SQLite3) + Drizzle ORM |
| **Validation** | Zod (Type-safe schemas) |
| **Security** | Passport.js, JWT, Helmet |

---

## ⚙️ Environment Configuration

### Root `.env`
```env
JWT_SECRET=your_secure_secret_key
PORT=3000
DB_FILENAME=db/data.sqlite
CLIENT_URL=http://localhost:5173
```

---

## 📁 Project Structure
```text
project-root/
├── client/          # Vite + React (TypeScript)
├── server/          # Node.js Modular Backend
│   ├── modules/     # Vertical Slices (Links, Auth, Users)
│   ├── db/          # Drizzle ORM Config
│   └── server.js    # Super-lean Bootstrapper
├── db/              # Persistent SQLite storage
├── deployment.md    # Production deployment guide
└── flow.md          # Technical data-flow documentation
```

---

## 🚀 Deployment
For production deployment instructions, including Docker and Nginx configuration, refer to [**deployment.md**](./deployment.md).

---

## 🧑‍💻 Author
**Chandrashekar Kalal**
*Refactored for Senior-Level Architectural Standards.*