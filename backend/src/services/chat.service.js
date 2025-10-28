import "dotenv/config";

import OpenAI from "openai";
import { getChromaCollection } from "./vectordb.service.js";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  baseURL: process.env.OPENAI_BASE_URL || "https://openrouter.ai/api/v1",
  defaultHeaders: {
    "HTTP-Referer": process.env.OPENAI_HTTP_REFERER || "http://localhost:5173",
    "X-Title": process.env.OPENAI_X_TITLE || "NotebookLM Clone",
  },
});

const FALLBACK_MODELS = [process.env.OPENAI_MODEL].filter(Boolean);

async function callLLM(messages) {
  let lastErr;
  for (const model of FALLBACK_MODELS) {
    try {
      const resp = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.2,
        temperature: 0,
        top_p: 0.1,
        presence_penalty: 0,
        frequency_penalty: 0,

        seed: 42,
      });
      return resp.choices?.[0]?.message?.content?.trim() || "";
    } catch (err) {
      if (err?.status === 404) {
        lastErr = err;
        continue;
      }

      throw err;
    }
  }
  throw lastErr || new Error("No available LLM endpoints");
}

function buildSystemPrompt(title = "Document") {
  return `You are a helpful assistant answering questions about a PDF titled "${title}".
Use ONLY the provided context snippets. If you are not sure, say you are unsure.
Return concise, clear answers.
 Do not invent facts. Prefer quoting the context with [#n] markers.
 If multiple snippets conflict, state the uncertainty and stop.`;
}

const cache = new Map();

export async function queryWithCitations({
  collectionName,
  question,
  topK = 6,
  title = "Document",
}) {
  const key = `${collectionName}::${question}`;
  if (cache.has(key)) return cache.get(key);

  const collection = await getChromaCollection(collectionName);

  const result = await collection.query({
    queryTexts: [question],
    nResults: topK,
    include: ["documents", "metadatas", "distances"],
  });

  const docs = result.documents?.[0] || [];
  const metas = result.metadatas?.[0] || [];
  const dists = result.distances?.[0] || [];

  let hits = docs.map((text, i) => ({
    text,
    distance: dists[i] ?? 1e9,
    meta: metas[i] || {},
  }));

  const THRESHOLD = 1.5;
  hits = hits.filter((h) => h.distance <= THRESHOLD);

  hits.sort((a, b) => a.distance - b.distance);

  hits = hits.slice(0, topK);

  if (hits.length === 0) {
    return {
      answer:
        "I couldn't find relevant context in the document for that question.",
      citations: [],
    };
  }

  const contextBlocks = hits
    .map((h, idx) => `[#${idx + 1} | page ${h.meta?.page ?? "?"}] ${h.text}`)
    .join("\n\n");

  const messages = [
    { role: "system", content: buildSystemPrompt(title) },
    {
      role: "user",
      content:
        `Question: ${question}\n\n` +
        `Context snippets (numbered):\n${contextBlocks}\n\n` +
        `In your answer, be concise. If you use a snippet, mention its [#number] at the end of the relevant sentence.`,
    },
  ];

  const answer = await callLLM(messages);

  const citations = hits.map((h, idx) => ({
    tag: `#${idx + 1}`,
    page: h.meta?.page ?? null,
    source: h.meta?.source ?? null,
    text: h.text.slice(0, 500),
  }));

  return { answer, citations };
}

export async function streamAnswer(
  { collectionName, question, title = "Document" },
  res
) {
  const collection = await getChromaCollection(collectionName);
  const result = await collection.query({
    queryTexts: [question],
    nResults: 6,
    include: ["documents", "metadatas"],
  });

  const docs = result.documents?.[0] || [];
  const metas = result.metadatas?.[0] || [];

  const hits = docs.map((text, i) => ({ text, meta: metas[i] || {} }));

  const contextBlocks =
    hits.length > 0
      ? hits
          .map(
            (h, idx) => `[#${idx + 1} | page ${h.meta?.page ?? "?"}] ${h.text}`
          )
          .join("\n\n")
      : "(no relevant context snippets found)";

  const messages = [
    { role: "system", content: buildSystemPrompt(title) },
    {
      role: "user",
      content:
        `Question: ${question}\n\nContext:\n${contextBlocks}\n\n` +
        `Answer concisely. Reference snippets like [#1], [#2] when you use them.`,
    },
  ];

  res.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    Connection: "keep-alive",
  });

  let stream;
  let lastErr;
  for (const model of FALLBACK_MODELS) {
    try {
      stream = await client.chat.completions.create({
        model,
        messages,
        temperature: 0.2,
        stream: true,
      });
      break;
    } catch (err) {
      if (err?.status === 404) {
        lastErr = err;
        continue;
      }

      res.write(
        `event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`
      );
      res.end();
      return;
    }
  }
  if (!stream) {
    const msg = (lastErr && lastErr.message) || "No available LLM endpoints";
    res.write(`event: error\ndata: ${JSON.stringify({ message: msg })}\n\n`);
    res.end();
    return;
  }

  let full = "";
  for await (const part of stream) {
    const chunk = part.choices?.[0]?.delta?.content || "";
    if (!chunk) continue;
    full += chunk;
    res.write(`event: chunk\ndata: ${JSON.stringify({ chunk })}\n\n`);
  }

  res.write(`event: done\ndata: ${JSON.stringify({ text: full })}\n\n`);
  res.end();
}
