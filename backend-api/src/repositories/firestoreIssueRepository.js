/**
 * Firestore Issue Repository
 *
 * This module provides Firestore-backed storage for civic issues.
 * It is only active when ISSUE_REPOSITORY=firestore.
 *
 * Requirements for local Firestore usage:
 * - Set GOOGLE_CLOUD_PROJECT in your environment
 * - Either use the Firebase Emulator or provide Google credentials
 * - Install: npm install firebase-admin
 *
 * For local development without credentials, use ISSUE_REPOSITORY=memory.
 */

let admin = null;
let db = null;

function initializeFirebase() {
  if (db) return;

  try {
    admin = require("firebase-admin");

    const projectId = process.env.GOOGLE_CLOUD_PROJECT;
    if (!projectId) {
      throw new Error("GOOGLE_CLOUD_PROJECT is required for Firestore mode");
    }

    admin.initializeApp({
      projectId,
      databaseId: process.env.FIRESTORE_DATABASE_ID || "(default)",
    });

    db = admin.firestore();
    console.log(`Firestore initialized for project: ${projectId}`);
  } catch (err) {
    console.error("Failed to initialize Firestore:", err.message);
    console.log("Falling back to memory mode.");
    process.env.ISSUE_REPOSITORY = "memory";
  }
}

async function addIssue(issue) {
  initializeFirebase();
  if (!db) {
    throw new Error("Firestore not available");
  }

  const docRef = db.collection("issues").doc();
  const stored = { id: docRef.id, ...issue };
  await docRef.set(stored);
  return stored;
}

async function getAllIssues() {
  initializeFirebase();
  if (!db) {
    throw new Error("Firestore not available");
  }

  const snapshot = await db.collection("issues").get();
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
}

async function getIssueById(id) {
  initializeFirebase();
  if (!db) {
    throw new Error("Firestore not available");
  }

  const doc = await db.collection("issues").doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

module.exports = { addIssue, getAllIssues, getIssueById };
