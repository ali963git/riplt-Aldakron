---
name: Port configuration
description: Vite frontend and Express API port assignments for الذاكرون on Replit
---

Replit's platform reserves port 3000 (externalPort) for the proxy.

- **Frontend (azkar-app Vite):** localPort=5173, mapped to externalPort=3000
- **API server (Express):** localPort=8080, mapped to externalPort=80
- artifact.toml for azkar-app has `localPort=5173` and `PORT=5173`

**Why:** The platform assigns externalPort=3000 to the first service; Vite used to default to 3000 which caused a collision. Switched to 5173 to resolve.

**How to apply:** Never hard-code port 3000 in Vite config. Always read `PORT` env var or default to 5173 for the frontend.
