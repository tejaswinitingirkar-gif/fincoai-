/**
 * Email templates for Finco AI Finance Manager
 */

const baseStyles = `
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
  line-height: 1.6;
  color: #1e293b;
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
`;

const headerStyles = `
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  padding: 40px 20px;
  text-align: center;
  border-radius: 16px 16px 0 0;
`;

const footerStyles = `
  text-align: center;
  padding: 30px 20px;
  font-size: 12px;
  color: #64748b;
  border-top: 1px solid #f1f5f9;
`;

const cardStyles = `
  padding: 30px;
  border: 1px solid #f1f5f9;
  border-top: none;
  border-radius: 0 0 16px 16px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
`;

const buttonStyles = `
  display: inline-block;
  padding: 12px 24px;
  background-color: #4f46e5;
  color: #ffffff;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  margin-top: 20px;
`;

/**
 * User Confirmation Template
 */
export const getSupportConfirmationTemplate = ({ name, ticketId, subject, message }) => `
  <div style="${baseStyles}">
    <div style="${headerStyles}">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: -0.025em;">Support Received</h1>
    </div>
    <div style="${cardStyles}">
      <p style="margin-top: 0;">Hello <strong>${name}</strong>,</p>
      <p>We've received your support request and our team is currently reviewing it. We aim to respond within 24 hours.</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; margin: 24px 0; border: 1px solid #edf2f7;">
        <h4 style="margin: 0 0 10px 0; color: #4f46e5; text-transform: uppercase; font-size: 11px; letter-spacing: 0.05em;">Request Details</h4>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Subject:</strong> ${subject}</p>
        <p style="margin: 5px 0; font-size: 14px;"><strong>Ticket ID:</strong> <code style="background: #e2e8f0; padding: 2px 4px; border-radius: 4px;">${ticketId}</code></p>
        <hr style="border: 0; border-top: 1px solid #e2e8f0; margin: 15px 0;" />
        <p style="margin: 0; font-size: 14px; color: #475569; font-style: italic;">"${message}"</p>
      </div>

      <p style="font-size: 14px;">If you have additional information to add, please wait for our agent to contact you.</p>
      
      <a href="#" style="${buttonStyles}">View Dashboard</a>
    </div>
    <div style="${footerStyles}">
      <p style="margin: 0;">&copy; ${new Date().getFullYear()} Finco AI Finance Manager</p>
      <p style="margin: 5px 0;">Premium AI-Driven Financial Intelligence</p>
    </div>
  </div>
`;

/**
 * Admin Support Notification
 */
export const getAdminSupportNotification = ({ name, email, subject, message, ticketId }) => `
  <div style="${baseStyles}">
    <div style="${headerStyles}">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New Support Ticket</h1>
    </div>
    <div style="${cardStyles}">
      <div style="background-color: #fff7ed; border: 1px solid #fed7aa; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
        <p style="margin: 0; color: #9a3412; font-weight: 700; font-size: 13px;">Action Required: High Priority</p>
      </div>

      <p>A new support ticket has been submitted via the help center.</p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px; width: 100px;">User</td>
          <td style="padding: 8px 0; font-weight: 600;">${name}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Email</td>
          <td style="padding: 8px 0; font-weight: 600;">${email}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Subject</td>
          <td style="padding: 8px 0; font-weight: 600;">${subject}</td>
        </tr>
        <tr>
          <td style="padding: 8px 0; color: #64748b; font-size: 13px;">Ticket ID</td>
          <td style="padding: 8px 0;"><code>${ticketId}</code></td>
        </tr>
      </table>

      <div style="background-color: #f1f5f9; padding: 20px; border-radius: 12px; margin-top: 10px;">
        <p style="margin: 0; font-size: 14px;">${message}</p>
      </div>

      <a href="#" style="${buttonStyles}">Open Admin Console</a>
    </div>
  </div>
`;

/**
 * Admin Feedback Notification
 */
export const getAdminFeedbackNotification = ({ name, email, rating, category, message }) => `
  <div style="${baseStyles}">
    <div style="${headerStyles}">
      <h1 style="color: #ffffff; margin: 0; font-size: 24px;">New User Feedback</h1>
    </div>
    <div style="${cardStyles}">
      <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
        <div style="background: #f0fdf4; color: #166534; padding: 10px 20px; border-radius: 99px; font-weight: 800; font-size: 18px;">
          ${rating} / 5 ⭐
        </div>
        <div style="background: #f1f5f9; color: #475569; padding: 10px 20px; border-radius: 99px; font-weight: 600; font-size: 13px;">
          ${category}
        </div>
      </div>

      <p>User <strong>${name}</strong> (${email}) has just submitted feedback.</p>

      <div style="background-color: #f8fafc; padding: 20px; border-radius: 12px; border: 1px dashed #cbd5e1; margin-top: 20px;">
        <p style="margin: 0; font-size: 14px; font-style: italic;">"${message}"</p>
      </div>
    </div>
  </div>
`;
