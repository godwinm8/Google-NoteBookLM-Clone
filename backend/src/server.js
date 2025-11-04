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


import "./force-pdfjs.js";
import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

// ⚠️ Only keep this if it DOES NOT set any Access-Control-* headers
// import { corsMiddleware } from "./middleware/cors.js";

import uploadRoutes from "./routes/upload.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();
app.set("trust proxy", 1);

// Allowed production origins (comma-separated, no trailing /)
const prodOrigins = (process.env.CLIENT_ORIGIN || "")
  .split(",")
  .map((s) => s.trim().replace(/\/$/, ""))
  .filter(Boolean);

// Allow any Vercel preview by default (or override via PREVIEW_REGEX)
const previewPattern = process.env.PREVIEW_REGEX
  ? new RegExp(process.env.PREVIEW_REGEX, "i")
  : /^https:\/\/.*\.vercel\.app$/i;

// ----- Preflight short-circuit -----
app.use((req, res, next) => {
  if (req.method !== "OPTIONS") return next();

  const origin = (req.headers.origin || "").replace(/\/$/, "");
  const allowed = prodOrigins.includes(origin) || previewPattern.test(origin);

  res.setHeader("Vary", "Origin");
  if (!allowed) return res.status(403).end();

  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "");
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS,HEAD");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With, Accept"
  );
  return res.sendStatus(204);
});

// ----- CORS for actual requests -----
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin) return cb(null, true);
      const norm = origin.replace(/\/$/, "");
      const allowed = prodOrigins.includes(norm) || previewPattern.test(norm);
      console.log("[CORS] origin:", origin, "allowed:", allowed);
      cb(allowed ? null : new Error("Not allowed by CORS"), allowed);
    },
    credentials: true,
    methods: ["GET", "POST", "OPTIONS", "HEAD"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
    optionsSuccessStatus: 204,
  })
);

app.use(express.json({ limit: "50mb" }));
// app.use(corsMiddleware); // ← leave commented if it adds headers
app.use(morgan("dev"));

app.get("/api/health", (req, res) => res.json({ ok: true, ts: Date.now() }));
app.get("/", (req, res) => res.json({ status: "ok" }));

app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/pdfs", pdfRoutes);

// Mongo (lazy singleton)
let mongoReady = null;
async function ensureMongo() {
  if (!mongoReady) {
    mongoReady = mongoose
      .connect(process.env.MONGODB_URI, { dbName: "notebooklm" })
      .then(() => console.log("MongoDB connected"))
      .catch((err) => {
        mongoReady = null;
        console.error("MongoDB connect error:", err);
        throw err;
      });
  }
  return mongoReady;
}
ensureMongo().catch(() => {});

const PORT = process.env.PORT || 8080;
if (!process.env.VERCEL) {
  app.listen(PORT, () => console.log(`API http://localhost:${PORT}`));
}

export default app;
