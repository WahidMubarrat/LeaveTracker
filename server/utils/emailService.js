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

/**
 * Send email notification when employee is requested to be someone's alternate
 * @param {string} alternateEmail - Email of the alternate employee
 * @param {string} alternateName - Name of the alternate employee
 * @param {string} applicantName - Name of the leave applicant
 * @param {Date} startDate - Leave start date
 * @param {Date} endDate - Leave end date
 * @param {string} leaveType - Type of leave
 */
const sendAlternateRequestEmail = async (alternateEmail, alternateName, applicantName, startDate, endDate, leaveType) => {
  try {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const mailOptions = {
      from: `"LeaveTracker System" <${process.env.EMAIL_USER}>`,
      to: alternateEmail,
      subject: 'Alternate Request - LeaveTracker',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #4CAF50 0%, #45a049 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #4CAF50; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-row { margin: 8px 0; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .action-box { background: #e8f5e9; border: 2px solid #4CAF50; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🔔 Alternate Request Notification</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${alternateName}</strong>,</p>
              <p>You have been requested to serve as an alternate employee for a leave application.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Applicant:</span>
                  <span class="value">${applicantName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Leave Type:</span>
                  <span class="value">${leaveType}</span>
                </div>
                <div class="info-row">
                  <span class="label">Leave Period:</span>
                  <span class="value">${formatDate(startDate)} to ${formatDate(endDate)}</span>
                </div>
              </div>
              
              <div class="action-box">
                <p style="margin: 0; font-size: 16px; color: #2e7d32;">
                  <strong>Action Required:</strong> Please log in to the LeaveTracker system to review and respond to this request.
                </p>
              </div>
              
              <p style="margin-top: 20px;">Please review the request at your earliest convenience and respond accordingly.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>LeaveTracker System</strong></p>
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
    console.log('Alternate request email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Alternate request email error:', error);
    throw new Error('Failed to send alternate request email.');
  }
};

/**
 * Send email notification when application is approved or declined
 * @param {string} employeeEmail - Email of the employee
 * @param {string} employeeName - Name of the employee
 * @param {string} status - 'Approved' or 'Declined'
 * @param {Date} startDate - Leave start date
 * @param {Date} endDate - Leave end date
 * @param {string} leaveType - Type of leave
 * @param {string} remarks - Optional remarks from approver
 */
const sendApplicationStatusEmail = async (employeeEmail, employeeName, status, startDate, endDate, leaveType, remarks = '') => {
  try {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const isApproved = status === 'Approved';
    const headerColor = isApproved ? '#4CAF50' : '#f44336';
    const headerGradient = isApproved
      ? 'linear-gradient(135deg, #4CAF50 0%, #45a049 100%)'
      : 'linear-gradient(135deg, #f44336 0%, #e53935 100%)';
    const icon = isApproved ? '✅' : '❌';

    const mailOptions = {
      from: `"LeaveTracker System" <${process.env.EMAIL_USER}>`,
      to: employeeEmail,
      subject: `Leave Application ${status} - LeaveTracker`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: ${headerGradient}; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid ${headerColor}; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-row { margin: 8px 0; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .status-badge { display: inline-block; padding: 8px 16px; border-radius: 20px; font-weight: bold; background: ${headerColor}; color: white; margin: 10px 0; }
            .remarks-box { background: #fff3cd; border-left: 4px solid #ffc107; padding: 12px; margin: 20px 0; border-radius: 4px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>${icon} Leave Application ${status}</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${employeeName}</strong>,</p>
              <p>Your leave application has been <strong>${status.toLowerCase()}</strong>.</p>
              
              <div style="text-align: center;">
                <span class="status-badge">${status.toUpperCase()}</span>
              </div>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Leave Type:</span>
                  <span class="value">${leaveType}</span>
                </div>
                <div class="info-row">
                  <span class="label">Leave Period:</span>
                  <span class="value">${formatDate(startDate)} to ${formatDate(endDate)}</span>
                </div>
              </div>
              
              ${remarks ? `
              <div class="remarks-box">
                <strong>Remarks:</strong>
                <p style="margin: 8px 0 0 0;">${remarks}</p>
              </div>
              ` : ''}
              
              <p style="margin-top: 20px;">
                ${isApproved
          ? 'Your leave has been approved. Please ensure all handover procedures are completed before your leave begins.'
          : 'If you have any questions regarding this decision, please contact your supervisor or HR department.'}
              </p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>LeaveTracker System</strong></p>
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
    console.log('Application status email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('Application status email error:', error);
    throw new Error('Failed to send application status email.');
  }
};

/**
 * Send email notification to HoD when an application comes for review
 * @param {string} hodEmail - Email of the HoD
 * @param {string} hodName - Name of the HoD
 * @param {string} applicantName - Name of the leave applicant
 * @param {string} applicantDesignation - Designation of the applicant
 * @param {Date} startDate - Leave start date
 * @param {Date} endDate - Leave end date
 * @param {string} leaveType - Type of leave
 * @param {number} numberOfDays - Number of leave days
 */
const sendHoDReviewEmail = async (hodEmail, hodName, applicantName, applicantDesignation, startDate, endDate, leaveType, numberOfDays) => {
  try {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const mailOptions = {
      from: `"LeaveTracker System" <${process.env.EMAIL_USER}>`,
      to: hodEmail,
      subject: 'New Leave Application for Review - LeaveTracker',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #2196F3 0%, #1976D2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #2196F3; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-row { margin: 8px 0; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .action-box { background: #e3f2fd; border: 2px solid #2196F3; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 New Leave Application</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${hodName}</strong>,</p>
              <p>A new leave application has been submitted and is pending your review as Head of Department.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Applicant:</span>
                  <span class="value">${applicantName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Designation:</span>
                  <span class="value">${applicantDesignation}</span>
                </div>
                <div class="info-row">
                  <span class="label">Leave Type:</span>
                  <span class="value">${leaveType}</span>
                </div>
                <div class="info-row">
                  <span class="label">Leave Period:</span>
                  <span class="value">${formatDate(startDate)} to ${formatDate(endDate)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Number of Days:</span>
                  <span class="value">${numberOfDays} day(s)</span>
                </div>
              </div>
              
              <div class="action-box">
                <p style="margin: 0; font-size: 16px; color: #1565C0;">
                  <strong>Action Required:</strong> Please log in to the LeaveTracker system to review and approve/decline this application.
                </p>
              </div>
              
              <p style="margin-top: 20px;">Your timely review is appreciated to ensure smooth leave processing.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>LeaveTracker System</strong></p>
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
    console.log('HoD review email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('HoD review email error:', error);
    throw new Error('Failed to send HoD review email.');
  }
};

/**
 * Send email notification to HR when an application comes for review
 * @param {string} hrEmail - Email of the HR
 * @param {string} hrName - Name of the HR
 * @param {string} applicantName - Name of the leave applicant
 * @param {string} applicantDesignation - Designation of the applicant
 * @param {string} departmentName - Department name
 * @param {Date} startDate - Leave start date
 * @param {Date} endDate - Leave end date
 * @param {string} leaveType - Type of leave
 * @param {number} numberOfDays - Number of leave days
 */
const sendHRReviewEmail = async (hrEmail, hrName, applicantName, applicantDesignation, departmentName, startDate, endDate, leaveType, numberOfDays) => {
  try {
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    const mailOptions = {
      from: `"LeaveTracker System" <${process.env.EMAIL_USER}>`,
      to: hrEmail,
      subject: 'New Leave Application for HR Review - LeaveTracker',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .info-box { background: white; border-left: 4px solid #9C27B0; padding: 15px; margin: 20px 0; border-radius: 4px; }
            .info-row { margin: 8px 0; }
            .label { font-weight: bold; color: #555; }
            .value { color: #333; }
            .action-box { background: #f3e5f5; border: 2px solid #9C27B0; border-radius: 8px; padding: 20px; text-align: center; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #888; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Leave Application for HR Review</h1>
            </div>
            <div class="content">
              <p>Hello <strong>${hrName}</strong>,</p>
              <p>A leave application has been approved by the Head of Department and is now pending your review as HR.</p>
              
              <div class="info-box">
                <div class="info-row">
                  <span class="label">Applicant:</span>
                  <span class="value">${applicantName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Designation:</span>
                  <span class="value">${applicantDesignation}</span>
                </div>
                <div class="info-row">
                  <span class="label">Department:</span>
                  <span class="value">${departmentName}</span>
                </div>
                <div class="info-row">
                  <span class="label">Leave Type:</span>
                  <span class="value">${leaveType}</span>
                </div>
                <div class="info-row">
                  <span class="label">Leave Period:</span>
                  <span class="value">${formatDate(startDate)} to ${formatDate(endDate)}</span>
                </div>
                <div class="info-row">
                  <span class="label">Number of Days:</span>
                  <span class="value">${numberOfDays} day(s)</span>
                </div>
              </div>
              
              <div class="action-box">
                <p style="margin: 0; font-size: 16px; color: #6A1B9A;">
                  <strong>Action Required:</strong> Please log in to the LeaveTracker system to review and approve/decline this application.
                </p>
              </div>
              
              <p style="margin-top: 20px;">Your timely review is appreciated to ensure smooth leave processing.</p>
              
              <p style="margin-top: 30px;">Best regards,<br><strong>LeaveTracker System</strong></p>
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
    console.log('HR review email sent:', info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error('HR review email error:', error);
    throw new Error('Failed to send HR review email.');
  }
};

module.exports = {
  sendOTPEmail,
  generateOTP,
  sendAlternateRequestEmail,
  sendApplicationStatusEmail,
  sendHoDReviewEmail,
  sendHRReviewEmail
};
