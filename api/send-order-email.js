import nodemailer from "nodemailer";
import { adminDb } from "./lib/firebaseAdmin.js";
import { getCustomerOrderEmailHtml, getAdminOrderEmailHtml } from "./lib/orderEmailTemplates.js";

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
    const { orderId, order: bodyOrderData } = req.body || {};

    let orderData = bodyOrderData || null;
    let orderDocRef = null;

    if (orderId && typeof orderId === "string") {
      try {
        orderDocRef = adminDb.collection("orders").doc(orderId);
        const docSnap = await orderDocRef.get();
        if (docSnap.exists) {
          orderData = { orderId: docSnap.id, ...docSnap.data() };
        }
      } catch (err) {
        console.warn("Could not fetch order doc via Admin SDK, using payload fallback:", err.message);
      }
    }

    if (!orderData) {
      return res.status(400).json({ error: "Order details are required" });
    }

    const order = {
      orderId: orderId || orderData.orderId || "ORD-" + Date.now(),
      ...orderData
    };

    const customerEmail = order.customerEmail || order.userEmail || order.shippingAddress?.email || order.shipping?.email;

    if (!customerEmail) {
      return res.status(400).json({ error: "No customer email associated with this order" });
    }

    // Configure Nodemailer Transport
    const smtpHost = process.env.SMTP_HOST || "smtp.gmail.com";
    const smtpPort = Number(process.env.SMTP_PORT) || 465;
    const smtpSecure = process.env.SMTP_SECURE === "true" || smtpPort === 465;
    const smtpUser = process.env.SMTP_USER || "vedamyafoods@gmail.com";
    const smtpPass = process.env.SMTP_PASS;
    const smtpFrom = process.env.SMTP_FROM || `"Vedamya Foods" <${smtpUser}>`;
    const adminEmail = process.env.ADMIN_EMAIL;

    const emailStatus = {
      customer: "pending",
      admin: "pending"
    };

    if (!smtpUser || !smtpPass) {
      console.warn("SMTP credentials not fully set. Email delivery skipped for order:", order.orderNumber || orderId);
      if (orderDocRef) {
        await orderDocRef.update({
          emailStatus: { customer: "failed", admin: "failed" },
          emailError: "SMTP credentials missing in server environment",
          emailAttemptedAt: new Date().toISOString()
        });
      }

      return res.status(200).json({
        success: true,
        message: "Order email notification processed (SMTP not configured)",
        emailStatus: { customer: "failed", admin: "failed" }
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

    // 1. Send Customer Order Confirmation Email
    try {
      const customerHtml = getCustomerOrderEmailHtml({ order, brandName: "Vedamya Foods" });
      await transporter.sendMail({
        from: smtpFrom,
        to: customerEmail.trim().toLowerCase(),
        subject: `Order Confirmed - #${order.orderNumber || String(order.orderId).slice(0, 8).toUpperCase()}`,
        html: customerHtml
      });
      emailStatus.customer = "sent";
    } catch (err) {
      console.error("Error sending customer order email:", err);
      emailStatus.customer = "failed";
    }

    // 2. Send Admin Order Notification Email
    if (adminEmail) {
      try {
        const adminHtml = getAdminOrderEmailHtml({ order, brandName: "Vedamya Foods" });
        await transporter.sendMail({
          from: smtpFrom,
          to: adminEmail.trim().toLowerCase(),
          subject: `New Order Received - #${order.orderNumber || String(order.orderId).slice(0, 8).toUpperCase()}`,
          html: adminHtml
        });
        emailStatus.admin = "sent";
      } catch (err) {
        console.error("Error sending admin order email:", err);
        emailStatus.admin = "failed";
      }
    } else {
      emailStatus.admin = "skipped_no_admin_email";
    }

    // Update Order Document in Firestore with Email Status if Admin SDK connected
    if (orderDocRef) {
      try {
        await orderDocRef.update({
          emailStatus: emailStatus,
          emailAttemptedAt: new Date().toISOString()
        });
      } catch (e) {
        // Safe catch for local fallback mode
      }
    }

    return res.status(200).json({
      success: true,
      message: "Order emails processed",
      emailStatus
    });

  } catch (error) {
    console.error("Fatal error in /api/send-order-email:", error);
    return res.status(500).json({
      error: "Error processing email sending",
      details: error.message
    });
  }
}
