import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import UploadCard from "./components/UploadCard";
import PdfViewer from "./components/PdfViewer";
import ReadyBanner from "./components/ReadyBanner";
import ThreadCard from "./components/ThreadCard";

const API = import.meta.env.VITE_API_URL || "http://localhost:8080";

export default function App() {
  const [pdf, setPdf] = useState(null);

  const [threads, setThreads] = useState([]);

  const [input, setInput] = useState("");
  const [showBanner, setShowBanner] = useState(true);
  const [loading, setLoading] = useState(false);
  const pdfViewerRef = useRef(null);

  function handleReady(meta) {
    setPdf(meta);
    window.history.pushState({ screen: "viewer" }, "", "#viewer");
  }
  useEffect(() => {
    if (window.location.hash === "#viewer" && !pdf) {
      window.history.replaceState(
        {},
        "",
        window.location.pathname + window.location.search
      );
    }
    const onPop = () => {
      if (window.location.hash !== "#viewer") {
        setPdf(null);
        setThreads([]);
        setShowBanner(true);
        setInput("");
      }
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [pdf]);

  async function sendQuestion() {
    if (!input.trim() || !pdf) return;
    setLoading(true);
    try {
      const { data } = await axios.post(`${API}/api/chat`, {
        pdfId: pdf.pdfId,
        question: input,
      });
      const id = crypto.randomUUID();
      setThreads((prev) => [
        ...prev,
        {
          id,
          question: input,
          answer: data?.answer || "(no answer)",
          citations: Array.isArray(data?.citations) ? data.citations : [],
        },
      ]);
      setInput("");
      setShowBanner(false);
    } catch (e) {
      const id = crypto.randomUUID();
      setThreads((prev) => [
        ...prev,
        { id, question: input, answer: "Error: " + e.message, citations: [] },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function onKeyDown(e) {
    if ((e.metaKey || e.ctrlKey) && e.key === "Enter") sendQuestion();
  }

  function deleteThread(id) {
    setThreads((prev) => {
      const next = prev.filter((t) => t.id !== id);
      if (next.length === 0) setShowBanner(true);
      return next;
    });
  }
  function clearAll() {
    setThreads([]);
    setShowBanner(true);
  }

  function jumpTo(page) {
    pdfViewerRef.current?.scrollToPage(page);
  }

  if (!pdf) {
    return (
      <div
        style={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          background: "#f6f7fb",
          padding: 24,
        }}
      >
        <UploadCard onReady={handleReady} />
      </div>
    );
  }

  return (
    <div className="app-grid">
      <div className="left-pane">
        <div
          style={{
            padding: 12,
            borderBottom: "1px solid #e5e7eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div style={{ fontWeight: 600 }}>{pdf.title}</div>
          <button
            className="cite-chip"
            onClick={() => {
              setPdf(null);
              setThreads([]);
              setShowBanner(true);
              setInput("");
              window.history.replaceState(
                {},
                "",
                window.location.pathname + window.location.search
              );
            }}
          >
            New PDF
          </button>
        </div>

        <div className="left-scroll">
          {threads.length === 0 && showBanner && (
            <ReadyBanner onClose={() => setShowBanner(false)} />
          )}

          {threads.length > 0 && (
            <div className="flex justify-end mb-2">
              <button
                onClick={clearAll}
                className="text-xs px-3 py-1 rounded-full border hover:bg-gray-50"
              >
                Clear all
              </button>
            </div>
          )}

          {threads.map((t) => (
            <ThreadCard
              key={t.id}
              thread={t}
              onClose={() => deleteThread(t.id)}
              onJump={(page) => pdfViewerRef.current?.scrollToPage(page)}
            />
          ))}
        </div>

        <div className="input-bar">
          <div className="nb-inputbar">
            <input
              className="nb-input"
              type="text"
              placeholder="Ask about the document..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendQuestion();
              }}
            />
            <button
              className="nb-send"
              onClick={sendQuestion}
              disabled={loading || !input.trim()}
              title="Send"
              aria-label="Send"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path
                  d="M4 11l15-7-7 15-1-6-7-2z"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinejoin="round"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <PdfViewer ref={pdfViewerRef} url={pdf.url} />
    </div>
  );
}
