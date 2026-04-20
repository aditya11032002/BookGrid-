const nodemailer = require('nodemailer');

// ─── Transporter ─────────────────────────────────────────────────────────────
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_CREDS,
  },
});

// ─── Shared Styles ────────────────────────────────────────────────────────────
const baseStyle = `
  font-family: 'Segoe UI', Arial, sans-serif;
  background-color: #f4f4f7;
  margin: 0; padding: 0;
`;
const cardStyle = `
  max-width: 600px; margin: 40px auto; background: #ffffff;
  border-radius: 12px; overflow: hidden;
  box-shadow: 0 4px 24px rgba(0,0,0,0.08);
`;
const headerStyle = (bg = '#1a1a2e') => `
  background: ${bg}; padding: 32px 40px; text-align: center;
`;
const logoStyle = `
  color: #f5c518; font-size: 28px; font-weight: 800;
  letter-spacing: 1px; text-decoration: none;
`;
const bodyStyle = `padding: 36px 40px; color: #333333;`;
const footerStyle = `
  background: #f4f4f7; padding: 20px 40px; text-align: center;
  font-size: 12px; color: #999999;
`;
const btnStyle = (bg = '#f5c518') => `
  display: inline-block; padding: 14px 32px; background: ${bg};
  color: ${bg === '#f5c518' ? '#1a1a2e' : '#ffffff'}; font-weight: 700;
  font-size: 15px; border-radius: 8px; text-decoration: none; margin-top: 16px;
`;

// ─── 1. Welcome Email ─────────────────────────────────────────────────────────
const welcomeEmail = async (user) => {
  const html = `
    <body style="${baseStyle}">
      <div style="${cardStyle}">
        <div style="${headerStyle()}">
          <span style="${logoStyle}">📚 BookHaven</span>
          <p style="color:#a0a0b0; margin:8px 0 0; font-size:14px;">Your Literary Paradise</p>
        </div>
        <div style="${bodyStyle}">
          <h2 style="margin:0 0 12px; color:#1a1a2e;">Welcome aboard, ${user.name}! 🎉</h2>
          <p style="line-height:1.7; color:#555; margin:0 0 16px;">
            We're thrilled to have you join the BookHaven community. Your account has been created
            successfully and you're now ready to explore thousands of books.
          </p>
          <p style="line-height:1.7; color:#555; margin:0 0 24px;">
            Discover timeless classics, contemporary bestsellers, children's stories, and much more
            — all in one place.
          </p>
          <div style="background:#f8f8fb; border-radius:8px; padding:20px; margin-bottom:24px;">
            <p style="margin:0; font-size:14px; color:#666;"><strong>Your Account Details</strong></p>
            <p style="margin:8px 0 0; font-size:14px; color:#444;">📧 Email: <strong>${user.email}</strong></p>
          </div>
          <a href="${process.env.CLIENT_URL}" style="${btnStyle()}">Start Exploring Books →</a>
        </div>
        <div style="${footerStyle}">
          <p style="margin:0;">© ${new Date().getFullYear()} BookHaven · All rights reserved.</p>
          <p style="margin:4px 0 0;">You received this email because you created an account on BookHaven.</p>
        </div>
      </div>
    </body>
  `;

  await transporter.sendMail({
    from: `"BookHaven 📚" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `Welcome to BookHaven, ${user.name}! 🎉`,
    html,
  });
};

// ─── 2. Order Confirmation Email ──────────────────────────────────────────────
const orderConfirmation = async (order, user) => {
  const itemRows = order.orderItems.map((item) => `
    <tr>
      <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0;">
        <strong style="color:#1a1a2e;">${item.title}</strong>
      </td>
      <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0; text-align:center; color:#666;">
        ${item.qty}
      </td>
      <td style="padding:12px 8px; border-bottom:1px solid #f0f0f0; text-align:right; color:#333;">
        ₹${(item.price * item.qty).toFixed(2)}
      </td>
    </tr>
  `).join('');

  const shipping = order.shippingAddress;

  const html = `
    <body style="${baseStyle}">
      <div style="${cardStyle}">
        <div style="${headerStyle('#16213e')}">
          <span style="${logoStyle}">📚 BookHaven</span>
          <p style="color:#a0a0b0; margin:8px 0 0; font-size:14px;">Order Confirmation</p>
        </div>
        <div style="${bodyStyle}">
          <h2 style="margin:0 0 4px; color:#1a1a2e;">Thank you, ${user.name}!</h2>
          <p style="color:#666; margin:0 0 24px; font-size:14px;">
            Your order has been placed successfully. We'll notify you once it ships.
          </p>

          <div style="background:#f8f8fb; border-radius:8px; padding:16px 20px; margin-bottom:24px; display:flex; justify-content:space-between;">
            <div>
              <p style="margin:0; font-size:12px; color:#999; text-transform:uppercase; letter-spacing:1px;">Order ID</p>
              <p style="margin:4px 0 0; font-size:13px; font-weight:600; color:#1a1a2e; word-break:break-all;">${order._id}</p>
            </div>
            <div style="text-align:right;">
              <p style="margin:0; font-size:12px; color:#999; text-transform:uppercase; letter-spacing:1px;">Date</p>
              <p style="margin:4px 0 0; font-size:13px; font-weight:600; color:#1a1a2e;">${new Date(order.createdAt).toLocaleDateString('en-IN', { day:'numeric', month:'short', year:'numeric' })}</p>
            </div>
          </div>

          <h3 style="color:#1a1a2e; margin:0 0 12px; font-size:15px;">📦 Your Items</h3>
          <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
            <thead>
              <tr style="background:#f4f4f7;">
                <th style="padding:10px 8px; text-align:left; font-size:12px; color:#999; text-transform:uppercase;">Book</th>
                <th style="padding:10px 8px; text-align:center; font-size:12px; color:#999; text-transform:uppercase;">Qty</th>
                <th style="padding:10px 8px; text-align:right; font-size:12px; color:#999; text-transform:uppercase;">Price</th>
              </tr>
            </thead>
            <tbody>${itemRows}</tbody>
            <tfoot>
              <tr>
                <td colspan="2" style="padding:14px 8px; text-align:right; font-weight:700; color:#1a1a2e; font-size:15px;">Total</td>
                <td style="padding:14px 8px; text-align:right; font-weight:800; color:#f5c518; font-size:17px;">₹${order.totalPrice.toFixed(2)}</td>
              </tr>
            </tfoot>
          </table>

          <h3 style="color:#1a1a2e; margin:0 0 12px; font-size:15px;">🚚 Shipping Address</h3>
          <div style="background:#f8f8fb; border-radius:8px; padding:16px 20px; margin-bottom:24px; font-size:14px; color:#555; line-height:1.8;">
            ${shipping.address}, ${shipping.city}<br>
            ${shipping.postalCode}, ${shipping.country}
          </div>

          <div style="background:#fff8e1; border:1px solid #f5c518; border-radius:8px; padding:14px 20px; margin-bottom:24px;">
            <p style="margin:0; font-size:13px; color:#7a6000;">
              💳 <strong>Payment:</strong> ${order.paymentMethod}
            </p>
          </div>

          <a href="${process.env.CLIENT_URL}" style="${btnStyle()}">Continue Shopping →</a>
        </div>
        <div style="${footerStyle}">
          <p style="margin:0;">© ${new Date().getFullYear()} BookHaven · All rights reserved.</p>
          <p style="margin:4px 0 0;">Questions? Reply to this email or visit our store.</p>
        </div>
      </div>
    </body>
  `;

  await transporter.sendMail({
    from: `"BookHaven 📚" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: `Order Confirmed! #${order._id.toString().slice(-8).toUpperCase()}`,
    html,
  });
};

// ─── 3. Password Reset Email ──────────────────────────────────────────────────
const sendPasswordResetEmail = async (user, resetUrl) => {
  const html = `
    <body style="${baseStyle}">
      <div style="${cardStyle}">
        <div style="${headerStyle('#e63946')}">
          <span style="${logoStyle}">📚 BookHaven</span>
          <p style="color:#ffb3b8; margin:8px 0 0; font-size:14px;">Password Reset Request</p>
        </div>
        <div style="${bodyStyle}">
          <h2 style="margin:0 0 12px; color:#1a1a2e;">Reset Your Password 🔐</h2>
          <p style="line-height:1.7; color:#555; margin:0 0 16px;">
            Hi <strong>${user.name}</strong>, we received a request to reset your BookHaven account password.
          </p>
          <p style="line-height:1.7; color:#555; margin:0 0 24px;">
            Click the button below to set a new password. This link is valid for <strong>10 minutes only</strong>.
          </p>

          <div style="text-align:center; margin:28px 0;">
            <a href="${resetUrl}" style="${btnStyle('#e63946')}">Reset My Password →</a>
          </div>

          <div style="background:#fff5f5; border:1px solid #ffcdd2; border-radius:8px; padding:14px 20px; margin-top:24px;">
            <p style="margin:0; font-size:13px; color:#c62828;">
              ⚠️ If you did not request a password reset, please ignore this email. Your account is safe.
            </p>
          </div>

          <p style="margin:20px 0 0; font-size:12px; color:#999; word-break:break-all;">
            Or copy this link: ${resetUrl}
          </p>
        </div>
        <div style="${footerStyle}">
          <p style="margin:0;">© ${new Date().getFullYear()} BookHaven · All rights reserved.</p>
          <p style="margin:4px 0 0;">This link expires in 10 minutes.</p>
        </div>
      </div>
    </body>
  `;

  await transporter.sendMail({
    from: `"BookHaven 📚" <${process.env.GMAIL_USER}>`,
    to: user.email,
    subject: 'BookHaven – Password Reset Request 🔐',
    html,
  });
};

module.exports = { welcomeEmail, orderConfirmation, sendPasswordResetEmail };
