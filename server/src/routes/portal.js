import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { Router } from "express";
import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Tender from "../models/Tender.js";
import Lead from "../models/Lead.js";
import Project from "../models/Project.js";
import Visit from "../models/Visit.js";
import Invoice from "../models/Invoice.js";
import Notice from "../models/Notice.js";
import { allow, requireAuth, requireDb, signUser } from "../auth.js";
import { desks } from "../seed.js";

const router = Router();
const uploadRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "../../uploads");
const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function text(value, max) {
  return String(value ?? "").trim().slice(0, max);
}

function todayStamp() {
  const now = new Date();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${now.getFullYear()}-${month}-${day}`;
}

function weekRange(date = new Date()) {
  const start = new Date(date);
  const day = start.getDay();
  start.setDate(start.getDate() + (day === 0 ? -6 : 1 - day));
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  const stamp = (value) => {
    const month = String(value.getMonth() + 1).padStart(2, "0");
    const dayOfMonth = String(value.getDate()).padStart(2, "0");
    return `${value.getFullYear()}-${month}-${dayOfMonth}`;
  };
  return { start: stamp(start), end: stamp(end) };
}

function whatsAppNumber(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (digits.startsWith("0")) return `92${digits.slice(1)}`;
  return digits;
}

function dueToday(project, dayName) {
  const days = project.scheduleDays || [];
  if (project.frequency === "daily") return true;
  if (days.includes(dayName)) return true;
  return days.length === 0;
}

function visitView(visit) {
  const row = typeof visit.toObject === "function" ? visit.toObject() : visit;
  return {
    _id: row._id,
    project: row.project,
    visitDate: row.visitDate,
    collectedTime: row.collectedTime || "",
    staffName: row.staffName || "",
    status: row.status,
    signatureName: row.signatureName || "",
    nextPersonName: row.nextPersonName || "",
    latitude: row.latitude || "",
    longitude: row.longitude || "",
    proofNote: row.proofNote || "",
    proof: {
      staff: Boolean(row.staffSignature),
      next: Boolean(row.nextSignature),
      scan: Boolean(row.scanPath),
      scanLabel: row.scanLabel || "",
    },
  };
}

function stopView(project) {
  return {
    _id: project._id,
    code: project.code,
    clientName: project.clientName,
    site: project.site,
    city: project.city,
    service: project.service,
    frequency: project.frequency,
    scheduleDays: project.scheduleDays,
    staffName: project.staffName,
    vehicle: project.vehicle,
    routeNotes: project.routeNotes,
    unscheduled: project.frequency !== "daily" && !(project.scheduleDays || []).length,
  };
}

function readProof(stored) {
  if (!stored || stored.includes("..")) return null;
  const full = path.resolve(uploadRoot, ...String(stored).split("/"));
  const relative = path.relative(uploadRoot, full);
  if (relative.startsWith("..") || path.isAbsolute(relative)) return null;
  if (!fs.existsSync(full)) return null;
  return full;
}

function saveProof(dataUrl, folder, name) {
  if (!dataUrl) return "";
  const match = /^data:(image\/(?:png|jpeg|webp)|application\/pdf);base64,([A-Za-z0-9+/=\r\n]+)$/.exec(String(dataUrl));
  if (!match) {
    const error = new Error("The signature or scanned page could not be read. Use a photo or a PDF.");
    error.status = 400;
    throw error;
  }
  const buffer = Buffer.from(match[2], "base64");
  if (!buffer.length || buffer.length > 6 * 1024 * 1024) {
    const error = new Error("That page must be a photo or PDF under 6 MB.");
    error.status = 400;
    throw error;
  }
  const ext = match[1] === "application/pdf" ? "pdf" : match[1] === "image/jpeg" ? "jpg" : match[1].split("/")[1];
  const dir = path.join(uploadRoot, folder);
  fs.mkdirSync(dir, { recursive: true });
  const filename = `${name}.${ext}`;
  fs.writeFileSync(path.join(dir, filename), buffer);
  return `${folder}/${filename}`;
}

function replaceProof(current, dataUrl, folder, name) {
  if (!dataUrl) return current || "";
  const saved = saveProof(dataUrl, folder, name);
  if (current && current !== saved) {
    const previous = readProof(current);
    if (previous) fs.unlinkSync(previous);
  }
  return saved;
}

async function notify(title, body, roles) {
  await Notice.create({ title, body, roles });
}

async function openLeadFromTender(tender) {
  if (tender.status !== "submitted") return null;
  const existing = await Lead.findOne({ tender: tender._id });
  if (existing) return existing;
  const lead = await Lead.create({
    source: "ppra",
    tender: tender._id,
    clientName: tender.organisation,
    site: tender.title,
    service: tender.category,
    notes: `Opened automatically because tender ${tender.reference} is Submitted on the PPRA portal.`,
  });
  await notify(
    "New lead from a submitted tender",
    `${tender.reference} for ${tender.organisation} is now a lead waiting for review.`,
    ["owner", "marketing", "tender"]
  );
  return lead;
}

router.get("/desks", (_req, res) => {
  if (process.env.NODE_ENV === "production") return res.status(404).end();
  res.json(desks.map(({ name, email, role, password }) => ({ name, email, role, password })));
});

router.post("/login", requireDb, async (req, res) => {
  const email = text(req.body?.email, 160).toLowerCase();
  const password = String(req.body?.password ?? "");
  const user = await User.findOne({ email });
  if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
    return res.status(401).json({ message: "That email or password is not recognised." });
  }
  res.json({
    token: signUser(user),
    user: { id: user._id, name: user.name, email: user.email, role: user.role },
  });
});

router.use(requireDb, requireAuth);

router.get("/me", async (req, res) => {
  const user = await User.findById(req.user.sub).select("name email role");
  if (!user) return res.status(401).json({ message: "Sign in required." });
  res.json({ id: user._id, name: user.name, email: user.email, role: user.role });
});

router.get("/dashboard", async (_req, res) => {
  const today = todayStamp();
  const week = weekRange();
  const [tenders, leadsWaiting, projectsSetup, projectsActive, visitsToday, invoicesOpen, commissionDue, notices] = await Promise.all([
    Tender.countDocuments({ status: { $ne: "closed" } }),
    Lead.countDocuments({ status: { $in: ["new", "qualified"] } }),
    Project.countDocuments({ status: "setup" }),
    Project.countDocuments({ status: "active" }),
    Visit.countDocuments({ visitDate: today, status: "done" }),
    Invoice.countDocuments({ status: { $in: ["draft", "sent"] } }),
    Invoice.aggregate([
      { $match: { status: { $ne: "paid" } } },
      { $group: { _id: null, total: { $sum: "$commissionAmount" } } },
    ]),
    Notice.find().sort({ createdAt: -1 }).limit(6),
  ]);
  res.json({
    today,
    week,
    counts: {
      tenders,
      leadsWaiting,
      projectsSetup,
      projectsActive,
      visitsToday,
      invoicesOpen,
      commissionDue: commissionDue[0]?.total || 0,
    },
    notices,
  });
});

router.get("/tenders", allow("tender", "marketing"), async (_req, res) => {
  res.json(await Tender.find().sort({ createdAt: -1 }));
});

router.post("/tenders", allow("tender"), async (req, res) => {
  const reference = text(req.body?.reference, 80);
  const title = text(req.body?.title, 200);
  const organisation = text(req.body?.organisation, 160);
  if (!reference || !title || !organisation) {
    return res.status(400).json({ message: "Reference, title, and organisation are required." });
  }
  const tender = await Tender.create({
    reference,
    title,
    organisation,
    category: text(req.body?.category, 80) || "Waste collection",
    notes: text(req.body?.notes, 2000),
    status: "watching",
  });
  res.status(201).json(tender);
});

router.patch("/tenders/:id", allow("tender"), async (req, res) => {
  const status = text(req.body?.status, 20);
  if (!["watching", "submitted", "closed"].includes(status)) {
    return res.status(400).json({ message: "Choose a tender status." });
  }
  const tender = await Tender.findByIdAndUpdate(req.params.id, { status }, { new: true });
  if (!tender) return res.status(404).json({ message: "Tender not found." });
  const lead = await openLeadFromTender(tender);
  res.json({ tender, lead });
});

router.get("/leads", allow("tender", "marketing"), async (_req, res) => {
  res.json(await Lead.find().populate("tender", "reference title").sort({ createdAt: -1 }));
});

router.post("/leads", allow("tender", "marketing"), async (req, res) => {
  const clientName = text(req.body?.clientName, 160);
  if (!clientName) return res.status(400).json({ message: "The client name is required." });
  const source = text(req.body?.source, 20);
  const lead = await Lead.create({
    source: ["manual", "whatsapp", "call", "walk-in"].includes(source) ? source : "manual",
    clientName,
    contactName: text(req.body?.contactName, 120),
    phone: text(req.body?.phone, 40),
    site: text(req.body?.site, 300),
    city: text(req.body?.city, 80) || "Lahore",
    service: text(req.body?.service, 120) || "Waste collection",
    notes: text(req.body?.notes, 2000),
    status: "new",
  });
  res.status(201).json(lead);
});

router.post("/leads/:id/qualify", allow("marketing"), async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found." });
  if (lead.status === "approved" || lead.status === "rejected") {
    return res.status(400).json({ message: "This lead is already closed." });
  }
  lead.status = "qualified";
  lead.notes = text(req.body?.notes, 2000) || lead.notes;
  await lead.save();
  await notify(
    "Lead ready for approval",
    `${lead.clientName} has been qualified and is waiting for administration.`,
    ["owner", "marketing"]
  );
  res.json(lead);
});

router.post("/leads/:id/approve", allow(), async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found." });
  if (lead.status === "approved") return res.status(400).json({ message: "This lead already has a project." });
  if (lead.status === "rejected") return res.status(400).json({ message: "This lead was rejected." });
  const count = await Project.countDocuments();
  const project = await Project.create({
    lead: lead._id,
    code: `HWM-${String(count + 1).padStart(3, "0")}`,
    clientName: lead.clientName,
    contactName: lead.contactName,
    phone: lead.phone,
    site: lead.site,
    city: lead.city,
    service: lead.service,
    marketingName: req.user.name,
  });
  lead.status = "approved";
  lead.project = project._id;
  await lead.save();
  await notify(
    `Project ${project.code} opened`,
    `${project.clientName} is approved. Marketing, operations, field, and finance have a new project to set up.`,
    ["owner", "marketing", "operations", "field", "finance"]
  );
  res.json({ lead, project });
});

router.post("/leads/:id/reject", allow(), async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) return res.status(404).json({ message: "Lead not found." });
  if (lead.status === "approved") return res.status(400).json({ message: "An approved lead stays with its project." });
  lead.status = "rejected";
  lead.notes = text(req.body?.notes, 2000) || lead.notes;
  await lead.save();
  res.json(lead);
});

router.get("/projects", allow("marketing", "operations", "finance", "field"), async (req, res) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  if (req.user.role === "field") {
    return res.json(projects.map((project) => ({
      _id: project._id,
      code: project.code,
      clientName: project.clientName,
      site: project.site,
      frequency: project.frequency,
      staffName: project.staffName,
      status: project.status,
    })));
  }
  res.json(projects);
});

router.get("/projects/:id", allow("marketing", "operations", "finance", "field"), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found." });
  const [visits, invoices] = await Promise.all([
    Visit.find({ project: project._id }).sort({ visitDate: -1, createdAt: -1 }),
    Invoice.find({ project: project._id }).sort({ periodStart: -1 }),
  ]);
  if (req.user.role === "field") {
    return res.json({
      project: stopView(project),
      visits: visits.map(visitView),
      invoices: [],
    });
  }
  res.json({ project, visits: visits.map(visitView), invoices });
});

router.patch("/projects/:id", allow("marketing", "operations"), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found." });
  const frequency = text(req.body?.frequency, 20);
  const planType = text(req.body?.planType, 20);
  const contractStatus = text(req.body?.contractStatus, 20);
  const status = text(req.body?.status, 20);
  if (["", "daily", "weekly", "monthly"].includes(frequency)) project.frequency = frequency;
  if (["regular", "specific", "custom"].includes(planType)) project.planType = planType;
  if (["draft", "agreed"].includes(contractStatus)) project.contractStatus = contractStatus;
  if (["setup", "active", "paused"].includes(status)) project.status = status;
  if (Array.isArray(req.body?.scheduleDays)) {
    project.scheduleDays = req.body.scheduleDays.map((day) => text(day, 12)).filter(Boolean).slice(0, 7);
  }
  const rate = Number(req.body?.weeklyRate);
  if (Number.isFinite(rate) && rate >= 0) project.weeklyRate = rate;
  project.contractNotes = text(req.body?.contractNotes, 2000);
  project.phone = text(req.body?.phone, 40);
  project.staffName = text(req.body?.staffName, 120);
  project.vehicle = text(req.body?.vehicle, 120);
  project.routeNotes = text(req.body?.routeNotes, 2000);
  await project.save();
  res.json(project);
});

router.post("/projects/:id/notify", allow("operations", "marketing"), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "Project not found." });
  await notify(
    `${project.code} is ready for the teams`,
    `${project.clientName} at ${project.site || "the site"}. Frequency: ${project.frequency || "not set"}. Staff: ${project.staffName || "not assigned"}. Vehicle: ${project.vehicle || "not assigned"}.`,
    ["owner", "marketing", "operations", "field", "finance"]
  );
  res.json({ ok: true });
});

router.get("/today", allow("operations", "field"), async (_req, res) => {
  const today = todayStamp();
  const dayName = dayNames[new Date().getDay()];
  const projects = await Project.find({ status: "active" }).sort({ clientName: 1 });
  const visits = await Visit.find({ visitDate: today, project: { $in: projects.map((project) => project._id) } });
  const byProject = new Map(visits.map((visit) => [String(visit.project), visit]));
  const due = projects.filter((project) => dueToday(project, dayName));
  const later = projects.filter((project) => !dueToday(project, dayName));
  const visitFor = (project) => {
    const visit = byProject.get(String(project._id));
    return visit ? visitView(visit) : null;
  };
  res.json({
    today,
    dayName,
    stops: due.map((project) => ({ ...stopView(project), visit: visitFor(project) })),
    later: later.map((project) => ({ ...stopView(project), visit: visitFor(project) })),
  });
});

router.get("/stops/:id", allow("operations", "field"), async (req, res) => {
  const project = await Project.findById(req.params.id);
  if (!project) return res.status(404).json({ message: "That stop was not found." });
  const visitDate = text(req.query.date, 10) || todayStamp();
  const visit = await Visit.findOne({ project: project._id, visitDate });
  res.json({ stop: stopView(project), visit: visit ? visitView(visit) : null });
});

router.post("/handover", allow("operations", "field"), async (req, res) => {
  try {
    const project = await Project.findById(req.body?.project);
    if (!project) return res.status(400).json({ message: "Choose the stop you collected." });
    const visitDate = text(req.body?.visitDate, 10);
    const collectedTime = text(req.body?.collectedTime, 8).slice(0, 5);
    const nextPersonName = text(req.body?.nextPersonName, 120);
    if (!/^\d{4}-\d{2}-\d{2}$/.test(visitDate)) return res.status(400).json({ message: "Choose the collection date." });
    if (!/^\d{2}:\d{2}$/.test(collectedTime)) return res.status(400).json({ message: "Choose the collection time." });
    if (!nextPersonName) return res.status(400).json({ message: "Enter the name of the next person." });
    let visit = await Visit.findOne({ project: project._id, visitDate });
    if (visit && req.user.role === "field") {
      return res.status(400).json({ message: "This collection is already saved and cannot be changed." });
    }
    if (!visit) visit = new Visit({ project: project._id, visitDate });
    const folder = `${project._id}-${visitDate}`;
    visit.collectedTime = collectedTime;
    visit.staffName = text(req.user.name, 120) || project.staffName;
    visit.status = "done";
    visit.nextPersonName = nextPersonName;
    visit.signatureName = nextPersonName;
    visit.proofNote = text(req.body?.proofNote, 2000);
    visit.staffSignature = replaceProof(visit.staffSignature, req.body?.staffSignature, folder, "staff");
    visit.nextSignature = replaceProof(visit.nextSignature, req.body?.nextSignature, folder, "next");
    visit.scanPath = replaceProof(visit.scanPath, req.body?.scan, folder, "scan");
    if (req.body?.scan) visit.scanLabel = text(req.body?.scanLabel, 160);
    await visit.save();
    res.status(201).json(visitView(visit));
  } catch (error) {
    if (error.status === 400) return res.status(400).json({ message: error.message });
    console.error(error);
    res.status(500).json({ message: "The collection could not be saved." });
  }
});

router.get("/visits/:id/file/:kind", allow("operations", "field"), async (req, res) => {
  const kinds = { staff: "staffSignature", next: "nextSignature", scan: "scanPath" };
  const field = kinds[req.params.kind];
  if (!field) return res.status(404).end();
  const visit = await Visit.findById(req.params.id);
  if (!visit?.[field]) return res.status(404).end();
  const full = readProof(visit[field]);
  if (!full) return res.status(404).end();
  res.sendFile(full);
});

router.get("/visits", allow("operations", "field"), async (_req, res) => {
  const visits = await Visit.find().populate("project", "code clientName site").sort({ visitDate: -1, createdAt: -1 }).limit(80);
  res.json(visits.map(visitView));
});

router.post("/visits", allow("operations", "field"), async (req, res) => {
  const project = await Project.findById(req.body?.project);
  if (!project) return res.status(400).json({ message: "Choose a project." });
  const visitDate = text(req.body?.visitDate, 10) || todayStamp();
  if (req.user.role === "field") {
    const existing = await Visit.findOne({ project: project._id, visitDate });
    if (existing) return res.status(400).json({ message: "This collection is already saved and cannot be changed." });
  }
  const status = text(req.body?.status, 20);
  const visit = await Visit.create({
    project: project._id,
    visitDate,
    staffName: text(req.body?.staffName, 120) || project.staffName,
    status: ["scheduled", "done", "missed"].includes(status) ? status : "done",
    signatureName: text(req.body?.signatureName, 120),
    latitude: text(req.body?.latitude, 40),
    longitude: text(req.body?.longitude, 40),
    proofNote: text(req.body?.proofNote, 2000),
  });
  res.status(201).json(visitView(visit));
});

router.get("/invoices", allow("finance", "marketing"), async (_req, res) => {
  const invoices = await Invoice.find().populate("project", "code clientName phone service").sort({ periodStart: -1, createdAt: -1 });
  res.json(invoices);
});

router.post("/invoices/generate", allow("finance"), async (_req, res) => {
  const week = weekRange();
  const projects = await Project.find({ status: "active" });
  const created = [];
  const skipped = [];
  for (const project of projects) {
    if (!project.weeklyRate) {
      skipped.push({ client: project.clientName, reason: "No weekly rate" });
      continue;
    }
    const exists = await Invoice.findOne({ project: project._id, periodStart: week.start });
    if (exists) {
      skipped.push({ client: project.clientName, reason: "Already invoiced this week" });
      continue;
    }
    const invoice = await Invoice.create({
      project: project._id,
      periodStart: week.start,
      periodEnd: week.end,
      amount: project.weeklyRate,
      commissionAmount: Math.round(project.weeklyRate * project.commissionRate),
      status: "draft",
    });
    created.push(invoice);
  }
  if (created.length) {
    await notify(
      "Weekly invoices are ready",
      `${created.length} invoice${created.length === 1 ? "" : "s"} drafted for ${week.start} to ${week.end}.`,
      ["owner", "finance", "marketing"]
    );
  }
  res.json({ created: created.length, skipped, week });
});

router.post("/invoices/:id/sent", allow("finance"), async (req, res) => {
  const invoice = await Invoice.findById(req.params.id).populate("project");
  if (!invoice) return res.status(404).json({ message: "Invoice not found." });
  invoice.status = invoice.status === "paid" ? "paid" : "sent";
  await invoice.save();
  const project = invoice.project;
  const lines = [
    "Weekly invoice from Hygienic Waste Management",
    `Client: ${project.clientName}`,
    `Site: ${project.site || "—"}`,
    `Service: ${project.service || "—"}`,
    `Period: ${invoice.periodStart} to ${invoice.periodEnd}`,
    `Amount: Rs ${invoice.amount.toLocaleString("en-PK")}`,
  ];
  const number = whatsAppNumber(project.phone);
  const url = number
    ? `https://wa.me/${number}?text=${encodeURIComponent(lines.join("\n"))}`
    : "";
  res.json({ invoice, url });
});

router.post("/invoices/:id/paid", allow("finance"), async (req, res) => {
  const invoice = await Invoice.findByIdAndUpdate(req.params.id, { status: "paid" }, { new: true });
  if (!invoice) return res.status(404).json({ message: "Invoice not found." });
  res.json(invoice);
});

router.get("/notices", async (req, res) => {
  const notices = await Notice.find({ roles: req.user.role }).sort({ createdAt: -1 }).limit(40);
  res.json(notices);
});

export default router;
