const issues = [];
let nextId = 1;

function addIssue(issue) {
  const stored = { id: `issue_${nextId++}`, ...issue };
  issues.push(stored);
  return stored;
}

function getAllIssues() {
  return issues;
}

function clearIssues() {
  issues.length = 0;
  nextId = 1;
}

module.exports = { addIssue, getAllIssues, clearIssues };
