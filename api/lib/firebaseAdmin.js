import { initializeApp, getApps, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

let app = null;
let adminAuth = null;
let adminDb = null;
let isFirebaseAdminAvailable = false;

try {
  const projectId = process.env.FIREBASE_PROJECT_ID || "sattu-e679d";
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawPrivateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (clientEmail && rawPrivateKey) {
    if (!getApps().length) {
      const privateKey = rawPrivateKey.replace(/\\n/g, "\n");
      app = initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } else {
      app = getApps()[0];
    }
  } else {
    console.warn(
      "⚠️ [Firebase Admin Notice]: FIREBASE_CLIENT_EMAIL and FIREBASE_PRIVATE_KEY are not set in environment.\n" +
      "Firebase Admin endpoints will use in-memory fallback mode during local development."
    );
  }

  if (app) {
    adminAuth = getAuth(app);
    adminDb = getFirestore(app);
    isFirebaseAdminAvailable = true;
  }
} catch (err) {
  console.warn("⚠️ Firebase Admin Initialization Warning:", err.message);
}

// Fallback Proxy object if Firebase Admin credentials are not present locally
const createFallbackProxy = (name) => new Proxy({}, {
  get(target, prop) {
    if (prop === "then") return undefined;
    return (...args) => {
      console.warn(`[Firebase Admin ${name} Fallback] Method '${String(prop)}' called without credentials.`);
      if (prop === "batch") {
        return {
          update: () => {},
          set: () => {},
          delete: () => {},
          commit: async () => {}
        };
      }
      if (prop === "doc") {
        return {
          get: async () => ({ exists: false, data: () => ({}) }),
          set: async () => {},
          update: async () => {},
          delete: async () => {}
        };
      }
      if (prop === "collection" || prop === "where") {
        const dummyQuery = {
          get: async () => ({ empty: true, docs: [] }),
          where: () => dummyQuery,
          doc: () => ({
            get: async () => ({ exists: false, data: () => ({}) }),
            set: async () => {},
            update: async () => {},
            delete: async () => {}
          }),
          set: async () => {},
          update: async () => {}
        };
        return dummyQuery;
      }
      return Promise.resolve({ docs: [], empty: true, exists: false, data: () => ({}) });
    };
  }
});

if (!adminAuth) {
  adminAuth = createFallbackProxy("Auth");
}

if (!adminDb) {
  adminDb = createFallbackProxy("Firestore");
}

export { adminAuth, adminDb, isFirebaseAdminAvailable };
export default app;
