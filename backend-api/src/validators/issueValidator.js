function validateRawIssue(rawIssue) {
  if (!rawIssue || typeof rawIssue !== "object") {
    return { valid: false, error: "request body must be a JSON object" };
  }

  if (!rawIssue.text || typeof rawIssue.text !== "string" || rawIssue.text.trim().length === 0) {
    return { valid: false, error: "text is required" };
  }

  if (!rawIssue.language || typeof rawIssue.language !== "string") {
    return { valid: false, error: "language is required" };
  }

  if (rawIssue.latitude === undefined || rawIssue.latitude === null) {
    return { valid: false, error: "latitude is required" };
  }

  if (typeof rawIssue.latitude !== "number" || isNaN(rawIssue.latitude)) {
    return { valid: false, error: "latitude must be a number" };
  }

  if (rawIssue.longitude === undefined || rawIssue.longitude === null) {
    return { valid: false, error: "longitude is required" };
  }

  if (typeof rawIssue.longitude !== "number" || isNaN(rawIssue.longitude)) {
    return { valid: false, error: "longitude must be a number" };
  }

  if (!rawIssue.createdAt) {
    return { valid: false, error: "createdAt is required" };
  }

  return { valid: true };
}

module.exports = { validateRawIssue };
