import { adminAuth, adminDb } from "./lib/firebaseAdmin.js";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Authorization, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ error: "Unauthorized. Missing or invalid Authorization header." });
    }

    const idToken = authHeader.split("Bearer ")[1];
    let decodedToken;
    try {
      decodedToken = await adminAuth.verifyIdToken(idToken);
    } catch (err) {
      console.error("Firebase ID Token verification failed:", err);
      return res.status(401).json({ error: "Invalid or expired authentication token." });
    }

    const uid = decodedToken.uid;
    let email = decodedToken.email;

    // If email is missing from decoded token, lookup user record
    if (!email) {
      try {
        const userRecord = await adminAuth.getUser(uid);
        email = userRecord.email;
      } catch (err) {
        console.error("Error looking up Firebase user record:", err);
      }
    }

    if (!email) {
      return res.status(400).json({ error: "No verified email associated with authenticated account." });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // Query for guest orders matching this customer email
    const ordersRef = adminDb.collection("orders");
    const snapshot = await ordersRef.where("customerEmail", "==", normalizedEmail).get();

    if (snapshot.empty) {
      return res.status(200).json({
        success: true,
        linkedCount: 0,
        message: "No eligible guest orders found."
      });
    }

    const batch = adminDb.batch();
    let linkedCount = 0;

    snapshot.docs.forEach((docSnap) => {
      const data = docSnap.data();
      // Only link if order currently has no userId or is marked as guest
      // AND is not already linked to another account
      if ((data.userId === null || data.userId === undefined || data.isGuest === true) && data.userId !== uid) {
        batch.update(docSnap.ref, {
          userId: uid,
          isGuest: false,
          updatedAt: new Date().toISOString()
        });
        linkedCount++;
      }
    });

    if (linkedCount > 0) {
      await batch.commit();
    }

    return res.status(200).json({
      success: true,
      linkedCount,
      message: `Successfully linked ${linkedCount} guest order(s) to account.`
    });
  } catch (error) {
    console.error("Error in /api/link-guest-orders:", error);
    return res.status(500).json({ error: "Failed to link guest orders. Please try again later." });
  }
}
