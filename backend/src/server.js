// import "./force-pdfjs.js";
// import dotenv from "dotenv";
// dotenv.config();
// import express from "express";
// import cors from "cors";
// import morgan from "morgan";
// import mongoose from "mongoose";
// import { corsMiddleware } from "./middleware/cors.js";
// import uploadRoutes from "./routes/upload.routes.js";
// import chatRoutes from "./routes/chat.routes.js";
// import pdfRoutes from "./routes/pdf.routes.js";

// const app = express();

// const prodOrigins = (process.env.CLIENT_ORIGIN || "")
//   .split(",")
//   .map(s => s.trim().replace(/\/$/, ""))
//   .filter(Boolean);

// // allow any preview of the *frontend* project
// const previewPattern = /^https:\/\/google-note-book-lm-clone-ods8-[a-z0-9-]+\.vercel\.app$/i;

// // ---- Preflight short-circuit (no redirects, no errors) ----
// app.use((req, res, next) => {
//   if (req.method !== "OPTIONS") return next();

//   const origin = req.headers.origin || "";
//   const norm = origin.replace(/\/$/, "");
//   const allowed =
//     (process.env.CLIENT_ORIGIN || "")
//       .split(",")
//       .map(s => s.trim().replace(/\/$/, ""))
//       .filter(Boolean)
//       .includes(norm) ||
//     /^https:\/\/google-note-book-lm-clone-ods8-[a-z0-9-]+\.vercel\.app$/i.test(norm);

//   if (!allowed) {
//     // still reply cleanly so browser doesn't see a redirect/error
//     res.setHeader("Vary", "Origin");
//     return res.status(403).end();
//   }

//   res.setHeader("Access-Control-Allow-Origin", origin);
//   res.setHeader("Vary", "Origin");
//   res.setHeader("Access-Control-Allow-Credentials", "true");
//   res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
//   res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
//   return res.sendStatus(204);
// });


// app.use(
//   cors({
//     origin: (origin, cb) => {
//       if (!origin) return cb(null, true);        // server-to-server/curl

//       const norm = origin.replace(/\/$/, "");
//       const allowed =
//         prodOrigins.includes(norm) || previewPattern.test(norm);

//       console.log("[CORS] origin:", origin, "-> allowed:", allowed);
//       cb(allowed ? null : new Error("Not allowed by CORS"), allowed);
//     },
//     methods: ["GET", "POST", "OPTIONS"],
//     allowedHeaders: ["Content-Type", "Authorization"],
//     credentials: true,
//     optionsSuccessStatus: 204,
//   })
// );
// // app.options("*", cors());



// app.use(express.json({ limit: "10mb" }));
// app.use(corsMiddleware); 
// app.use(morgan("dev"));

// app.get("/", (req, res) =>
//   res.json({ status: "ok", service: "NotebookLM Backend" })
// );


// app.use("/api/upload", uploadRoutes);
// app.use("/api/chat", chatRoutes);
// app.use("/api/pdfs", pdfRoutes);

// let mongoReady = null;
// async function ensureMongo() {
//   if (!mongoReady) {
//     mongoReady = mongoose
//       .connect(process.env.MONGODB_URI, { dbName: "notebooklm" })
//       .then(() => console.log("MongoDB connected"))
//       .catch((e) => {
//         mongoReady = null;
//         throw e;
//       });
//   }
//   return mongoReady;
// }
// ensureMongo();

// const PORT = process.env.PORT || 8080;
// if (!process.env.VERCEL) {
//   app.listen(PORT, () =>
//     console.log(`API listening on http://localhost:${PORT}`)
//   );
// }

// export default app;


// --- Force pdfjs to be bundled in Vercel functions ---
import "./force-pdfjs.js";

import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

// NOTE: keep this only if it DOES NOT set any Access-Control-* headers.
// If it does, remove it to avoid conflicting CORS headers.
import { corsMiddleware } from "./middleware/cors.js";

import uploadRoutes from "./routes/upload.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();

// Trust Vercel’s reverse proxy for correct protocol/host
app.set("trust proxy", 1);

// ----------------------------------------------------
// Allowed origins
// ----------------------------------------------------
// Comma-separated list, without trailing slashes, e.g.
// CLIENT_ORIGIN=https://your-frontend.vercel.app,https://your-domain.com
const prodOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map(s => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Preview deployment pattern (adjust to your project slug if needed).
// Example matches: https://google-note-book-lm-clone-ods8-abc123.vercel.app
const previewPattern =
  process.env.PREVIEW_REGEX
    ? new RegExp(process.env.PREVIEW_REGEX, "i")
    : /^https:\/\/google-note-book-lm-clone-ods8-[a-z0-9-]+\.vercel\.app$/i;

// ----------------------------------------------------
// Preflight short-circuit (must run BEFORE cors())
// ----------------------------------------------------
app.use((req, res, next) => {
  if (req.method !== "OPTIONS") return next();

  const origin = req.headers.origin || "";
  const norm = origin.replace(/\/$/, "");

  const allowed =
    prodOrigins.includes(norm) || previewPattern.test(norm);

  // Always respond cleanly to preflight to avoid browser "CORS preflight error"
  res.setHeader("Vary", "Origin");

  if (!allowed) {
    // Block origin but still return a simple response (no redirects, no HTML)
    return res.status(403).end();
  }

  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader(
    "Access-Control-Allow-Methods",
    "GET,POST,OPTIONS,HEAD"
  );
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );

  return res.sendStatus(204);
});

// ----------------------------------------------------
// cors() – for actual requests
// ----------------------------------------------------
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow server-to-server (no Origin header)
      if (!origin) return cb(null, true);

      const norm = origin.replace(/\/$/, "");
      const allowed = prodOrigins.includes(norm) || previewPattern.test(norm);

      // Optional: log decisions
      console.log("[CORS] origin:", origin, "allowed:", allowed);
      cb(allowed ? null : new Error("Not allowed by CORS"), allowed);
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 204
  })
);

// ----------------------------------------------------
// Body parsing / logging / any non-CORS middlewares
// ----------------------------------------------------
app.use(express.json({ limit: "50mb" })); // PDFs can produce large payloads
// ✅ Keep this ONLY if it doesn't add Access-Control-* headers
app.use(corsMiddleware);
app.use(morgan("dev"));

// ----------------------------------------------------
// Healthcheck + root
// ----------------------------------------------------
app.get("/api/health", (req, res) => {
  res.json({ ok: true, ts: Date.now(), service: "NotebookLM Backend" });
});

app.get("/", (req, res) =>
  res.json({ status: "ok", service: "NotebookLM Backend" })
);

// ----------------------------------------------------
// Routes
// ----------------------------------------------------
app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/pdfs", pdfRoutes);

// ----------------------------------------------------
// Mongo connection (lazy-singleton so cold starts are cheap)
// ----------------------------------------------------
let mongoReady = null;
async function ensureMongo() {
  if (!mongoReady) {
    mongoReady = mongoose
      .connect(process.env.MONGODB_URI, { dbName: "notebooklm" })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => {
        // reset so next request attempts again
        mongoReady = null;
        console.error("MongoDB connect error:", err);
        throw err;
      });
  }
  return mongoReady;
}
ensureMongo().catch(() => { /* first request will retry */ });

// ----------------------------------------------------
// Local dev server (Vercel will import default app)
// ----------------------------------------------------
const PORT = process.env.PORT || 8080;
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`API listening on http://localhost:${PORT}`);
  });
}

export default app;
