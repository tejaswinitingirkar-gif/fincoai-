import nodemailer from 'nodemailer';

// Transporter configuration with fallback and better validation
const createTransporter = () => {
  const host = process.env.SMTP_HOST || 'smtp.gmail.com';
  const port = parseInt(process.env.SMTP_PORT || '465');
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;

  if (!user || !pass) {
    console.warn('EMAIL_SYSTEM: Credentials missing. Emails will be simulated in console.');
    return null;
  }

  return nodemailer.createTransport({
    host,
    port,
    secure: port === 465, // true for 465, false for other ports
    auth: { user, pass },
    tls: {
      rejectUnauthorized: false // Helps with some shared hosting/firewalls
    }
  });
};

const transporter = createTransporter();

export const sendEmail = async ({ to, subject, text, html }) => {
  if (!transporter) {
    console.log('--- SIMULATED EMAIL ---');
    console.log(`To: ${to}`);
    console.log(`Subject: ${subject}`);
    console.log(`Body: ${text || 'HTML Content'}`);
    console.log('-----------------------');
    return { simulated: true };
  }

  const mailOptions = {
    from: `"Finco AI Support" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    text,
    html,
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`EMAIL_SYSTEM: Sent successfully [ID: ${info.messageId}] to ${to}`);
    return info;
  } catch (error) {
    console.error(`EMAIL_SYSTEM_ERROR: Failed to send to ${to}`, error.message);
    // Log detailed error but don't crash the process
    return { error: error.message };
  }
};
