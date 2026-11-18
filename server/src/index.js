import path from "path";
import { fileURLToPath } from "url";
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import mongoose from "mongoose";
import Request from "./models/Request.js";
import portal from "./routes/portal.js";
import { database } from "./db.js";
import { seedPortal } from "./seed.js";

dotenv.config();

const app = express();
const port = Number(process.env.PORT) || 5000;
const mongoUri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/hwmc";
const clientOrigin = process.env.CLIENT_ORIGIN || "http://127.0.0.1:5173";

app.use(cors({ origin: clientOrigin }));
app.use(express.json({ limit: "8mb" }));

function text(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

app.get("/api/health", (_req, res) => {
  res.json({ ok: true, database: database.ready ? "connected" : "unavailable" });
});

app.use("/api/portal", portal);

app.post("/api/requests", async (req, res) => {
  const body = req.body ?? {};
  const payload = {
    name: text(body.name, 120),
    phone: text(body.phone, 40),
    email: text(body.email, 160),
    organisation: text(body.organisation, 160),
    site: text(body.site, 300),
    service: text(body.service, 80),
    timing: text(body.timing, 80),
    details: text(body.details, 2000),
  };

  if (!payload.name || !payload.phone || !payload.site || !payload.service || !payload.timing) {
    return res.status(400).json({ saved: false, message: "Name, phone, site, service, and timing are required." });
  }

  if (!database.ready) {
    return res.status(503).json({ saved: false });
  }

  try {
    await Request.create(payload);
    return res.status(201).json({ saved: true });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ saved: false });
  }
});

if (process.env.NODE_ENV === "production") {
  const dist = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../client/dist");
  app.use(express.static(dist));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(dist, "index.html"));
  });
}

app.listen(port, () => {
  console.log(`API listening on http://127.0.0.1:${port}`);
});

async function connectMongo() {
  try {
    await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
    database.ready = true;
    await seedPortal();
    console.log("MongoDB connected");
  } catch (error) {
    database.ready = false;
    await mongoose.disconnect().catch(() => {});
    console.error("MongoDB is not available. Pickup requests will still open WhatsApp.");
    console.error(error.message);
    setTimeout(connectMongo, 8000);
  }
}

connectMongo();
