import mongoose from "mongoose";

const tenderSchema = new mongoose.Schema(
  {
    reference: { type: String, required: true, trim: true, maxlength: 80 },
    title: { type: String, required: true, trim: true, maxlength: 200 },
    organisation: { type: String, required: true, trim: true, maxlength: 160 },
    category: { type: String, trim: true, maxlength: 80, default: "Waste collection" },
    sourceUrl: { type: String, trim: true, maxlength: 300, default: "https://epms.ppra.gov.pk/" },
    status: { type: String, enum: ["watching", "submitted", "closed"], default: "watching" },
    notes: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Tender", tenderSchema);
