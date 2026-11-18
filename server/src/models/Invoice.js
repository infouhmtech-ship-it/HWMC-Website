import mongoose from "mongoose";

const invoiceSchema = new mongoose.Schema(
  {
    project: { type: mongoose.Schema.Types.ObjectId, ref: "Project", required: true },
    periodStart: { type: String, required: true },
    periodEnd: { type: String, required: true },
    amount: { type: Number, required: true, min: 0 },
    commissionAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ["draft", "sent", "paid"], default: "draft" },
  },
  { timestamps: true }
);

invoiceSchema.index({ project: 1, periodStart: 1 }, { unique: true });

export default mongoose.model("Invoice", invoiceSchema);
