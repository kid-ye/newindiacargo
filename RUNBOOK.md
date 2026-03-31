# New India Cargo - Runbook

This document details the standard operating procedures, architectural overview, and commands required to set up, run, and maintain the New India Cargo web application.

## 1. Project Overview

The project is a full-stack web application.

- **Frontend:** React SPA built with Vite.
- **Backend:** Node.js / Express API (`server.js`).
- **Database:** SQLite (`users.db`) using `better-sqlite3`.
- **Authentication:** Custom JWT authentication & Google OAuth.

## 2. Prerequisites

Before you can run the project, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- Optional: DB Browser for SQLite (for inspecting the local `users.db` file)

### Environment Variables (.env)

You must create a `.env` file in the root directory for the backend to function securely:

```env
PORT=3001
JWT_SECRET=your_super_secret_jwt_key
GOOGLE_CLIENT_ID=your_google_oauth_client_id
ADMIN_EMAIL=admin@example.com
```

_Note: If `ADMIN_EMAIL` matches a registered user's email, that user will be automatically assigned the `admin` role upon server start._

## 3. Installation

1. Open your terminal in the project root (`c:\Users\yeezy\Desktop\newindiacargo`).
2. Install the shared and frontend dependencies (defined in `package.json`):
   ```bash
   npm install
   ```

## 4. Running the Application

For local development, you need to run both the frontend and backend servers.

### Start the Backend Server (Express/SQLite)

The backend API runs on port 3001 by default.

```bash
node server.js
```

### Start the Frontend Server (Vite)

Open a new terminal window/tab in the same directory and start the Vite development server:

```bash
npm run dev
```

The React app will typically be available at `http://localhost:5173`.

## 5. Testing

The application uses Vitest for frontend component testing.

- **Run all tests once:**
  ```bash
  npm run test
  ```
- **Run tests in watch mode (ideal for active development):**
  ```bash
  npm run test:watch
  ```

## 6. Database Management

The application uses a lightweight local SQLite database stored in the `users.db` file at the root.

- **Initialization:** The tables (`users` and `orders`) apply schema patches and create themselves automatically when `server.js` is started.
- **Reset/Wipe Data:** To completely reset the database, simply stop the server, delete the `users.db` file, and restart the server.
- **Migration:** Schema extensions (like adding columns) are currently handled automatically via `TRY...CATCH` execution in `server.js`.

## 7. Troubleshooting

### Port Conflicts

**Error:** `EADDRINUSE: address already in use :::3001` or `5173`.
**Fix:** Stop whatever is listening on that port or change the default port. Note that the frontend expects the backend to be at port 3001, so updating the port requires updating `src/api.js` or `src/config.js` on the frontend as well.

### Google Login Failing

**Fix:** Check if your `GOOGLE_CLIENT_ID` in the `.env` file is valid and configured with your frontend URL (`http://localhost:5173`) in your Google Cloud Console "Authorized JavaScript origins".

### "Database Locked" Errors (SQLite)

**Fix:** SQLite locks the database file on write. Ensure you do not have multiple Node backend instances running at the same time or an external tool concurrently editing it.
