import { Router } from "express";
import multer from "multer";
import {
  uploadPDFViaServer,
  registerUploadedUrl,
} from "../controllers/upload.controller.js";

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });

router.post("/register", registerUploadedUrl);

router.post("/file", upload.single("file"), uploadPDFViaServer);

export default router;
