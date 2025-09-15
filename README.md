# Tracker Monorepo

Entry and medicine tracking application which provides a cli-esque interface for tracking habits and medicine
consumption.

This monorepo contains both the client (React + TypeScript + Vite) and server (Node.js + Express + SQLite) for the Habit
Tracker application. It supports running as a web app and packaging as an Electron desktop app.

## Structure

- `client/` — Frontend React app (TypeScript, Vite)
    - `src/` — Main source code
        - `App.tsx` — Main app component
        - `EntryTerminal/` — Entry terminal UI
        - `Charts/` — Chart components
        - `stats/` — Stats and Table components
        - `Services/` — API service layer
        - `styles/` — CSS modules
        - `assets/` — Fonts and images
    - `public/` — Static assets
    - `package.json` — Client dependencies and scripts
    - `vite.config.ts` — Vite configuration
    - `tsconfig.json` — TypeScript config
- `server/` — Backend API (Node.js, Express, SQLite)
    - `src/` — Main server code
        - `app.ts` — Express app
        - `controllers/` — Route controllers
        - `middleware/` — Auth middleware
        - `routes/` — API routes
        - `services/` — Business logic
        - `config/` — Database and environment config
        - `types/` — Type definitions
    - `data/` — SQLite database
    - `migrations/` — Database migrations
    - `package.json` — Server dependencies and scripts
    - `tsconfig.json` — TypeScript config

## Development

### Client (Web App)

1. Install dependencies:
   ```
   cd client
   npm install
   ```
2. Start the development server:
   ```
   npm run dev
   ```

### Server (API)

1. Install dependencies:
   ```
   cd server
   npm install
   ```
2. Run migrations (if needed):
   ```
   npm run migrate
   ```
3. Start the server:
   ```
   npm run dev
   ```

### Running as Electron Desktop App

1. Build the client app:
   ```
   cd client
   npm run build
   ```
2. Start Electron:
   ```
   npm run electron
   ```

### Packaging Desktop Installer

To build a desktop installer:

```
npm run electron-build
```

## Linting & Type Checking

- ESLint and TypeScript are configured for both client and server.
- See `client/eslint.config.js` for recommended React lint rules.

## Features

- Habit entry and tracking
- Stats and charts
- Auth (with refresh token)
- SQLite persistence
- Electron desktop packaging

## Notes

- See individual `package.json` files for available scripts.
- Database migrations are in `server/migrations/`.
- Fonts and assets are in `client/src/assets/`.
- For API endpoints, see `server/src/routes/`.
