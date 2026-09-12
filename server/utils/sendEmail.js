import nodemailer from 'nodemailer';

/**
 * Send email using Brevo (Sendinblue) HTTP REST API (Port 443 HTTPS).
 * Works 100% reliably on Render, AWS, Vercel, and anywhere outbound SMTP ports are blocked.
 */
const sendViaBrevo = async ({ to, subject, htmlContent, name }) => {
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  const senderEmail = process.env.SMTP_USER?.trim() || process.env.BREVO_SENDER || 'deepak2005dev@gmail.com';

  const payload = {
    sender: { name: 'EduCenter', email: senderEmail },
    to: [{ email: to, name: name || undefined }],
    subject,
    htmlContent,
  };

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    headers: {
      'api-key': brevoApiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    body: JSON.stringify(payload),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errText = data?.message || data?.error || `HTTP ${response.status}`;
    throw new Error(`Brevo API error: ${errText}`);
  }

  return { success: true, messageId: data.messageId, provider: 'brevo' };
};

/**
 * Send email using Resend HTTP REST API (Port 443 HTTPS).
 */
const sendViaResend = async ({ to, subject, htmlContent }) => {
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const fromAddress = process.env.EMAIL_FROM?.trim() || 'EduCenter <onboarding@resend.dev>';

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${resendApiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: fromAddress,
      to: [to],
      subject,
      html: htmlContent,
    }),
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    const errText = data?.message || `HTTP ${response.status}`;
    throw new Error(`Resend API error: ${errText}`);
  }

  return { success: true, messageId: data.id, provider: 'resend' };
};

/**
 * Nodemailer Transporter instance for local development / unblocked SMTP environments
 */
const createTransporterInstance = (port = 465, isSecure = true) => {
  const host = (process.env.SMTP_HOST || 'smtp.gmail.com').trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim()?.replace(/\s+/g, '');

  return nodemailer.createTransport({
    host,
    port,
    secure: isSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
      minVersion: 'TLSv1.2',
    },
    family: 4, // Force IPv4 to prevent IPv6 DNS resolution hangs
    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000,
  });
};

/**
 * Diagnostic helper to verify connection status
 */
export const verifySmtpConnection = async () => {
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  // Check Brevo HTTP API
  if (brevoApiKey) {
    try {
      const res = await fetch('https://api.brevo.com/v3/account', {
        headers: { 'api-key': brevoApiKey },
      });
      const data = await res.json();
      if (res.ok) {
        return {
          success: true,
          configured: true,
          provider: 'brevo (HTTPS Port 443)',
          email: data.email,
          message: 'Brevo HTTP API verified successfully! Render cannot block this.',
        };
      }
      return {
        success: false,
        configured: true,
        provider: 'brevo',
        message: `Brevo API key rejected: ${data.message || res.statusText}`,
      };
    } catch (err) {
      return {
        success: false,
        configured: true,
        provider: 'brevo',
        message: `Brevo connection failed: ${err.message}`,
      };
    }
  }

  // Check Resend HTTP API
  if (resendApiKey) {
    try {
      const res = await fetch('https://api.resend.com/api-keys', {
        headers: { 'Authorization': `Bearer ${resendApiKey}` },
      });
      if (res.ok) {
        return {
          success: true,
          configured: true,
          provider: 'resend (HTTPS Port 443)',
          message: 'Resend HTTP API verified successfully! Render cannot block this.',
        };
      }
      return {
        success: false,
        configured: true,
        provider: 'resend',
        message: 'Resend API key rejected.',
      };
    } catch (err) {
      return {
        success: false,
        configured: true,
        provider: 'resend',
        message: `Resend connection failed: ${err.message}`,
      };
    }
  }

  // Check SMTP / Gmail
  if (!smtpUser || !smtpPass || smtpPass === 'your_gmail_app_password_here') {
    return {
      success: false,
      configured: false,
      message: 'No email credentials found. Set BREVO_API_KEY in Render to send via HTTPS Port 443.',
    };
  }

  const preferredPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const isSecure = preferredPort === 465;

  try {
    const transporter = createTransporterInstance(preferredPort, isSecure);
    await transporter.verify();
    return {
      success: true,
      configured: true,
      provider: 'smtp',
      port: preferredPort,
      message: `SMTP connection verified on port ${preferredPort}.`,
    };
  } catch (err) {
    const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
    const renderWarning = isRender
      ? ' (Render blocks outbound SMTP ports 25/465/587. Please add BREVO_API_KEY in Render Dashboard to use HTTPS Port 443!)'
      : '';
    return {
      success: false,
      configured: true,
      provider: 'smtp',
      message: `SMTP verification failed: ${err.message}${renderWarning}`,
    };
  }
};

/**
 * Send an email with a 6-digit OTP code.
 * Prioritizes Brevo HTTP API (Port 443) -> Resend HTTP API (Port 443) -> Nodemailer SMTP fallback.
 */
export const sendEmail = async ({ to, subject, otp, purpose = 'Verification', name = '', forEmail = '' }) => {
  const brevoApiKey = process.env.BREVO_API_KEY?.trim();
  const resendApiKey = process.env.RESEND_API_KEY?.trim();
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS?.trim();

  const isConfigured = Boolean(
    brevoApiKey ||
    resendApiKey ||
    (smtpUser && smtpPass && smtpPass !== 'your_gmail_app_password_here')
  );

  const purposeTitle = purpose === 'signup'
    ? 'Email Verification Code'
    : 'Password Reset Code';

  const purposeDescription = purpose === 'signup'
    ? 'Thank you for registering with EduCenter! Please use the verification code below to verify your email address and activate your account.'
    : 'We received a request to reset your EduCenter account password. Please use the verification code below to proceed with resetting your password.';

  if (!isConfigured) {
    if (process.env.NODE_ENV === 'production') {
      const errMsg = 'Email delivery failed: No email credentials found. Set BREVO_API_KEY in your hosting dashboard.';
      throw new Error(errMsg);
    }

    return { success: true, simulated: true, otp };
  }

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
      .admin-note { margin: 16px 0; padding: 12px 16px; background-color: #eff6ff; border-left: 4px solid #3b82f6; border-radius: 6px; font-size: 13px; color: #1e40af; }
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
        ${forEmail ? `
        <div class="admin-note">
          <strong>Security Notice:</strong> This OTP was requested for admin account: <strong>${forEmail}</strong>
        </div>` : ''}
        
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

  const finalSubject = subject || `${purposeTitle} - EduCenter`;

  // 1. Send via Brevo HTTP API (Port 443 - Recommended for Render)
  if (brevoApiKey) {
    return await sendViaBrevo({ to, subject: finalSubject, htmlContent, name });
  }

  // 2. Send via Resend HTTP API (Port 443 - Recommended for Render)
  if (resendApiKey) {
    return await sendViaResend({ to, subject: finalSubject, htmlContent });
  }

  // 3. Send via SMTP (Works on localhost)
  const preferredPort = parseInt(process.env.SMTP_PORT || '465', 10);
  const isSecure = preferredPort === 465;

  const mailOptions = {
    from: `"EduCenter" <${smtpUser}>`,
    to,
    subject: finalSubject,
    html: htmlContent,
  };

  try {
    const transporter = createTransporterInstance(preferredPort, isSecure);
    const info = await transporter.sendMail(mailOptions);
    return { success: true, messageId: info.messageId, port: preferredPort, provider: 'smtp' };
  } catch (primaryError) {
    const fallbackPort = preferredPort === 465 ? 587 : 465;
    const fallbackSecure = fallbackPort === 465;

    try {
      const fallbackTransporter = createTransporterInstance(fallbackPort, fallbackSecure);
      const info = await fallbackTransporter.sendMail(mailOptions);
      return { success: true, messageId: info.messageId, port: fallbackPort, provider: 'smtp' };
    } catch (fallbackError) {
      const isRender = Boolean(process.env.RENDER || process.env.RENDER_SERVICE_ID);
      const renderNote = isRender
        ? ' (Render blocks outbound SMTP ports 25, 465, and 587. Please add BREVO_API_KEY in Render to send via HTTPS Port 443!)'
        : '';
      throw new Error(`Email delivery failed: ${fallbackError.message || primaryError.message}${renderNote}`);
    }
  }
};
