const issues = [];
let nextId = 1;

async function addIssue(issue) {
  const stored = { id: `issue_${nextId++}`, ...issue };
  issues.push(stored);
  return stored;
}

async function updateIssue(id, patch) {
  const index = issues.findIndex((issue) => issue.id === id);
  if (index === -1) {
    return null;
  }

  issues[index] = { ...issues[index], ...patch, id };
  return issues[index];
}

async function getAllIssues() {
  return issues;
}

async function getIssueById(id) {
  return issues.find((i) => i.id === id);
}

async function clearIssues() {
  issues.length = 0;
  nextId = 1;
}

async function getIssuesByUserId(userId) {
  return issues.filter((issue) => issue.userId === userId);
}

module.exports = { addIssue, updateIssue, getAllIssues, getIssueById, clearIssues, getIssuesByUserId };
