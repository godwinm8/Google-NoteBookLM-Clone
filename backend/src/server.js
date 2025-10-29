import dotenv from "dotenv";
dotenv.config();

import express from "express";
import cors from "cors";
import morgan from "morgan";
import mongoose from "mongoose";

import uploadRoutes from "./routes/upload.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import pdfRoutes from "./routes/pdf.routes.js";

const app = express();

const origins = process.env.CLIENT_ORIGIN
  ? process.env.CLIENT_ORIGIN.split(",").map((s) => s.trim())
  : true;

app.use(cors({ origin: origins }));
app.use(express.json({ limit: "10mb" }));
app.use(morgan("dev"));

app.get("/", (req, res) =>
  res.json({ status: "ok", service: "NotebookLM Backend" })
);

app.use("/api/upload", uploadRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/pdfs", pdfRoutes);

let mongoReady = null;
async function ensureMongo() {
  if (!mongoReady) {
    mongoReady = mongoose
      .connect(process.env.MONGODB_URI, { dbName: "notebooklm" })
      .then(() => console.log("MongoDB connected"))
      .catch((e) => {
        mongoReady = null;
        throw e;
      });
  }
  return mongoReady;
}
ensureMongo();

const PORT = process.env.PORT || 8080;
if (!process.env.VERCEL) {
  app.listen(PORT, () =>
    console.log(`API listening on http://localhost:${PORT}`)
  );
}

export default app;
