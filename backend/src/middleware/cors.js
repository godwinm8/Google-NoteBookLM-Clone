// backend/src/middleware/cors.js
const ALLOW_ORIGINS = [
  "http://localhost:5173",
  "https://google-note-book-lm-clone-ods8.vercel.app", // your exact frontend domain
  "https://google-note-book-lm-clone-6lxd.vercel.app"        // (if you use a canonical)
];

export function corsMiddleware(req, res, next) {
  const origin = req.headers.origin;
  if (origin && ALLOW_ORIGINS.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
    res.setHeader("Vary", "Origin");
  }
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Access-Control-Max-Age", "86400");

  if (req.method === "OPTIONS") return res.sendStatus(204);
  next();
}
