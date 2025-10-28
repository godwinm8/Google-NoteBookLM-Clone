from fastapi import FastAPI
from pydantic import BaseModel
from sentence_transformers import SentenceTransformer
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model = SentenceTransformer("all-MiniLM-L6-v2")

class EmbedRequest(BaseModel):
    texts: list[str]

@app.post("/embed")
async def embed(payload: EmbedRequest):
    vectors = model.encode(payload.texts, convert_to_numpy=True).tolist()
    return {"vectors": vectors}   

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=9000)
