import crypto from "crypto";
import nodemailer from "nodemailer";
import { adminDb, isFirebaseAdminAvailable } from "./lib/firebaseAdmin.js";
import { getOtpEmailHtml } from "./lib/emailTemplate.js";

// Shared in-memory OTP store for local dev when Firebase Admin isn't available.
// Exported so verify-otp can import and share the same Map instance.
export const memOtpStore = new Map();

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

async function setOtpDoc(emailHash, ref, useFirestore, payload) {
  if (useFirestore && ref && isFirebaseAdminAvailable) {
    try {
      await ref.set(payload);
      return;
    } catch (e) {
      // fall through to memory store
    }
  }
  memOtpStore.set(emailHash, payload);
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
    const { email } = req.body || {};
    if (!email || typeof email !== "string") {
      return res.status(400).json({ error: "Valid email address is required" });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(normalizedEmail)) {
      return res.status(400).json({ error: "Invalid email format" });
    }

    const emailHash = crypto.createHash("sha256").update(normalizedEmail).digest("hex");
    const otpDoc = await getOtpDoc(emailHash);

    const now = Date.now();
    const cooldownMs = 30 * 1000; // 30s resend cooldown

    if (otpDoc.exists) {
      const data = otpDoc.data();
      if (data && data.createdAt && now - data.createdAt < cooldownMs) {
        const secondsLeft = Math.ceil((cooldownMs - (now - data.createdAt)) / 1000);
        return res.status(429).json({
          error: `Please wait ${secondsLeft} seconds before requesting another code.`,
          cooldown: secondsLeft
        });
      }
    }

    // Cryptographically secure 6-digit OTP
    const otp = crypto.randomInt(100000, 1000000).toString();
    const serverSecret = process.env.OTP_SECRET || "vedamya_otp_secret_key_2026";
    const otpHash = crypto.createHash("sha256").update(`${normalizedEmail}:${otp}:${serverSecret}`).digest("hex");
    const expiresAt = now + 10 * 60 * 1000; // 10 mins

    const payload = {
      emailHash,
      otpHash,
      createdAt: now,
      expiresAt,
      attempts: 0,
      verified: false
    };

    await setOtpDoc(emailHash, otpDoc.ref, otpDoc._useFirestore, payload);

    // Configure Nodemailer Transport
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
    const smtpUser = process.env.SMTP_USER || "vedamyafoods@gmail.com";
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `"Vedamya Foods" <${smtpUser}>`;

    if (!smtpUser || !smtpPass) {
      console.warn("⚠️ SMTP credentials not set. OTP (dev only):", otp);
      return res.status(200).json({
        success: true,
        message: "Verification code sent to your email",
        cooldown: 30
      });
    }

    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpSecure,
      auth: {
        user: smtpUser,
        pass: smtpPass
      }
    });

    const html = getOtpEmailHtml({ otp, brandName: "Vedamya Foods", expiryMinutes: 10 });

    await transporter.sendMail({
      from: smtpFrom,
      to: normalizedEmail,
      subject: `Your Verification Code: ${otp} - Vedamya Foods`,
      html
    });

    return res.status(200).json({
      success: true,
      message: "Verification code sent to your email",
      cooldown: 30
    });
  } catch (error) {
    console.error("Error in /api/send-otp:", error);
    return res.status(500).json({ error: "Unable to send verification code right now. Please try again later." });
  }
}
