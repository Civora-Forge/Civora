import { openDB, DBSchema, IDBPDatabase } from 'idb';
import { DraftReport, PendingSubmission } from '../types/domain';

interface CivoraDB extends DBSchema {
  drafts: {
    key: string;
    value: DraftReport & { id: string };
  };
  pendingSubmissions: {
    key: string;
    value: PendingSubmission;
  };
}

let dbPromise: Promise<IDBPDatabase<CivoraDB>> | null = null;

export function getDB() {
  if (!dbPromise) {
    dbPromise = openDB<CivoraDB>('civora-db', 1, {
      upgrade(db) {
        db.createObjectStore('drafts', { keyPath: 'id' });
        db.createObjectStore('pendingSubmissions', { keyPath: 'id' });
      },
    });
  }
  return dbPromise;
}

export async function saveDraft(id: string, draft: DraftReport) {
  const db = await getDB();
  await db.put('drafts', { ...draft, id });
}

export async function getDraft(id: string): Promise<DraftReport | undefined> {
  const db = await getDB();
  return db.get('drafts', id);
}

export async function clearDraft(id: string) {
  const db = await getDB();
  await db.delete('drafts', id);
}

export async function savePendingSubmission(submission: PendingSubmission) {
  const db = await getDB();
  await db.put('pendingSubmissions', submission);
}

export async function getPendingSubmissions(): Promise<PendingSubmission[]> {
  const db = await getDB();
  return db.getAll('pendingSubmissions');
}

export async function removePendingSubmission(id: string) {
  const db = await getDB();
  await db.delete('pendingSubmissions', id);
}
