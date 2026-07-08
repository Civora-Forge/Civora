const { env } = require("../config/env");

/**
 * Required auth middleware for protected routes.
 * Must be used AFTER optionalFirebaseAuth middleware.
 * Returns 401 if req.user is not set.
 */
function requireAuth(req, res, next) {
  if (!env.ENABLE_FIREBASE_AUTH) {
    return res.status(401).json({
      ok: false,
      error: {
        code: "AUTH_DISABLED",
        message: "Authentication is not enabled on this server",
      },
    });
  }

  if (!req.user || !req.user.uid) {
    return res.status(401).json({
      ok: false,
      error: {
        code: "UNAUTHORIZED",
        message: "Valid Firebase ID token required",
      },
    });
  }

  return next();
}

module.exports = { requireAuth };
