import jwt from "jsonwebtoken";
import { database } from "./db.js";

function secret() {
  return process.env.PORTAL_JWT_SECRET || "hwmc-local-portal";
}

export function signUser(user) {
  return jwt.sign(
    { sub: user._id.toString(), role: user.role, name: user.name },
    secret(),
    { expiresIn: "12h" }
  );
}

export function requireDb(_req, res, next) {
  if (!database.ready) {
    return res.status(503).json({ message: "MongoDB is not running on this PC." });
  }
  next();
}

export function requireAuth(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token) return res.status(401).json({ message: "Sign in required." });
  try {
    req.user = jwt.verify(token, secret());
    next();
  } catch {
    return res.status(401).json({ message: "Sign in required." });
  }
}

export function allow(...roles) {
  return (req, res, next) => {
    if (req.user.role === "owner" || roles.includes(req.user.role)) return next();
    return res.status(403).json({ message: "This desk cannot do that." });
  };
}
