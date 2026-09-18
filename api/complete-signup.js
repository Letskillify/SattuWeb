import crypto from "crypto";
import { adminAuth, adminDb, isFirebaseAdminAvailable } from "./lib/firebaseAdmin.js";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,PATCH,DELETE,POST,PUT");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version"
  );

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    const { email, verifiedToken, password, displayName } = req.body || {};
    if (!email || !verifiedToken) {
      return res.status(400).json({ error: "Email and verification token are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const serverSecret = process.env.OTP_SECRET || "vedamya_otp_secret_key_2026";
    const expectedToken = crypto.createHash("sha256").update(`${normalizedEmail}:${serverSecret}:verified`).digest("hex");

    if (verifiedToken !== expectedToken) {
      return res.status(400).json({ error: "Invalid or expired session. Please verify your email again." });
    }

    if (password && (typeof password !== "string" || password.length < 8)) {
      return res.status(400).json({ error: "Password must be at least 8 characters long" });
    }

    let customToken = null;

    if (isFirebaseAdminAvailable) {
      let existingUser = null;
      try {
        existingUser = await adminAuth.getUserByEmail(normalizedEmail);
      } catch (e) {
        // expected if user doesn't exist
      }

      let userRecord;
      if (existingUser) {
        userRecord = existingUser;
        if (password) {
          await adminAuth.updateUser(userRecord.uid, { password });
        }
      } else {
        userRecord = await adminAuth.createUser({
          email: normalizedEmail,
          emailVerified: true,
          password: password || undefined,
          displayName: displayName || ""
        });
      }

      const userDocRef = adminDb.collection("users").doc(userRecord.uid);
      const existingDoc = await userDocRef.get();
      
      if (!existingDoc.exists) {
        await userDocRef.set({
          uid: userRecord.uid,
          email: normalizedEmail,
          displayName: displayName || userRecord.displayName || "",
          phone: "",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          authProvider: "otp",
          hasPassword: !!password
        });
      } else {
        await userDocRef.set({
          hasPassword: !!password || existingDoc.data().hasPassword || false,
          updatedAt: new Date().toISOString()
        }, { merge: true });
      }

      customToken = await adminAuth.createCustomToken(userRecord.uid);
    } else {
      console.warn("⚠️ [Dev Mode]: Firebase Admin unavailable. Generating dev fallback token.");
      customToken = "dev_token_" + Date.now();
    }

    return res.status(200).json({
      success: true,
      customToken,
      email: normalizedEmail,
      message: "Account created successfully"
    });
  } catch (error) {
    console.error("Error in /api/complete-signup:", error);
    return res.status(500).json({ error: error.message || "Failed to complete account registration." });
  }
}
