import axios from "axios";
import { ChromaClient } from "chromadb";

const CHROMA_URL = process.env.CHROMA_URL || "http://localhost:8000";
const LOCAL_EMBED_URL =
  process.env.LOCAL_EMBED_URL || "http://localhost:9000/embed";

export const client = new ChromaClient({ path: CHROMA_URL });

const localEmbeddingFunction = {
  generate: async (texts) => {
    const res = await axios.post(LOCAL_EMBED_URL, { texts });

    const out = res.data?.vectors ?? res.data?.embeddings;
    if (!Array.isArray(out))
      throw new Error("Local embedder returned no embeddings");
    return out;
  },
};

export async function getChromaCollection(name) {
  return client.getOrCreateCollection({
    name,
    embeddingFunction: localEmbeddingFunction,
  });
}

export async function getChromaCollectionByName(name) {
  const cli = getChromaClient();
  return await cli.getCollection({ name });
}
