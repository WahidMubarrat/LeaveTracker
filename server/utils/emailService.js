const nodemailer = require('nodemailer');

// Create transporter using Gmail
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD
  }
});

/**
 * Send OTP email to user
 * @param {string} email - Recipient email
 * @param {string} otp - 6-digit OTP
 * @param {string} userName - User's name
 */
const sendOTPEmail = async (email, otp, userName = 'User') => {
  try {
    const mailOptions = {
      from: `"LeaveTracker Support" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset OTP - LeaveTracker',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .otp-box { background: white; border: 2px dashed #667eea; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .otp-code { font-size: 32px; font-weight: bold; color: #667eea; letter-spacing: 8px; }
            .warning { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔐 Password Reset Request</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${userName}</strong>,</p>
              <p>We received a request to reset your password for your LeaveTracker account. Use the OTP below to proceed with resetting your password.</p>
              
              <div class="otp-box">
                <p style="margin: 0; font-size: 14px; color: #666;">Your OTP Code</p>
                <div class="otp-code">${otp}</div>
                <p style="margin: 10px 0 0 0; font-size: 12px; color: #888;">Valid for 10 minutes</p>
              </div>
              
              <div class="warning">
                <strong>⚠️ Security Notice:</strong>
                <ul style="margin: 8px 0; padding-left: 20px;">
                  <li>This OTP will expire in <strong>10 minutes</strong></li>
                  <li>Never share this code with anyone</li>
                  <li>If you didn't request this, please ignore this email</li>
                </ul>
              </div>
              
              <p style="margin-top: 20px;">If you have any questions or concerns, please don't hesitate to contact our support team.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>LeaveTracker Team</strong></p>
            </div>
            <div class="footer">
              <p>This is an automated email. Please do not reply to this message.</p>
              <p>&copy; ${new Date().getFullYear()} LeaveTracker. All rights reserved.</p>
            </div>
          </div>
        </body>
        </html>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('OTP email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Email sending error:', error);
    throw new Error('Failed to send OTP email. Please try again later.');
  }
};

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

module.exports = {
  sendOTPEmail,
  generateOTP
};
