# 💬 Google NotebookLM Clone-style PDF Q&A — Full Project (Frontend + Backend)

A complete modern app that lets users upload PDFs, ask questions in natural language, and get instant AI-powered answers with **clickable citations** that scroll directly to the correct PDF page.

---

## 🌐 Live URLs

**Frontend (Vercel/Netlify):**  
👉 https://your-frontend.vercel.app  

**Backend (Vercel API):**  
👉 https://your-backend.vercel.app  

> Replace with your actual deployment URLs.  
> Frontend communicates with backend using `VITE_API_URL` defined in `.env`.

---

## 📍 Source Code

✅ https://github.com/godwinm8/Google-NoteBookLM-Clone.git

---

# 🖥️ Frontend (React + Vite)

## ⚙️ Features
- Upload PDF via drag-and-drop or click
- “Your document is ready!” banner
- Chat interface for Q&A
- Built-in PDF viewer with page navigation
- Citations that scroll to the right page
- “Clear All” and close buttons for threads
- Fully responsive layout

---

## 🧩 Requirements
- Node.js **v18+** or higher
- npm or pnpm
- Backend running (local or deployed)

---

## 🧠 Environment Variables

Create a `.env` file in `/frontend`:

```bash
# Backend API URL
VITE_API_URL=https://your-backend.vercel.app

# Upload.io public key (optional)
VITE_UPLOAD_IO_PUBLIC_KEY=your_public_key_here

# For local testing
VITE_API_URL=http://localhost:8080
```

---

## 🧾 Installation & Local Setup

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at:  
👉 http://localhost:5173

---

## 🧱 Project Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── UploadCard.jsx
│   │   ├── PdfViewer.jsx
│   │   ├── ReadyBanner.jsx
│   │   └── ThreadCard.jsx
│   ├── App.jsx
│   └── index.css
├── .env
├── index.html
└── package.json
```

---

## ⚡ Usage Instructions

**Step 1: Upload a PDF**
- Click or drag the file to upload.
- Progress bar shows upload status.

**Step 2: Wait for “Your document is ready!”**
- A banner appears with sample questions.

**Step 3: Ask Questions**
- Type your question and press Enter or click Send.
- AI responds with an answer and citations.

**Step 4: Navigate Citations**
- Click “Page N” to scroll to that page.
- Hover to preview the cited text.

**Step 5: Manage Chat**
- “Clear All” removes all threads.
- “X” deletes one thread.
- Upload new PDF anytime via “New PDF”.

---

## 📡 API Integration

| Endpoint               | Method | Description                                         |
| ---------------------- | ------ | --------------------------------------------------- |
| `/api/upload/register` | POST   | Register PDF after upload                           |
| `/api/chat`            | POST   | Send user question and get AI answer with citations |

Example:
```bash
POST https://your-backend.vercel.app/api/chat
{
  "pdfId": "abc123",
  "question": "Summarize the key points"
}
```

Response:
```json
{
  "answer": "The document discusses sustainable growth...",
  "citations": [{ "page": 3, "tag": "Page 3", "text": "Growth factors..." }]
}
```

---

## ☁️ Deployment (Vercel / Netlify)

### 🧭 1. Deploy Backend First
Host backend on Vercel and confirm:
👉 https://your-backend.vercel.app/api/health

### 🧭 2. Deploy Frontend
Connect repo to Netlify or Vercel.  
Add env variable:
```
VITE_API_URL=https://your-backend.vercel.app
```

### 🧭 3. Build Settings

| Platform    | Build Command   | Output Folder |
| ----------- | --------------- | ------------- |
| **Netlify** | `npm run build` | `dist`        |
| **Vercel**  | `npm run build` | `dist`        |

---

## 🧰 Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}
```

---

## 💡 Example Workflow

```bash
# 1. Start backend
cd backend
npm run dev

# 2. Start frontend
cd frontend
npm run dev

# 3. Open browser
http://localhost:5173
```

Upload PDF → Ask questions → See citations.

---

## 🧾 Troubleshooting

| Issue                       | Solution                                                   |
| --------------------------- | ---------------------------------------------------------- |
| **CORS Error**              | Add frontend URL to backend CORS origins                   |
| **PDF not loading**         | Ensure Upload.io returns `/raw/` URL                       |
| **Send button disabled**    | Ensure `VITE_API_URL` points to a valid backend            |
| **Citations not scrolling** | Check `PdfViewer.scrollToPage()` logic                     |
| **Banner not showing**      | Check `showBanner` in `App.jsx`                            |

---

# ⚙️ Backend (Node + Express)

## 📄 Overview

The backend powers PDF registration, embedding, and AI chat with citations.

---

## 🚀 Live API

**Base URL:**  
👉 https://your-backend.vercel.app

> Example for frontend `.env`  
> `VITE_API_URL=https://your-backend.vercel.app`

---

## ⚙️ Features
- `/api/upload/register` — Register PDFs  
- `/api/chat` — Handle Q&A requests  
- Returns page-based citations  
- CORS-enabled for all environments  
- Ready for OpenAI or any LLM provider

---

## 🧩 Requirements
- Node.js **v18+**
- npm / pnpm
- OpenAI API key
- Optional: Pinecone / pgvector for embeddings

---

## 🧠 Environment Variables

Create `.env` inside `/backend`:

```bash
PORT=8080
OPENAI_API_KEY=sk-...
VERCEL_URL=https://your-backend.vercel.app
```

---

## 📦 Installation & Local Setup

```bash
cd backend
npm install
npm run dev
```

Backend runs at:  
👉 http://localhost:8080

---

## 📡 API Endpoints

### 🔹 POST /api/upload/register
Registers a PDF.

**Request:**
```json
{
  "url": "https://upcdn.io/.../raw/abc.pdf",
  "title": "MyDocument.pdf"
}
```

**Response:**
```json
{
  "pdf": {
    "_id": "abc123",
    "url": "https://upcdn.io/.../raw/abc.pdf",
    "title": "MyDocument.pdf",
    "collectionName": "pdf_abc123"
  }
}
```

---

### 🔹 POST /api/chat
Handles Q&A for a given PDF.

**Request:**
```json
{
  "pdfId": "abc123",
  "question": "Summarize the profile section."
}
```

**Response:**
```json
{
  "answer": "Godwin is a Developer...",
  "citations": [
    { "page": 1, "tag": "Page 1", "text": "Snippet from the source page" }
  ]
}
```

---

## 🔐 CORS Configuration

```js
import cors from "cors";

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://your-frontend.netlify.app",
      "https://your-frontend.vercel.app"
    ],
    methods: ["GET", "POST"],
    credentials: false
  })
);
```

---

## 🧠 How It Works

1. User uploads PDF → stored via `/api/upload/register`.  
2. Backend embeds the document (page-wise).  
3. `/api/chat` retrieves relevant pages → queries LLM → returns:
   - Answer
   - Citations `{ page, tag, text }`.

---

## 🧪 Local Testing

**Example using curl:**
```bash
curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"pdfId":"abc123","question":"Summarize the document"}'
```

---

## ☁️ Deployment (Vercel)

1. Ensure files exist:
   ```
   /backend/package.json
   /backend/src/index.js
   ```
2. Add optional `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],
     "routes": [{ "src": "/(.*)", "dest": "src/index.js" }]
   }
   ```
3. Deploy → Copy deployed URL → Update frontend `.env`.

---

## 🧾 Folder Structure

```
backend/
├── src/
│   ├── index.js
│   ├── routes/
│   │   ├── chat.js
│   │   └── upload.js
│   ├── utils/
│   └── embeddings/
├── package.json
├── vercel.json
└── .env
```

---

## 🧰 Scripts

```json
{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "build": "tsc"
  }
}
```

---

## 🧾 Troubleshooting

| Problem                       | Possible Fix                                |
| ----------------------------- | ------------------------------------------- |
| **CORS error**                | Add your frontend URL to `origin` array     |
| **LLM Timeout**               | Reduce max tokens or increase timeout       |
| **PDF not found**             | Ensure direct `/raw/` access URL            |
| **500 Internal Server Error** | Check logs (`vercel logs <deployment>`)     |

---

## ✅ Example Working URLs

| Endpoint               | Method | Example                                                                                                    |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| `/api/upload/register` | POST   | [https://your-backend.vercel.app/api/upload/register](https://your-backend.vercel.app/api/upload/register) |
| `/api/chat`            | POST   | [https://your-backend.vercel.app/api/chat](https://your-backend.vercel.app/api/chat)                       |

---

## ✅ Example Full Local Workflow

1. Start backend: `npm run dev` on port 8080  
2. Start frontend: `npm run dev` on port 5173  
3. Open browser: http://localhost:5173  
4. Upload PDF → Ask question → See citations scroll to pages  
5. Deploy both apps → Replace URLs in `.env`

---

✨ **Enjoy your own NotebookLM-style PDF Q&A app!**
 