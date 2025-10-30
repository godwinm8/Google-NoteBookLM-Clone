import axios from "axios";
import OpenAI from "openai";
import Pdf from "../models/PdfMetadata.model.js";
import { getChromaCollection } from "./vectordb.service.js";
import { chunkText } from "../utils/chunkText.js";
//import { extractPdfTextAndPages } from "./pdfExtract.service.js";
//import { fetchAsBuffer, extractPdfTextAndPagesFromBuffer } from "./pdfExtract.service.js";
//import { fetchAsBuffer, extractPdfTextAndPagesFromBuffer } from "./pdfExtract.service.js";
import { extractPdfTextAndPages } from "./pdfExtract.service.js";



const LOCAL_EMBED_URL =
  process.env.LOCAL_EMBED_URL || "http://localhost:9000/embed";
const EMBED_MODEL = process.env.EMBED_MODEL || "text-embedding-3-small";

const openai = process.env.OPENAI_API_KEY
  ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
  : null;

async function embedTexts(texts) {
  const input = texts.map((t) => (t ?? "").toString().slice(0, 7500));

  if (openai) {
    const resp = await openai.embeddings.create({
      model: EMBED_MODEL,
      input,
    });
    return resp.data.map((d) => d.embedding);
  }

  const res = await axios.post(LOCAL_EMBED_URL, { texts: input });
  const vectors = res.data?.embeddings ?? res.data?.vectors;
  if (!Array.isArray(vectors) || !vectors.length) {
    throw new Error("Local embedder returned no embeddings");
  }
  return vectors;
}

export async function indexPdfByUrl(fileUrl, title) {
  const resp = await fetch(fileUrl);
  if (!resp.ok) throw new Error(`Failed to download PDF: ${resp.status}`);
  const ab = await resp.arrayBuffer();
  const uint8 = new Uint8Array(ab);

  // const { text, pages } = await extractPdfTextAndPages(uint8);

  //const buffer = await fetchAsBuffer(fileUrl);

const { text, pages } = await extractPdfTextAndPages(unit8);

  if (!text || !text.trim()) {
    throw new Error("No text extracted from PDF (likely a scanned PDF; OCR required).");
  }

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
    //sizeBytes: buffer.length,
    collectionName,
  });
  console.log(`✅ Indexed ${chunks.length} chunks for ${title}`);

  return { pdf: doc, chunks: chunks.length };
}