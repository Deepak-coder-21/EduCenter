import nodemailer from 'nodemailer';

/**
 * Send an email with a 6-digit OTP code using Nodemailer.
 * Falls back to console simulation if SMTP credentials are not configured.
 */
export const sendEmail = async ({ to, subject, otp, purpose = 'Verification', name = '' }) => {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;

  const isConfigured = Boolean(smtpUser && smtpPass && smtpPass !== 'your_gmail_app_password_here');

  const purposeTitle = purpose === 'signup' 
    ? 'Email Verification Code' 
    : 'Password Reset Code';

  const purposeDescription = purpose === 'signup'
    ? 'Thank you for registering with EduCenter! Please use the verification code below to verify your email address and activate your account.'
    : 'We received a request to reset your EduCenter account password. Please use the verification code below to proceed with resetting your password.';

  // If SMTP is NOT configured, succeed gracefully in simulation mode
  if (!isConfigured) {
    return { success: true, simulated: true };
  }

  try {
    // Create transporter
    const transporter = nodemailer.createTransport({
      service: process.env.SMTP_SERVICE || 'gmail',
      auth: {
        user: smtpUser.trim(),
        pass: smtpPass.trim().replace(/\s+/g, ''),
      },
    });

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${purposeTitle}</title>
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #f8fafc; margin: 0; padding: 0; }
        .container { max-width: 540px; margin: 30px auto; background: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 32px 24px; text-align: center; color: #ffffff; }
        .header h1 { margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
        .header p { margin: 6px 0 0 0; font-size: 14px; opacity: 0.9; }
        .content { padding: 32px 28px; color: #334155; }
        .greeting { font-size: 16px; font-weight: 600; color: #0f172a; margin-bottom: 12px; }
        .desc { font-size: 14px; line-height: 1.6; color: #64748b; margin-bottom: 24px; }
        .otp-box { background: #f1f5f9; border: 2px dashed #cbd5e1; border-radius: 12px; padding: 20px; text-align: center; margin: 24px 0; }
        .otp-label { font-size: 11px; text-transform: uppercase; font-weight: 700; color: #64748b; letter-spacing: 1px; margin-bottom: 8px; }
        .otp-code { font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: monospace, Courier, monospace; margin: 0; }
        .warning { font-size: 12px; color: #94a3b8; line-height: 1.5; margin-top: 24px; border-top: 1px solid #f1f5f9; padding-top: 16px; }
        .footer { background: #f8fafc; padding: 18px 24px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #f1f5f9; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>EduCenter</h1>
          <p>Excellence in Online Learning</p>
        </div>
        <div class="content">
          <div class="greeting">Hello${name ? ` ${name}` : ''},</div>
          <div class="desc">${purposeDescription}</div>
          
          <div class="otp-box">
            <div class="otp-label">Your 6-Digit One-Time Password</div>
            <div class="otp-code">${otp}</div>
          </div>

          <div class="warning">
            <strong>Security Notice:</strong> This code will expire in <strong>10 minutes</strong>. If you did not make this request, you can safely ignore this email; no changes have been made to your account.
          </div>
        </div>
        <div class="footer">
          &copy; ${new Date().getFullYear()} EduCenter. All rights reserved.
        </div>
      </div>
    </body>
    </html>
  `;

    const mailOptions = {
      from: `"EduCenter" <${smtpUser}>`,
      to,
      subject: subject || `${purposeTitle} - EduCenter`,
      html: htmlContent,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ [SMTP SUCCESS] Email successfully delivered to ${to} (MessageId: ${info.messageId})`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ [SMTP ERROR] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};
