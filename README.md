# JD-Smart-Commencement

Smart Commencement is a React + Vite frontend with a small Express backend for a Labour Tribunal intake and officer workflow demo. The repository contains both the claimant-facing UI and the internal officer workbench in one project.

## Tech Stack

- Frontend: React, TypeScript, Vite
- Backend: Express, TypeScript, tsx
- Build: Vite for client assets, esbuild for the Node server bundle

## Project Structure

- `client/`: frontend app and public assets
- `server/`: Express server and API endpoints
- `shared/`: shared constants/types used across app layers
- `dist/`: production build output

## Local Development

Install dependencies:

```powershell
npm install
```

Run backend locally:

```powershell
npm run server:dev
```

Run frontend locally:

```powershell
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:3000`
- Backend: `http://localhost:4000`

The Vite dev server proxies `/api` requests to the backend during local development.

## Build

Create a production build:

```powershell
npm run build
```

This outputs:

- frontend static files to `dist/public`
- backend server bundle to `dist/index.js`

Run the production build locally in PowerShell:

```powershell
$env:NODE_ENV="production"
node .\dist\index.js
```

## GitHub / Deployment Notes

- The main branch is connected to GitHub at `marcochin-png/JD-Smart-Commencement`.
- For Vercel or other frontend-focused hosting, the client build is produced by `npm run build`.
- If you need the full stack, deploy the generated Node server together with `dist/public`.