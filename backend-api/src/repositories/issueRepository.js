const { addIssue, updateIssue, getAllIssues, getIssueById, clearIssues, getIssuesByUserId } = require("./inMemoryIssueRepository");

let firestoreRepo = null;

function getRepository() {
  const mode = process.env.ISSUE_REPOSITORY || "memory";

  if (mode === "firestore") {
    if (!firestoreRepo) {
      firestoreRepo = require("./firestoreIssueRepository");
    }
    return firestoreRepo;
  }

  return { addIssue, updateIssue, getAllIssues, getIssueById, clearIssues, getIssuesByUserId };
}

module.exports = { getRepository };
