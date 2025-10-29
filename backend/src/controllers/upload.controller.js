import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";
import Pdf from "../models/PdfMetadata.model.js";
import { indexPdfByUrl } from "../services/pdfIndex.service.js";

export const registerUploadedUrl = async (req, res) => {
  try {
    const { url, title } = req.body;

    if (!url || typeof url !== "string") {
      return res
        .status(400)
        .json({ error: "A valid 'url' (string) is required" });
    }

    try {
      new URL(url);
    } catch {
      return res.status(400).json({ error: "Invalid URL format" });
    }

    console.log("[registerUploadedUrl] url:", url, "title:", title);

    const result = await indexPdfByUrl(url, title || "Untitled");
    return res.json(result);
  } catch (e) {
    console.error("[registerUploadedUrl] failed:", e);
    return res
      .status(500)
      .json({ error: e.message || "Internal Server Error" });
  }
};

export const uploadPDFViaServer = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: "file is required" });
    const formData = new FormData();
    formData.append("file", fs.createReadStream(req.file.path));

    const response = await axios.post(
      "https://api.upload.io/v1/files/basic",
      formData,
      {
        headers: {
          Authorization: `Bearer ${process.env.UPLOAD_IO_API_KEY}`,
          ...formData.getHeaders(),
        },
      }
    );

    fs.unlinkSync(req.file.path);
    const fileUrl = response.data.fileUrl;
    const result = await indexPdfByUrl(
      fileUrl,
      req.file.originalname || "Uploaded PDF"
    );
    res.json(result);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
};
