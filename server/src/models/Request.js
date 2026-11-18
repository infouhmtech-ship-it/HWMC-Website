import mongoose from "mongoose";

const requestSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    email: { type: String, trim: true, maxlength: 160, default: "" },
    organisation: { type: String, trim: true, maxlength: 160, default: "" },
    site: { type: String, required: true, trim: true, maxlength: 300 },
    service: { type: String, required: true, trim: true, maxlength: 80 },
    timing: { type: String, required: true, trim: true, maxlength: 80 },
    details: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Request", requestSchema);
