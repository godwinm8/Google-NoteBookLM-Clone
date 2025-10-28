import { useState } from "react";
import axios from "axios";

export default function ChatBox({ pdfId, title }) {
  const [question, setQuestion] = useState("");
  const [answer, setAnswer] = useState("");
  const [loading, setLoading] = useState(false);

  async function askQuestion() {
    if (!question.trim()) return;
    setLoading(true);
    setAnswer("");

    try {
      const { data } = await axios.post("http://localhost:8080/api/chat", {
        pdfId,
        question,
      });
      setAnswer(data.answer || "(No answer received)");
    } catch (err) {
      console.error(err);
      setAnswer("Error: " + (err.response?.data?.error || err.message));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ marginTop: 20 }}>
      <textarea
        rows="3"
        placeholder="Ask about the document..."
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
        style={{ width: "100%", padding: 8 }}
      />
      <button onClick={askQuestion} disabled={loading}>
        {loading ? "Loading..." : "Ask"}
      </button>

      <div style={{ marginTop: 10 }}>
        <h4>Answer</h4>
        <p>{answer}</p>
      </div>
    </div>
  );
}
