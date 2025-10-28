import Pdf from "../models/PdfMetadata.model.js";

export const listPdfs = async (req, res) => {
  const docs = await Pdf.find({}).sort({ createdAt: -1 }).limit(100);
  res.json(docs);
};
