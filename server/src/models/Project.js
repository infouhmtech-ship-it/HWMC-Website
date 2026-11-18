import mongoose from "mongoose";

const projectSchema = new mongoose.Schema(
  {
    lead: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    code: { type: String, required: true, unique: true },
    clientName: { type: String, required: true, trim: true, maxlength: 160 },
    contactName: { type: String, trim: true, maxlength: 120, default: "" },
    phone: { type: String, trim: true, maxlength: 40, default: "" },
    site: { type: String, trim: true, maxlength: 300, default: "" },
    city: { type: String, trim: true, maxlength: 80, default: "" },
    service: { type: String, trim: true, maxlength: 120, default: "" },
    frequency: { type: String, enum: ["", "daily", "weekly", "monthly"], default: "" },
    scheduleDays: { type: [String], default: [] },
    planType: { type: String, enum: ["regular", "specific", "custom"], default: "regular" },
    weeklyRate: { type: Number, default: 0, min: 0 },
    contractStatus: { type: String, enum: ["draft", "agreed"], default: "draft" },
    contractNotes: { type: String, trim: true, maxlength: 2000, default: "" },
    staffName: { type: String, trim: true, maxlength: 120, default: "" },
    vehicle: { type: String, trim: true, maxlength: 120, default: "" },
    routeNotes: { type: String, trim: true, maxlength: 2000, default: "" },
    commissionRate: { type: Number, default: 0.1 },
    marketingName: { type: String, trim: true, maxlength: 120, default: "" },
    status: { type: String, enum: ["setup", "active", "paused"], default: "setup" },
  },
  { timestamps: true }
);

export default mongoose.model("Project", projectSchema);
