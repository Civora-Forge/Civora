const issues = [];
let nextId = 1;

async function addIssue(issue) {
  const stored = { id: `issue_${nextId++}`, ...issue };
  issues.push(stored);
  return stored;
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

module.exports = { addIssue, getAllIssues, getIssueById, clearIssues };
