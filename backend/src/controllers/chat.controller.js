import { queryWithCitations, streamAnswer } from "../services/chat.service.js";
import Pdf from "../models/PdfMetadata.model.js";

export async function chatOnPdf(req, res) {
  try {
    const { pdfId, question } = req.body;
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) return res.status(404).json({ error: "PDF not found" });

    const { answer, citations } = await queryWithCitations({
      collectionName: pdf.collectionName,
      question,
      title: pdf.title,
    });

    res.json({ answer, citations });
  } catch (err) {
    console.error("LLM/Chat error:", err);
    res.status(500).json({ error: err.message || "Chat error" });
  }
}

export async function chatOnPdfStream(req, res) {
  try {
    const { pdfId, question } = req.query;
    const pdf = await Pdf.findById(pdfId);
    if (!pdf) {
      res.writeHead(200, { "Content-Type": "text/event-stream" });
      res.write(
        `event: error\ndata: ${JSON.stringify({ error: "PDF not found" })}\n\n`
      );
      return res.end();
    }

    await streamAnswer(
      { collectionName: pdf.collectionName, question, title: pdf.title },
      res
    );
  } catch (err) {
    console.error("LLM/Stream error:", err);
    res.writeHead(200, { "Content-Type": "text/event-stream" });
    res.write(
      `event: error\ndata: ${JSON.stringify({ error: err.message })}\n\n`
    );
    res.end();
  }
}

export async function chatOnMultiplePdfs(req, res) {
  try {
    const { pdfIds, question } = req.body;
    const pdfs = await Pdf.find({ _id: { $in: pdfIds } });

    const allHits = [];
    for (const pdf of pdfs) {
      const coll = await getChromaCollectionByName(pdf.collectionName);
      const q = await coll.query({
        queryTexts: [question],
        nResults: 4,
        include: ["documents", "metadatas", "distances"],
      });
      (q.documents?.[0] || []).forEach((text, i) => {
        allHits.push({
          text,
          distance: q.distances[0][i],
          meta: { ...q.metadatas[0][i], title: pdf.title },
        });
      });
    }

    allHits.sort((a, b) => a.distance - b.distance);
    const top = allHits.slice(0, 8);
    const contextBlocks = top
      .map(
        (h, idx) =>
          `[#${idx + 1} | ${h.meta?.title ?? "Doc"}, page ${
            h.meta?.page ?? "?"
          }] ${h.text}`
      )
      .join("\n\n");

    const messages = [
      { role: "system", content: buildSystemPrompt("Multiple documents") },
      {
        role: "user",
        content: `Question: ${question}\n\nContext:\n${contextBlocks}`,
      },
    ];

    const resp = await client.chat.completions.create({
      model: MODEL,
      messages,
      temperature: 0.2,
    });

    res.json({
      answer: resp.choices?.[0]?.message?.content?.trim() || "",
      citations: top.map((h, i) => ({
        tag: `#${i + 1}`,
        page: h.meta?.page ?? null,
        source: h.meta?.source ?? null,
        title: h.meta?.title,
        text: h.text.slice(0, 500),
      })),
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
