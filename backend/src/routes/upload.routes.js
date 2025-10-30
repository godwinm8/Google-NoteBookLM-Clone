// backend/src/routes/upload.routes.js
import express from "express";
import multer from "multer";
import { registerUploadedUrl, uploadPDFViaServer } from "../controllers/upload.controller.js";

const router = express.Router();
const upload = multer();

router.options("/register", (_, res) => res.sendStatus(204)); // handle CORS preflight
router.post("/register", registerUploadedUrl);

router.options("/file", (_, res) => res.sendStatus(204));
router.post("/file", upload.single("file"), uploadPDFViaServer);

export default router;
