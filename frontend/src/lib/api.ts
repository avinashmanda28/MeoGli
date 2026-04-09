// Single source of truth for the backend URL.
// In Codespaces: create frontend/.env.local and set:
//   NEXT_PUBLIC_API_URL=https://YOUR-CODESPACE-8000.app.github.dev
// Locally: leave .env.local empty — falls back to localhost:8000
export const API_URL =
  (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000").replace(/\/$/, "");
