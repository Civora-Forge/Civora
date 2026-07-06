const { validateIssueInput } = require("../schemas/issueSchema");

function validateRawIssue(rawIssue) {
  if (!rawIssue || typeof rawIssue !== "object") {
    return { valid: false, error: "request body must be a JSON object" };
  }

  const result = validateIssueInput(rawIssue);
  if (!result.valid) {
    return { valid: false, error: result.details };
  }

  return { valid: true, data: result.data };
}

module.exports = { validateRawIssue };
