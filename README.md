# Product-Hackathon

## Getting started

This repo has a **Node.js + Express** backend and a **React (Vite)** frontend in `client/`. The API is at `/api/hello`. The server serves the built React app from `client/dist` when present.

### Run locally (production-style)

1. Install dependencies (root and client):

```bash
npm install
cd client && npm install && cd ..
```

2. Build the React app and start the server:

```bash
npm run build
npm run start
```

3. Open http://localhost:3000 in your browser.

### Run in development (with hot reload)

1. **Terminal 1** – start the API server:

```bash
npm run dev
```

2. **Terminal 2** – start the React dev server (proxies `/api` to the backend):

```bash
npm run dev:client
```

3. Open http://localhost:5173 in your browser. Edit files in `client/src` and see changes instantly.

## Project structure

- `server.js` – Express server: serves `client/dist` (or `public/` if no build), provides `/api/hello`
- `package.json` – root scripts and dependencies
- `client/` – React + Vite app
  - `client/src/` – React components, styles
  - `client/dist/` – built output (after `npm run build`)
- `public/` – legacy static frontend (used only if `client/dist` is missing)

## Scripts

| Script        | Description                                      |
|---------------|--------------------------------------------------|
| `npm run start`     | Run Express server (serve built React app)       |
| `npm run dev`       | Run Express with nodemon                         |
| `npm run build`     | Build React app into `client/dist`               |
| `npm run dev:client`| Run Vite dev server (use with `npm run dev`)     |

WE CAN DO THIS!!!
YAY
