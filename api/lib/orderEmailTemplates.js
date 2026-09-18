/**
 * HTML Email Templates for Vedamya Foods Order Confirmation & Admin Notification
 */

export function getCustomerOrderEmailHtml({ order, brandName = "Vedamya Foods", trackUrl = "https://vedamyafoods.com/orders" }) {
  const items = order.items || [];
  const shippingAddr = order.shippingAddress || order.shipping || {};
  const orderDate = order.createdAt?.toDate 
    ? order.createdAt.toDate().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })
    : new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });

  const itemsTableRows = items.map(item => `
    <tr>
      <td style="padding: 12px 0; border-bottom: 1px solid #FAF4E3;">
        <div style="font-weight: 700; font-size: 14px; color: #3e2b1e;">${item.name}</div>
        <div style="font-size: 12px; color: #976E2A; margin-top: 2px;">
          ${item.flavor ? item.flavor + ' • ' : ''}${item.weight ? item.weight : ''}
        </div>
      </td>
      <td align="center" style="padding: 12px 0; border-bottom: 1px solid #FAF4E3; font-size: 14px; color: #6b4f3a;">
        ${item.quantity || 1}
      </td>
      <td align="right" style="padding: 12px 0; border-bottom: 1px solid #FAF4E3; font-weight: 700; font-size: 14px; color: #3e2b1e; font-family: monospace, monospace;">
        ₹${(Number(item.price) || 0) * (Number(item.quantity) || 1)}
      </td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Order Confirmed - #${order.orderNumber || order.orderId}</title>
</head>
<body style="margin: 0; padding: 0; background-color: #FAF4E3; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #4a3b32;">
  <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FAF4E3; padding: 40px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 600px; background-color: #FFFDF6; border: 1px solid #E3DBC5; border-radius: 24px; overflow: hidden; box-shadow: 0 10px 30px rgba(107, 79, 58, 0.06);">
          
          <!-- BRAND HEADER -->
          <tr>
            <td align="center" style="padding: 36px 30px 24px 30px; background-color: #FFFDF6; border-bottom: 1px solid #FAF4E3;">
              <div style="width: 52px; height: 52px; background-color: #FAF4E3; border: 1px solid #E3DBC5; border-radius: 16px; margin-bottom: 14px; display: inline-block; line-height: 52px; text-align: center;">
                <span style="font-size: 24px; color: #976E2A;">🌿</span>
              </div>
              <h1 style="margin: 0; font-size: 20px; font-weight: 700; color: #6b4f3a; letter-spacing: 2px; text-transform: uppercase;">
                ${brandName}
              </h1>
              <p style="margin: 4px 0 0 0; font-size: 11px; font-style: italic; color: #976E2A; letter-spacing: 1px;">
                Pure Energy From Tradition
              </p>
            </td>
          </tr>

          <!-- ORDER CONFIRMATION BANNER -->
          <tr>
            <td style="padding: 32px 36px 20px 36px; text-align: center; background-color: #FAF4E3;">
              <div style="display: inline-block; padding: 6px 16px; background-color: #D1E7DD; color: #0F5132; border-radius: 20px; font-size: 12px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 12px;">
                ✓ Order Confirmed
              </div>
              <h2 style="margin: 0 0 8px 0; font-size: 22px; font-weight: 700; color: #3e2b1e;">
                Thank you for your order!
              </h2>
              <p style="margin: 0; font-size: 14px; color: #6b4f3a; line-height: 1.5;">
                Hi <strong>${order.customerName || shippingAddr.name || 'Valued Customer'}</strong>, your sattu blend order has been placed and is being prepared.
              </p>
            </td>
          </tr>

          <!-- ORDER SUMMARY CARD -->
          <tr>
            <td style="padding: 24px 36px;">
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="background-color: #FFFDF6; border: 1px solid #E3DBC5; border-radius: 16px; padding: 16px 20px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #976E2A; font-weight: 700; uppercase; tracking: 1px;">
                    ORDER NUMBER
                  </td>
                  <td align="right" style="padding: 6px 0; font-size: 14px; font-weight: 800; color: #3e2b1e;">
                    #${order.orderNumber || order.orderId}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #976E2A; font-weight: 700;">
                    ORDER DATE
                  </td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 600; color: #6b4f3a;">
                    ${orderDate}
                  </td>
                </tr>
                <tr>
                  <td style="padding: 6px 0; font-size: 13px; color: #976E2A; font-weight: 700;">
                    PAYMENT METHOD
                  </td>
                  <td align="right" style="padding: 6px 0; font-size: 13px; font-weight: 700; color: #6b4f3a; text-transform: uppercase;">
                    ${order.paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                  </td>
                </tr>
              </table>

              <!-- ITEMS TABLE -->
              <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; color: #976E2A; border-bottom: 2px solid #FAF4E3; padding-bottom: 8px;">
                Items Ordered
              </h3>
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom: 20px;">
                <thead>
                  <tr style="font-size: 11px; font-weight: 700; text-transform: uppercase; color: #976E2A; border-bottom: 1px solid #E3DBC5;">
                    <th align="left" style="padding-bottom: 8px;">Product</th>
                    <th align="center" style="padding-bottom: 8px;">Qty</th>
                    <th align="right" style="padding-bottom: 8px;">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  ${itemsTableRows}
                </tbody>
              </table>

              <!-- TOTALS BREAKDOWN -->
              <table role="presentation" border="0" cellpadding="0" cellspacing="0" width="100%" style="border-top: 1.5px dashed #E3DBC5; padding-top: 16px; margin-bottom: 24px;">
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6b4f3a;">Subtotal</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; font-weight: 600; color: #3e2b1e;">₹${order.subtotal || order.total}</td>
                </tr>
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6b4f3a;">Shipping</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #0F5132;">${order.shippingCost ? '₹' + order.shippingCost : 'FREE'}</td>
                </tr>
                ${order.discount ? `
                <tr>
                  <td style="padding: 4px 0; font-size: 13px; color: #6b4f3a;">Discount</td>
                  <td align="right" style="padding: 4px 0; font-size: 13px; font-weight: 700; color: #B02A37;">-₹${order.discount}</td>
                </tr>
                ` : ''}
                <tr>
                  <td style="padding: 12px 0 0 0; font-size: 16px; font-weight: 800; color: #3e2b1e; text-transform: uppercase; letter-spacing: 1px;">Total Amount</td>
                  <td align="right" style="padding: 12px 0 0 0; font-size: 20px; font-weight: 800; color: #6b4f3a; font-family: monospace, monospace;">₹${order.total}</td>
                </tr>
              </table>

              <!-- SHIPPING ADDRESS -->
              <div style="background-color: #FAF4E3; border-radius: 16px; padding: 20px; border: 1px solid #E3DBC5; margin-bottom: 28px;">
                <h4 style="margin: 0 0 8px 0; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 1.5px; color: #976E2A;">
                  📍 Shipping Address
                </h4>
                <p style="margin: 0; font-size: 13px; line-height: 1.6; color: #4a3b32;">
                  <strong>${order.customerName || shippingAddr.name}</strong><br />
                  ${shippingAddr.address || ''}<br />
                  ${shippingAddr.city || ''}, ${shippingAddr.state || ''} - ${shippingAddr.pincode || ''}<br />
                  📞 Phone: ${order.customerPhone || shippingAddr.phone || 'N/A'}
                </p>
              </div>

              <!-- CTA BUTTON -->
              <div style="text-align: center; margin-bottom: 12px;">
                <a href="${trackUrl}" target="_blank" style="display: inline-block; padding: 16px 36px; background-color: #6b4f3a; color: #FFFDF6; font-size: 13px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px; text-decoration: none; border-radius: 14px; box-shadow: 0 8px 20px rgba(107, 79, 58, 0.25);">
                  Track My Order
                </a>
              </div>
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

export function getAdminOrderEmailHtml({ order, brandName = "Vedamya Foods" }) {
  const items = order.items || [];
  const shippingAddr = order.shippingAddress || order.shipping || {};
  const orderDate = order.createdAt?.toDate 
    ? order.createdAt.toDate().toLocaleString('en-IN')
    : new Date().toLocaleString('en-IN');

  const itemsRows = items.map(item => `
    <tr>
      <td style="padding: 8px; border-bottom: 1px solid #eee;">${item.name} (${item.weight || ''})</td>
      <td align="center" style="padding: 8px; border-bottom: 1px solid #eee;">${item.quantity || 1}</td>
      <td align="right" style="padding: 8px; border-bottom: 1px solid #eee;">₹${(Number(item.price) || 0) * (Number(item.quantity) || 1)}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<body style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
  <div style="max-width: 600px; background: #ffffff; padding: 25px; border-radius: 12px; border: 1px solid #ddd; margin: 0 auto;">
    <h2 style="color: #6b4f3a; margin-top: 0;">📦 New Order Received - #${order.orderNumber || order.orderId}</h2>
    
    <div style="background-color: #FAF4E3; padding: 12px 16px; border-radius: 8px; margin-bottom: 20px;">
      <p style="margin: 4px 0; font-size: 13px;"><strong>Customer Status:</strong> ${order.isGuest ? '⚠️ Guest User' : '✅ Registered User'}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Customer Email:</strong> ${order.customerEmail}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Customer Name:</strong> ${order.customerName || shippingAddr.name}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Phone:</strong> ${order.customerPhone || shippingAddr.phone}</p>
      <p style="margin: 4px 0; font-size: 13px;"><strong>Order Date:</strong> ${orderDate}</p>
    </div>

    <h3>Ordered Items</h3>
    <table width="100%" cellPadding="0" cellSpacing="0" style="border-collapse: collapse; margin-bottom: 20px;">
      <thead>
        <tr style="background: #FAF4E3;">
          <th align="left" style="padding: 8px;">Product</th>
          <th align="center" style="padding: 8px;">Qty</th>
          <th align="right" style="padding: 8px;">Total</th>
        </tr>
      </thead>
      <tbody>
        ${itemsRows}
      </tbody>
    </table>

    <div style="text-align: right; font-size: 16px; font-weight: bold; color: #3e2b1e; margin-bottom: 20px;">
      Grand Total: ₹${order.total}
    </div>

    <div style="border-top: 1px solid #ddd; padding-top: 15px;">
      <h4>Shipping Address</h4>
      <p style="font-size: 13px; line-height: 1.5;">
        ${order.customerName || shippingAddr.name}<br />
        ${shippingAddr.address || ''}<br />
        ${shippingAddr.city || ''}, ${shippingAddr.state || ''} - ${shippingAddr.pincode || ''}<br />
        Payment Method: <strong>${(order.paymentMethod || 'COD').toUpperCase()}</strong> (${order.paymentStatus || 'Pending'})
      </p>
    </div>
  </div>
</body>
</html>
  `;
}
