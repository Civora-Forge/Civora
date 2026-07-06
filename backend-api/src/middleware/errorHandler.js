function errorHandler(err, req, res, next) {
  console.error("Unhandled error:", err);
  res.status(500).json({
    ok: false,
    error: {
      code: "INTERNAL_ERROR",
      message: "Something went wrong",
    },
  });
}

module.exports = { errorHandler };
