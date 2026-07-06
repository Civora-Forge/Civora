function daysSince(isoDateString) {
  const date = new Date(isoDateString);
  const now = new Date();
  const diffMs = now - date;
  return diffMs / (1000 * 60 * 60 * 24);
}

module.exports = { daysSince };
