const { z } = require("zod");

const CATEGORIES = ["roads", "schools", "health", "sanitation", "livelihood", "other"];

const issueSchema = z.object({
  text: z
    .string()
    .min(1, "text is required")
    .min(5, "text must be at least 5 characters"),
  language: z.string().min(1, "language is required"),
  latitude: z.number().min(-90).max(90, "latitude must be between -90 and 90"),
  longitude: z.number().min(-180).max(180, "longitude must be between -180 and 180"),
  createdAt: z.string().refine((val) => !isNaN(Date.parse(val)), "createdAt must be a valid date"),
  photoUrl: z.string().optional().default(""),
  audioUrl: z.string().optional().default(""),
  categoryHint: z.enum(CATEGORIES).optional().default("other"),
});

function validateIssueInput(data) {
  const result = issueSchema.safeParse(data);
  if (result.success) {
    return { valid: true, data: result.data };
  }
  const details = result.error.issues.map((issue) => ({
    field: issue.path.join("."),
    message: issue.message,
  }));
  return { valid: false, details };
}

module.exports = { validateIssueInput, CATEGORIES };
