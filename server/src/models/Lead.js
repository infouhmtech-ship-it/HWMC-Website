import mongoose from "mongoose";

const leadSchema = new mongoose.Schema(
  {
    source: { type: String, enum: ["ppra", "manual", "whatsapp", "call", "walk-in"], default: "manual" },
    tender: { type: mongoose.Schema.Types.ObjectId, ref: "Tender", default: null },
    clientName: { type: String, required: true, trim: true, maxlength: 160 },
    contactName: { type: String, trim: true, maxlength: 120, default: "" },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    site: { type: String, trim: true, maxlength: 300, default: "" },
    city: { type: String, trim: true, maxlength: 80, default: "Lahore" },
    service: { type: String, trim: true, maxlength: 120, default: "Waste collection" },
    status: { type: String, enum: ["new", "qualified", "approved", "rejected"], default: "new" },
    notes: { type: String, trim: true, maxlength: 2000, default: "" },
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", default: null },
  },
  { timestamps: true }
);

export default mongoose.model("Lead", leadSchema);
