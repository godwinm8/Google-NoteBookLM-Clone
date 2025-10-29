// backend/src/services/embeddings.service.js
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function embedTexts(texts) {
  if (!Array.isArray(texts) || texts.length === 0) return [];

  const clean = texts.map((t) => (t || "").toString().slice(0, 7500));

  const resp = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: clean,
  });

  return resp.data.map((d) => d.embedding);
}
