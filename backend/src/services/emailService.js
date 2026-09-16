/**
 * emailService.js — Email Dispatch Service (Resend / SendGrid / Console Dev)
 */

const sendEmail = async ({ to, subject, html, text }) => {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  if (provider === 'resend' && process.env.RESEND_API_KEY) {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: process.env.FROM_EMAIL || 'FairHire <noreply@fairhire.io>',
          to,
          subject,
          html,
          text,
        }),
      });
      const data = await response.json();
      console.log(`✉️ [Resend] Email sent to ${to}:`, data.id);
      return data;
    } catch (err) {
      console.error(`❌ [Resend] Failed to send email to ${to}:`, err.message);
    }
  }

  // Default / Development Console fallback
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log(`📧 [Email Service - ${provider.toUpperCase()}]`);
  console.log(`To: ${to}`);
  console.log(`Subject: ${subject}`);
  console.log(`Body (Text): ${text}`);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  return { id: 'dev-mock-id', delivered: true };
};

const sendVerificationEmail = async (email, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const verifyUrl = `${clientUrl}/verify-email?token=${token}`;

  return sendEmail({
    to: email,
    subject: 'Verify your FairHire Candidate Account',
    text: `Welcome to FairHire! Please verify your email by clicking: ${verifyUrl}`,
    html: `
      <div style="font-family: sans-serif; background-color: #0B0F17; color: #F4F6FB; padding: 32px; border-radius: 8px;">
        <h2 style="color: #5B7FFF;">Welcome to FairHire</h2>
        <p>You have registered for a candidate account. To begin applying to de-biased roles, please verify your email address:</p>
        <p style="margin: 24px 0;">
          <a href="${verifyUrl}" style="background-color: #5B7FFF; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Verify Email Address
          </a>
        </p>
        <p style="color: #9AA4BF; font-size: 13px;">If you did not request this, please ignore this email.</p>
      </div>
    `,
  });
};

const sendRecruiterInviteEmail = async (email, companyName, token) => {
  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const inviteUrl = `${clientUrl}/accept-invite?token=${token}`;

  return sendEmail({
    to: email,
    subject: `You're invited to join ${companyName} on FairHire`,
    text: `Your organization's access request has been approved! Activate your recruiter account here: ${inviteUrl}`,
    html: `
      <div style="font-family: sans-serif; background-color: #0B0F17; color: #F4F6FB; padding: 32px; border-radius: 8px;">
        <h2 style="color: #5B7FFF;">Welcome to FairHire</h2>
        <p>Your access request for <strong>${companyName}</strong> has been approved by our compliance team.</p>
        <p>Click the link below to set your password and access your de-biased recruiter command center:</p>
        <p style="margin: 24px 0;">
          <a href="${inviteUrl}" style="background-color: #5B7FFF; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            Set Password & Activate Account
          </a>
        </p>
        <p style="color: #9AA4BF; font-size: 13px;">This single-use link expires in 72 hours.</p>
      </div>
    `,
  });
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendRecruiterInviteEmail,
};
