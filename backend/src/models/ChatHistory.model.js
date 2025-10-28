import mongoose from "mongoose";

const ChatHistorySchema = new mongoose.Schema({
  pdfId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "PdfMetadata",
    required: true,
  },
  question: String,
  answer: String,
  citations: [Number],
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("ChatHistory", ChatHistorySchema);
