const nodemailer = require('nodemailer');
const logger = require('./logger');

// Create transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Send email function
const sendEmail = async (options) => {
  try {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
      logger.info('Email notifications are disabled');
      return { success: true, message: 'Email notifications disabled' };
    }

    const transporter = createTransporter();

    const mailOptions = {
      from: process.env.EMAIL_FROM || process.env.SMTP_USER,
      to: options.email,
      subject: options.subject,
      text: options.message,
      html: options.html || options.message
    };

    // Add attachments if provided
    if (options.attachments) {
      mailOptions.attachments = options.attachments;
    }

    const info = await transporter.sendMail(mailOptions);

    logger.info(`Email sent successfully to ${options.email}: ${info.messageId}`);

    return {
      success: true,
      messageId: info.messageId,
      message: 'Email sent successfully'
    };

  } catch (error) {
    logger.error('Email sending failed:', error);
    throw new Error(`Email sending failed: ${error.message}`);
  }
};

// Send bulk emails
const sendBulkEmail = async (emails, options) => {
  try {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
      logger.info('Email notifications are disabled');
      return { success: true, message: 'Email notifications disabled' };
    }

    const transporter = createTransporter();
    const results = [];

    for (const email of emails) {
      try {
        const mailOptions = {
          from: process.env.EMAIL_FROM || process.env.SMTP_USER,
          to: email,
          subject: options.subject,
          text: options.message,
          html: options.html || options.message
        };

        if (options.attachments) {
          mailOptions.attachments = options.attachments;
        }

        const info = await transporter.sendMail(mailOptions);
        results.push({
          email,
          success: true,
          messageId: info.messageId
        });

        logger.info(`Bulk email sent successfully to ${email}: ${info.messageId}`);

      } catch (error) {
        logger.error(`Bulk email failed for ${email}:`, error);
        results.push({
          email,
          success: false,
          error: error.message
        });
      }
    }

    return {
      success: true,
      results,
      total: emails.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

  } catch (error) {
    logger.error('Bulk email sending failed:', error);
    throw new Error(`Bulk email sending failed: ${error.message}`);
  }
};

// Send email with template
const sendTemplatedEmail = async (email, template, data) => {
  try {
    if (process.env.ENABLE_EMAIL_NOTIFICATIONS !== 'true') {
      logger.info('Email notifications are disabled');
      return { success: true, message: 'Email notifications disabled' };
    }

    // Simple template replacement
    let html = template.html;
    let text = template.text;

    // Replace placeholders with actual data
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      html = html.replace(regex, data[key]);
      text = text.replace(regex, data[key]);
    });

    const options = {
      email,
      subject: template.subject,
      message: text,
      html
    };

    return await sendEmail(options);

  } catch (error) {
    logger.error('Templated email sending failed:', error);
    throw new Error(`Templated email sending failed: ${error.message}`);
  }
};

// Verify email configuration
const verifyEmailConfig = async () => {
  try {
    const transporter = createTransporter();
    await transporter.verify();
    logger.info('Email configuration verified successfully');
    return { success: true, message: 'Email configuration verified' };
  } catch (error) {
    logger.error('Email configuration verification failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendEmail,
  sendBulkEmail,
  sendTemplatedEmail,
  verifyEmailConfig
};
