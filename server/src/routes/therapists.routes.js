import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// securitate: terapeutul logat trebuie să fie același cu therapistId din URL
function requireSameTherapist(req, res, next) {
  const therapistId = Number(req.params.therapistId);
  if (Number.isNaN(therapistId)) {
    return res.status(400).json({ message: "Invalid therapistId" });
  }
  if (req.user.id !== therapistId) {
    return res.status(403).json({ message: "Forbidden" });
  }
  return next();
}

export default router;
