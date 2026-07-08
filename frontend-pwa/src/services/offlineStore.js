import { openDB } from "idb";

let dbPromise = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB("civora-db", 1, {
      upgrade(db) {
        db.createObjectStore("drafts", { keyPath: "id" });
        db.createObjectStore("pendingSubmissions", { keyPath: "id" });
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
