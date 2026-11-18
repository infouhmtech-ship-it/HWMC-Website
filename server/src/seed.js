import bcrypt from "bcryptjs";
import User from "./models/User.js";

export const desks = [
  { name: "Sarfraz Ahmed", email: "owner@hwmc.local", role: "owner", password: "owner123" },
  { name: "Marketing desk", email: "marketing@hwmc.local", role: "marketing", password: "marketing123" },
  { name: "PPRA desk", email: "tenders@hwmc.local", role: "tender", password: "tender123" },
  { name: "Operations desk", email: "operations@hwmc.local", role: "operations", password: "operations123" },
  { name: "Field crew", email: "field@hwmc.local", role: "field", password: "field123" },
  { name: "Collector", email: "collector@hwmc.local", role: "field", password: "collector123" },
  { name: "Finance desk", email: "finance@hwmc.local", role: "finance", password: "finance123" },
];

export async function seedPortal() {
  for (const desk of desks) {
    const email = desk.email.toLowerCase();
    const exists = await User.findOne({ email });
    if (exists) continue;
    await User.create({
      name: desk.name,
      email,
      role: desk.role,
      passwordHash: await bcrypt.hash(desk.password, 10),
    });
  }
}
