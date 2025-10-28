import fetch from "node-fetch";
import axios from "axios";
import Pdf from "../models/PdfMetadata.model.js";
import { getChromaCollection } from "./vectordb.service.js";
import { chunkText } from "../utils/chunkText.js";
import { extractPdfTextAndPages } from "./pdfExtract.service.js";

const LOCAL_EMBED_URL =
  process.env.LOCAL_EMBED_URL || "http://localhost:9000/embed";

async function embedTexts(texts) {
  const res = await axios.post(LOCAL_EMBED_URL, { texts });

  const vectors = res.data?.embeddings ?? res.data?.vectors;

  if (!Array.isArray(vectors) || vectors.length === 0) {
    throw new Error("Local embedder returned no embeddings");
  }
  return vectors;
}

export async function indexPdfByUrl(fileUrl, title) {
  const resp = await fetch(fileUrl);
  if (!resp.ok) throw new Error(`Failed to download PDF: ${resp.status}`);
  const ab = await resp.arrayBuffer();
  const uint8 = new Uint8Array(ab);

  const { text, pages } = await extractPdfTextAndPages(uint8);

  const chunks = chunkText(text, 800, 120);
  const collectionName = "pdf_" + Date.now();
  const collection = await getChromaCollection(collectionName);

  const ids = chunks.map((_, i) => `${collectionName}_${i}`);
  const metadatas = chunks.map((c) => ({ page: c.page, source: fileUrl }));
  const documents = chunks.map((c) => c.text);

  const embeddings = await embedTexts(documents);

  if (embeddings.length !== documents.length) {
    throw new Error(
      `Embeddings/documents length mismatch: ${embeddings.length} vs ${documents.length}`
    );
  }

  await collection.add({ ids, metadatas, documents, embeddings });

  const doc = await Pdf.create({
    title: title || "Untitled",
    url: fileUrl,
    pages,
    sizeBytes: uint8.byteLength,
    collectionName,
  });

  return { pdf: doc, chunks: chunks.length };
}
