/**
 * Responsive HTML Email Template for Vedamya Foods OTP Verification
 */
export function getOtpEmailHtml({ otp, brandName = "Vedamya Foods", expiryMinutes = 10 }) {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Verification Code - ${brandName}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF4E3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #4a3b32;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF4E3; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 520px; background-color: #FFFDF6; border: 1px solid #E3DBC5; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(107, 79, 58, 0.05);">
          
          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding: 40px 30px 20px 30px; background-color: #FFFDF6; border-bottom: 1px solid #FAF4E3;">
              <div style="width: 56px; height: 56px; background-color: #FAF4E3; border: 1px solid #E3DBC5; border-radius: 16px; margin-bottom: 16px; display: inline-block; line-height: 56px; text-align: center;">
                <span style="font-size: 26px; color: #976E2A;">🌿</span>
              </div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 700; color: #6b4f3a; letter-spacing: 2px; text-transform: uppercase;">
                ${brandName}
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 12px; font-style: italic; color: #976E2A; letter-spacing: 1px;">
                Pure Energy From Tradition
              </p>
            </td>
          </tr>

          <!-- EMAIL BODY CONTENT -->
          <tr>
            <td style="padding: 36px 40px; text-align: center;">
              <h2 style="margin: 0 0 12px 0; font-size: 20px; font-weight: 700; color: #3e2b1e;">
                Verify Your Email Address
              </h2>
              <p style="margin: 0 0 28px 0; font-size: 14px; line-height: 1.6; color: #6b4f3a;">
                Please use the following verification code to complete your login or registration with <strong>${brandName}</strong>.
              </p>

              <!-- OTP DISPLAY CONTAINER -->
              <div style="background-color: #FAF4E3; border: 1.5px dashed #976E2A; border-radius: 16px; padding: 20px 10px; margin: 0 auto 28px auto; max-width: 320px;">
                <span style="font-size: 34px; font-weight: 800; letter-spacing: 10px; color: #6b4f3a; font-family: monospace, monospace;">
                  ${otp}
                </span>
              </div>

              <p style="margin: 0 0 8px 0; font-size: 13px; font-weight: 600; color: #976E2A;">
                ⏱️ This code will expire in ${expiryMinutes} minutes.
              </p>
              <p style="margin: 0; font-size: 12px; color: #6b4f3a; opacity: 0.7; line-height: 1.5;">
                If you did not request this verification code, you can safely ignore this email. No changes will be made to your account.
              </p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td align="center" style="padding: 24px 30px; background-color: #FAF4E3; border-top: 1px solid #E3DBC5; text-align: center;">
              <p style="margin: 0 0 6px 0; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 1.5px; color: #6b4f3a;">
                ${brandName} • Organic & Natural Products
              </p>
              <p style="margin: 0; font-size: 11px; color: #976E2A;">
                © 2026 ${brandName}. All rights reserved.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `;
}
