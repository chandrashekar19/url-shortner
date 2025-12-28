# 🏗️ Kutt Core v2 - Technical Data Flow

This document outlines the high-level architecture and data flow of the refactored Kutt application.

---

## 🏛️ 1. Modernized Architecture (Vertical Slice)

Unlike traditional layered architectures (Routes/Handlers/Queries), this project uses **Vertical Slicing**. Each feature is 100% self-contained within its own folder in `server/modules/`.

### Folder structure:
- `server/modules/links/`: Everything related to URL shortening.
- `server/modules/auth/`: Everything related to User Identity.
- `server/db/`: Global database connection using **Drizzle ORM**.

---

## 👤 2. Authentication Flow

Kutt uses a multi-layered security approach for user identity.

1.  **Request Initiation:** The client sends a JWT in the `Authorization` header or a cookie.
2.  **Passport Strategy:** `server/passport.js` interceptor uses Drizzle to verify the user exists in SQLite.
3.  **Role Verification:** Roles (`USER` or `ADMIN`) are attached to `req.user`.

---

## 🔗 3. URL Shortening Flow

1.  **Creation:** 
    - Frontend sends target URL to `/api/links`.
    - **Zod** validates the URL format.
    - **nanoid** generates a unique alias.
    - **Drizzle** persists the link to SQLite.
2.  **Redirection:**
    - Visitor hits `kutt.it/alias`.
    - Backend looks up the target in SQLite.
    - Visit data is logged (async).
    - 302 Redirect to destination.

---

## 🗄️ 4. Database (Drizzle ORM)

We use **Drizzle ORM** with **SQLite** for development.
- **Why?** It provides type-safety and raw performance with almost zero setup.
- **Schema:** Defined in `server/modules/*/schema.js`.

---

## 🚦 5. Security Protocols

- **Helmet.js:** Adds secure HTTP headers (XSS, Clickjacking protection).
- **CORS:** Restricted to the `CLIENT_URL` defined in `.env`.
- **Zod Validation:** Prevents malicious payloads from reaching the database.
- **BCRYPT:** Industry standard for password hashing (12 salt rounds).

---

## 🧹 6. Maintenance (Cron)

A lean maintenance worker in `server/cron.js` runs every 30 seconds to:
- Identify links where `expire_in < current_time`.
- Permanently delete expired records from the database.
