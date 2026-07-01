const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendComplaintUpdateEmail = async (toEmail, residentName, complaintId, category, newStatus, note) => {
  try {
    const statusColors = { 'Open': '#ef4444', 'In Progress': '#f59e0b', 'Resolved': '#22c55e' };
    const color = statusColors[newStatus] || '#6b7280';

    await transporter.sendMail({
      from: `"Society Admin" <${process.env.EMAIL_USER}>`,
      to: toEmail,
      subject: `Complaint Update: ${category} - ${newStatus}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #1e293b; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin:0;">🏠 Society Maintenance Tracker</h2>
          </div>
          <div style="padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <p>Hello <strong>${residentName}</strong>,</p>
            <p>Your complaint status has been updated.</p>
            <div style="background: white; border-radius: 8px; padding: 16px; margin: 16px 0; border-left: 4px solid ${color};">
              <p><strong>Category:</strong> ${category}</p>
              <p><strong>New Status:</strong> <span style="color: ${color}; font-weight: bold;">${newStatus}</span></p>
              ${note ? `<p><strong>Admin Note:</strong> ${note}</p>` : ''}
              <p style="font-size: 12px; color: #94a3b8;">Complaint ID: ${complaintId}</p>
            </div>
            <p style="color: #64748b; font-size: 13px;">Log in to the Society Portal to view full details.</p>
          </div>
        </div>
      `
    });
    console.log(`📧 Email sent to ${toEmail}`);
  } catch (err) {
    console.error('Email error:', err.message);
  }
};

const sendNoticeEmail = async (emails, title, content) => {
  try {
    await transporter.sendMail({
      from: `"Society Admin" <${process.env.EMAIL_USER}>`,
      to: emails.join(','),
      subject: `📢 Important Notice: ${title}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
          <div style="background: #dc2626; color: white; padding: 20px; border-radius: 8px 8px 0 0;">
            <h2 style="margin:0;">📢 Important Notice</h2>
          </div>
          <div style="padding: 24px; background: #f8fafc; border: 1px solid #e2e8f0;">
            <h3>${title}</h3>
            <p>${content}</p>
            <p style="color: #64748b; font-size: 13px;">- Society Management</p>
          </div>
        </div>
      `
    });
    console.log(`📧 Notice email sent to ${emails.length} residents`);
  } catch (err) {
    console.error('Notice email error:', err.message);
  }
};

module.exports = { sendComplaintUpdateEmail, sendNoticeEmail };
