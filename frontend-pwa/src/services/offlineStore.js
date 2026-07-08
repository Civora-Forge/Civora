import { openDB } from "idb";

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("civora-db", 2, {
      upgrade(db, oldVersion) {
        if (oldVersion < 1) {
          db.createObjectStore("drafts", { keyPath: "id" });
          db.createObjectStore("pendingSubmissions", { keyPath: "id" });
        }
        if (oldVersion < 2) {
          db.createObjectStore("completedSubmissions", { keyPath: "localId" });
        }
      },
    });
  }
  return dbPromise;
}

export async function saveDraft(id, draft) {
  const db = await getDB();
  await db.put("drafts", { ...draft, id });
}

export async function getDraft(id) {
  const db = await getDB();
  return db.get("drafts", id);
}

export async function clearDraft(id) {
  const db = await getDB();
  await db.delete("drafts", id);
}

export async function savePendingSubmission(submission) {
  const db = await getDB();
  await db.put("pendingSubmissions", submission);
}

export async function getPendingSubmissions() {
  const db = await getDB();
  return db.getAll("pendingSubmissions");
}

export async function removePendingSubmission(id) {
  const db = await getDB();
  await db.delete("pendingSubmissions", id);
}

export async function saveCompletedSubmission(submission) {
  const db = await getDB();
  await db.put("completedSubmissions", submission);
}

export async function getCompletedSubmissions() {
  const db = await getDB();
  return db.getAll("completedSubmissions");
}

export async function clearCompletedSubmissions() {
  const db = await getDB();
  await db.clear("completedSubmissions");
}
