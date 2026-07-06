const { addIssue, getAllIssues, getIssueById, clearIssues } = require("./inMemoryIssueRepository");

let firestoreRepo = null;

function getRepository() {
  const mode = process.env.ISSUE_REPOSITORY || "memory";

  if (mode === "firestore") {
    if (!firestoreRepo) {
      firestoreRepo = require("./firestoreIssueRepository");
    }
    return firestoreRepo;
  }

  return { addIssue, getAllIssues, getIssueById, clearIssues };
}

module.exports = { getRepository };
