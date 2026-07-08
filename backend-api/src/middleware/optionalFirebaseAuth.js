const { env } = require("../config/env");

let admin = null;

function getFirebaseAdmin() {
  if (!env.ENABLE_FIREBASE_AUTH) return null;
  if (admin) return admin;

  try {
    // Lazy-load firebase-admin only when auth is enabled
    // eslint-disable-next-line global-require
    admin = require("firebase-admin");

    if (!admin.apps.length) {
      const projectId = env.FIREBASE_PROJECT_ID;
      if (projectId) {
        admin.initializeApp({ projectId });
        console.log(`Firebase Admin initialized for project: ${projectId}`);
      } else {
        admin.initializeApp();
        console.log("Firebase Admin initialized (default credentials)");
      }
    }

    return admin;
  } catch (err) {
    console.warn("Firebase Auth enabled but firebase-admin not available:", err.message);
    console.warn("Auth will be disabled for this session.");
    return null;
  }
}

/**
 * Optional Firebase Auth middleware.
 * - If ENABLE_FIREBASE_AUTH is false, does nothing.
 * - If enabled and Authorization header exists, verifies the Firebase ID token.
 * - Attaches req.user = { uid, email, phoneNumber } if valid.
 * - Invalid/missing tokens do NOT reject the request (for POST /issues).
 */
async function optionalFirebaseAuth(req, res, next) {
  if (!env.ENABLE_FIREBASE_AUTH) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.split("Bearer ")[1];
  if (!token) {
    return next();
  }

  const firebaseAdmin = getFirebaseAdmin();
  if (!firebaseAdmin) {
    return next();
  }

  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(token);
    req.user = {
      uid: decodedToken.uid,
      email: decodedToken.email || null,
      phoneNumber: decodedToken.phone_number || null,
    };
  } catch (err) {
    // Invalid token — do not reject, just proceed without user
    console.warn("Invalid Firebase token:", err.message);
  }

  return next();
}

module.exports = { optionalFirebaseAuth };
