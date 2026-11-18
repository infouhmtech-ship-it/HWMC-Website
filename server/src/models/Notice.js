import mongoose from "mongoose";

const noticeSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true, maxlength: 160 },
    body: { type: String, required: true, trim: true, maxlength: 2000 },
    roles: { type: [String], default: ["owner"] },
  },
  { timestamps: true }
);

export default mongoose.model("Notice", noticeSchema);
