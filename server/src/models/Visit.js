import mongoose from "mongoose";

const visitSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    visitDate: { type: String, required: true },
    collectedTime: { type: String, trim: true, maxlength: 8, default: "" },
    staffName: { type: String, trim: true, maxlength: 120, default: "" },
    status: { type: String, enum: ["scheduled", "done", "missed"], default: "done" },
    signatureName: { type: String, trim: true, maxlength: 120, default: "" },
    nextPersonName: { type: String, trim: true, maxlength: 120, default: "" },
    staffSignature: { type: String, trim: true, maxlength: 300, default: "" },
    nextSignature: { type: String, trim: true, maxlength: 300, default: "" },
    scanPath: { type: String, trim: true, maxlength: 300, default: "" },
    scanLabel: { type: String, trim: true, maxlength: 160, default: "" },
    latitude: { type: String, trim: true, maxlength: 40, default: "" },
    longitude: { type: String, trim: true, maxlength: 40, default: "" },
    proofNote: { type: String, trim: true, maxlength: 2000, default: "" },
  },
  { timestamps: true }
);

export default mongoose.model("Visit", visitSchema);
