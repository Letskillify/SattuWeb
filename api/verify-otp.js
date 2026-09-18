import crypto from "crypto";
import { adminAuth, adminDb, isFirebaseAdminAvailable } from "./lib/firebaseAdmin.js";
import { memOtpStore } from "./send-otp.js";

async function getOtpDoc(emailHash) {
  if (!isFirebaseAdminAvailable) {
    const data = memOtpStore.get(emailHash);
    return {
      exists: !!data,
      data: () => data || null,
      ref: null,
      _useFirestore: false
    };
  }

  try {
    const ref = adminDb.collection("otpVerifications").doc(emailHash);
    const snap = await ref.get();
    const exists = snap.exists === true;
    return {
      exists,
      data: () => (exists ? snap.data() : null),
      ref,
      _useFirestore: true
    };
  } catch (e) {
    const data = memOtpStore.get(emailHash);
    return {
      exists: !!data,
      data: () => data || null,
      ref: null,
      _useFirestore: false
    };
  }
}

async function updateOtpDoc(emailHash, ref, useFirestore, fields) {
  if (useFirestore && ref && isFirebaseAdminAvailable) {
    try {
      await ref.update(fields);
      return;
    } catch (e) { /* fall through */ }
  }
  const existing = memOtpStore.get(emailHash) || {};
  memOtpStore.set(emailHash, { ...existing, ...fields });
}

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
    const { email, otp } = req.body || {};
    if (!email || !otp) {
      return res.status(400).json({ error: "Email and verification code are required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const cleanOtp = otp.toString().trim();

    if (cleanOtp.length !== 6 || !/^\d{6}$/.test(cleanOtp)) {
      return res.status(400).json({ error: "Verification code must be 6 digits" });
    }

    const emailHash = crypto.createHash("sha256").update(normalizedEmail).digest("hex");
    const otpDoc = await getOtpDoc(emailHash);

    if (!otpDoc.exists) {
      return res.status(400).json({ error: "No verification code found. Please request a new code." });
    }

    const data = otpDoc.data();
    const now = Date.now();

    if (!data || now > data.expiresAt) {
      return res.status(400).json({ error: "This code has expired. Please request a new code." });
    }

    if ((data.attempts || 0) >= 5) {
      return res.status(400).json({ error: "Too many failed attempts. Please request a new code." });
    }

    const serverSecret = process.env.OTP_SECRET || "vedamya_otp_secret_key_2026";
    const otpHashInput = crypto.createHash("sha256").update(`${normalizedEmail}:${cleanOtp}:${serverSecret}`).digest("hex");

    if (otpHashInput !== data.otpHash) {
      const newAttempts = (data.attempts || 0) + 1;
      await updateOtpDoc(emailHash, otpDoc.ref, otpDoc._useFirestore, { attempts: newAttempts });
      
      if (newAttempts >= 5) {
        return res.status(400).json({ error: "Too many failed attempts. Please request a new code." });
      }
      return res.status(400).json({ error: "Invalid verification code. Please try again." });
    }

    // Mark OTP as verified and invalidate hash
    await updateOtpDoc(emailHash, otpDoc.ref, otpDoc._useFirestore, { verified: true, otpHash: "" });

    // Check if email already belongs to a Firebase user
    let userRecord = null;
    if (isFirebaseAdminAvailable) {
      try {
        userRecord = await adminAuth.getUserByEmail(normalizedEmail);
      } catch (e) {
        if (e.code !== "auth/user-not-found") {
          console.error("Error looking up user by email:", e);
        }
      }
    }

    if (userRecord && isFirebaseAdminAvailable) {
      // CASE A: EXISTING USER WITH FIREBASE ADMIN
      const customToken = await adminAuth.createCustomToken(userRecord.uid);
      
      let hasPassword = false;
      try {
        const userDoc = await adminDb.collection("users").doc(userRecord.uid).get();
        if (userDoc.exists) {
          hasPassword = !!userDoc.data().hasPassword;
        }
      } catch (err) {
        console.error("Error reading user Firestore doc:", err);
      }

      return res.status(200).json({
        success: true,
        isNewUser: false,
        customToken,
        email: normalizedEmail,
        hasPassword,
        message: "Welcome back!"
      });
    } else {
      // CASE B: NEW USER OR LOCAL DEV FALLBACK MODE
      const verifiedToken = crypto.createHash("sha256").update(`${normalizedEmail}:${serverSecret}:verified`).digest("hex");
      const devCustomToken = "dev_token_" + Date.now();
      return res.status(200).json({
        success: true,
        isNewUser: true,
        verifiedToken,
        customToken: devCustomToken,
        email: normalizedEmail,
        message: "Email verified successfully."
      });
    }
  } catch (error) {
    console.error("Error in /api/verify-otp:", error);
    return res.status(500).json({ error: "Something went wrong verifying your code. Please try again." });
  }
}

export { memOtpStore };
