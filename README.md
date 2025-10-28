   # frontend/README.md

   # 💬 Google NotebookLM Clone-style PDF Q&A — Frontend (React + Vite)

   A modern, responsive web app where users can:
   - Upload PDFs
   - Ask natural language questions
   - Get instant AI answers with clickable citations (scroll to exact PDF pages)

   ---

   ## 🌐 Live App

   **Frontend (Netlify/Vercel):**  
   👉 https://your-frontend.vercel.app  

   **Backend (Vercel API):**  
   👉 https://your-backend.vercel.app  

   > Replace these with your actual deployment URLs.  
   > The frontend communicates with the backend using `VITE_API_URL` defined in `.env`.

   ---

   ## ⚙️ Features
   - Upload PDF via drag-and-drop or click
   - Beautiful “Your document is ready!” banner
   - Chat interface for Q&A
   - PDF viewer with page navigation
   - Citations that jump directly to the correct page
   - “Clear All” and per-conversation close buttons
   - Responsive layout — works well on desktop & large tablets

   ---

   ## 🧩 Requirements
   - Node.js **v18+** (or 20+)
   - npm or pnpm
   - Backend running at your deployed or local URL

   ---

   ## 🧠 Environment Variables

   Create `.env` in the `frontend` directory:

   ```bash
   # Backend API URL
   VITE_API_URL=https://your-backend.vercel.app

   # Upload.io key (if you’re using Upload.io for file storage)
   VITE_UPLOAD_IO_PUBLIC_KEY=your_public_key_here

   # If you are testing locally, set:
   VITE_API_URL=http://localhost:8080

---

## 🧾 Installation & Local Setup

cd frontend
npm install
npm run dev

#Frontend runs at
👉 http://localhost:5173

---

## 🧱 Project Structure

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

---

## ⚡ Usage Instructions

Step 1. Upload a PDF

a. Click or drag-and-drop the file.

b. Progress bar shows real-time upload.

c. Backend registers the file automatically.

Step 2. Wait for “Your document is ready!”

a. A banner will appear with sample question hints.

Step 3. Ask questions

a. Type your question in the input bar.

b. Press Enter or click Send.

c. The backend responds with an answer and citations.

Step 4. Navigate via citations

a. Each Page N button under an answer scrolls the PDF viewer to that page.

b. Hovering shows a text snippet (citation preview).

Step 5. Manage chat

a. Clear All → removes all threads.

b. Close X → deletes a specific thread.

c. Upload a new PDF anytime using “New PDF” at top right.

---

## 📡 API Integration

Frontend interacts with these endpoints:

| Endpoint               | Method | Description                                         |
| ---------------------- | ------ | --------------------------------------------------- |
| `/api/upload/register` | POST   | Register PDF after upload                           |
| `/api/chat`            | POST   | Send user question and get AI answer with citations |

Example request:

POST https://your-backend.vercel.app/api/chat
{
  "pdfId": "abc123",
  "question": "Summarize the key points"
}

Response:

{
  "answer": "The document discusses sustainable growth...",
  "citations": [{ "page": 3, "tag": "Page 3", "text": "Growth factors..." }]
}

---

## ☁️ Deployment (Vercel or Netlify)

🧭 1. Deploy Backend First

Host backend on Vercel.

Confirm URL works (example: https://your-backend.vercel.app/api/health).

🧭 2. Deploy Frontend

Connect this repo to Netlify or Vercel.

Add Environment Variable:

VITE_API_URL=https://your-backend.vercel.app

🧭 3. Build Settings

| Platform    | Build Command   | Output Folder |
| ----------- | --------------- | ------------- |
| **Netlify** | `npm run build` | `dist`        |
| **Vercel**  | `npm run build` | `dist`        |


On Vercel, select “Framework Preset: Vite”.

---

## 🧰 Scripts

{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview"
  }
}

---

## 💡 Example Workflow

1. Start backend:
cd backend
npm run dev

2. Start frontend:
cd frontend
npm run dev

3. Open browser:
http://localhost:5173

4. Upload PDF → Ask question → See citations.

---

## 🧾 Troubleshooting

| Issue                       | Solution                                                   |
| --------------------------- | ---------------------------------------------------------- |
| **CORS Error**              | Add frontend URL to backend CORS origins                   |
| **PDF not loading**         | Ensure Upload.io returns `/raw/` URL                       |
| **Send button disabled**    | Ensure `VITE_API_URL` points to a valid backend            |
| **Citations not scrolling** | Verify `PdfViewer` exposes `scrollToPage()`                |
| **Banner not showing**      | Check `showBanner` and `threads.length` logic in `App.jsx` |

---

## backend/README.md

# 📄 Google NotebookLM Clone-style PDF Q&A — Backend (Node + Express) 

This backend powers the NotebookLM-style app that lets users:
- Upload a PDF,
- Ask natural language questions,
- Get AI-generated answers **with clickable citations** linked to PDF pages.

---

## 🚀 Live API (Vercel Hosting)

**Base URL:**  
👉 https://your-backend.vercel.app  

> Replace with your actual deployed API endpoint.  
> Example usage in frontend `.env`:
> ```bash
> VITE_API_URL=https://your-backend.vercel.app
> ```

---

## ⚙️ Features
- Upload registration endpoint (`/api/upload/register`)
- Question-answering endpoint (`/api/chat`)
- Returns page-based citations for the frontend to highlight
- Fully CORS-enabled for frontend deployment (Netlify / Vercel / localhost)
- Ready for OpenAI or any other LLM provider

---

## 🧩 Requirements
- Node.js **v18+** or higher
- npm / pnpm
- OpenAI API key (or your chosen LLM provider)
- Optional: Pinecone / pgvector / local embedding storage

---

## 🧠 Environment Variables

Create a `.env` file inside the `/backend` folder:

```bash
PORT=8080
OPENAI_API_KEY=sk-...
# Replace with your actual model provider key

# Optional for deployment on Vercel
VERCEL_URL=https://your-backend.vercel.app

---

## 📦 Installation & Local Setup

cd backend
npm install
npm run dev

#The backend will run on:
👉 http://localhost:8080 

---

## 📡 API Endpoints

🔹 1. POST /api/upload/register
Registers a PDF file and prepares it for retrieval.

Request body:
{
  "url": "https://upcdn.io/.../raw/abc.pdf",
  "title": "MyDocument.pdf"
}

Response:
{
  "pdf": {
    "_id": "abc123",
    "url": "https://upcdn.io/.../raw/abc.pdf",
    "title": "MyDocument.pdf",
    "collectionName": "pdf_abc123"
  }
}

🔹 2. POST /api/chat
Takes a question and returns an AI-generated answer with citations.

Request body:
{
  "pdfId": "abc123",
  "question": "Summarize the profile section."
}

Response:
{
  "answer": "Godwin is a Developer...",
  "citations": [
    { "page": 1, "tag": "Page 1", "text": "Snippet from the source page" }
  ]
}

---

## 🔐 CORS Configuration

Enable CORS in your backend to allow frontend access:
import cors from "cors";

app.use(
  cors({
    origin: [
      "http://localhost:5173",                  // local dev
      "https://your-frontend.netlify.app",      // Netlify
      "https://your-frontend.vercel.app"        // Vercel
    ],
    methods: ["GET", "POST"],
    credentials: false
  })
);

---

## 🧠 How It Works (Concept)

1. User uploads a PDF → /api/upload/register stores metadata.

2. Backend processes and embeds the document (per page).

3. When a question arrives → backend retrieves top chunks, queries the LLM, and returns:

    -> An answer,

    -> Citations with { page, tag, text }.

---

## 🧪 Local Testing

You can test your endpoints using Postman or curl.

Example:curl -X POST http://localhost:8080/api/chat \
  -H "Content-Type: application/json" \
  -d '{"pdfId":"abc123","question":"Summarize the document"}'

---

## ☁️ Deployment on Vercel

Step 1: Prepare your project

Ensure the following files exist:

-> /backend/package.json

-> /backend/api/chat.js or /backend/src/index.js

Step 2: Add a vercel.json file (optional)

{
  "version": 2,
  "builds": [{ "src": "src/index.js", "use": "@vercel/node" }],
  "routes": [{ "src": "/(.*)", "dest": "src/index.js" }]
}

Step 3: Deploy

1. Push your project to Vercel (vercel --prod or from dashboard).
2. After successful deployment, you’ll get a URL like:
    https://your-backend.vercel.app
3. Copy that and update your frontend .env:
     VITE_API_URL=https://your-backend.vercel.app

---

## 🧾 Example Folder Structure

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

---

## 🧰 Scripts

{
  "scripts": {
    "dev": "nodemon src/index.js",
    "start": "node src/index.js",
    "build": "tsc"
  }
}

---

## 🧾 Troubleshooting

| Problem                       | Possible Fix                                |
| ----------------------------- | ------------------------------------------- |
| **CORS error**                | Add your frontend URL to the `origin` array |
| **LLM Timeout**               | Increase timeout or reduce token length     |
| **PDF not found**             | Ensure the URL is direct and accessible     |
| **500 Internal Server Error** | Check logs (`vercel logs <deployment>`)     |

---

## ✅ Example Working URLs

| Endpoint               | Method | Example                                                                                                    |
| ---------------------- | ------ | ---------------------------------------------------------------------------------------------------------- |
| `/api/upload/register` | POST   | [https://your-backend.vercel.app/api/upload/register](https://your-backend.vercel.app/api/upload/register) |
| `/api/chat`            | POST   | [https://your-backend.vercel.app/api/chat](https://your-backend.vercel.app/api/chat)                       |




