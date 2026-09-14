import dotenv from "dotenv";
dotenv.config();

// Very simple shared-password gate for admin-only endpoints (editing the
// menu, viewing/updating orders). This is fine for a solo-owner MVP but is
// NOT real authentication — see README "Before you go live" before you
// have staff logins or handle sensitive data.
export function requireAdmin(req, res, next) {
  const provided = req.header("x-admin-password");

  if (!process.env.ADMIN_PASSWORD) {
    return res
      .status(500)
      .json({ error: "Server misconfigured: ADMIN_PASSWORD is not set." });
  }

  if (provided !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ error: "Invalid admin password." });
  }

  next();
}
