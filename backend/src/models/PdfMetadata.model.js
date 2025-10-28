import mongoose from "mongoose";

const PdfMetadataSchema = new mongoose.Schema({
  title: String,
  url: { type: String, required: true },
  pages: Number,
  sizeBytes: Number,
  collectionName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("PdfMetadata", PdfMetadataSchema);
