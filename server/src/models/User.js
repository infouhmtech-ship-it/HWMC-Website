import mongoose from "mongoose";

const roles = ["owner", "marketing", "tender", "operations", "field", "finance"];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, maxlength: 160 },
    passwordHash: { type: String, required: true },
    role: { type: String, required: true, enum: roles },
  },
  { timestamps: true }
);

export default mongoose.model("User", userSchema);
