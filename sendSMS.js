const twilio = require('twilio');
const logger = require('./logger');

// Initialize Twilio client
const getTwilioClient = () => {
  if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
    throw new Error('Twilio credentials not configured');
  }

  return twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
};

// Send SMS function
const sendSMS = async (options) => {
  try {
    if (process.env.ENABLE_SMS_NOTIFICATIONS !== 'true') {
      logger.info('SMS notifications are disabled');
      return { success: true, message: 'SMS notifications disabled' };
    }

    const client = getTwilioClient();

    const message = await client.messages.create({
      body: options.message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: options.phone
    });

    logger.info(`SMS sent successfully to ${options.phone}: ${message.sid}`);

    return {
      success: true,
      messageId: message.sid,
      message: 'SMS sent successfully',
      status: message.status,
      price: message.price,
      priceUnit: message.priceUnit
    };

  } catch (error) {
    logger.error('SMS sending failed:', error);
    throw new Error(`SMS sending failed: ${error.message}`);
  }
};

// Send bulk SMS
const sendBulkSMS = async (phones, options) => {
  try {
    if (process.env.ENABLE_SMS_NOTIFICATIONS !== 'true') {
      logger.info('SMS notifications are disabled');
      return { success: true, message: 'SMS notifications disabled' };
    }

    const client = getTwilioClient();
    const results = [];

    for (const phone of phones) {
      try {
        const message = await client.messages.create({
          body: options.message,
          from: process.env.TWILIO_PHONE_NUMBER,
          to: phone
        });

        results.push({
          phone,
          success: true,
          messageId: message.sid,
          status: message.status
        });

        logger.info(`Bulk SMS sent successfully to ${phone}: ${message.sid}`);

      } catch (error) {
        logger.error(`Bulk SMS failed for ${phone}:`, error);
        results.push({
          phone,
          success: false,
          error: error.message
        });
      }
    }

    return {
      success: true,
      results,
      total: phones.length,
      successful: results.filter(r => r.success).length,
      failed: results.filter(r => !r.success).length
    };

  } catch (error) {
    logger.error('Bulk SMS sending failed:', error);
    throw new Error(`Bulk SMS sending failed: ${error.message}`);
  }
};

// Send SMS with template
const sendTemplatedSMS = async (phone, template, data) => {
  try {
    if (process.env.ENABLE_SMS_NOTIFICATIONS !== 'true') {
      logger.info('SMS notifications are disabled');
      return { success: true, message: 'SMS notifications disabled' };
    }

    // Simple template replacement
    let message = template.message;

    // Replace placeholders with actual data
    Object.keys(data).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      message = message.replace(regex, data[key]);
    });

    const options = {
      phone,
      message
    };

    return await sendSMS(options);

  } catch (error) {
    logger.error('Templated SMS sending failed:', error);
    throw new Error(`Templated SMS sending failed: ${error.message}`);
  }
};

// Verify phone number
const verifyPhoneNumber = async (phoneNumber) => {
  try {
    if (process.env.ENABLE_SMS_NOTIFICATIONS !== 'true') {
      logger.info('SMS notifications are disabled');
      return { success: true, message: 'SMS notifications disabled' };
    }

    const client = getTwilioClient();

    const verification = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: phoneNumber,
        channel: 'sms'
      });

    logger.info(`Phone verification initiated for ${phoneNumber}: ${verification.sid}`);

    return {
      success: true,
      verificationId: verification.sid,
      status: verification.status,
      message: 'Verification code sent'
    };

  } catch (error) {
    logger.error('Phone verification failed:', error);
    throw new Error(`Phone verification failed: ${error.message}`);
  }
};

// Check verification code
const checkVerificationCode = async (phoneNumber, code) => {
  try {
    if (process.env.ENABLE_SMS_NOTIFICATIONS !== 'true') {
      logger.info('SMS notifications are disabled');
      return { success: true, message: 'SMS notifications disabled' };
    }

    const client = getTwilioClient();

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: phoneNumber,
        code: code
      });

    logger.info(`Verification check completed for ${phoneNumber}: ${verificationCheck.status}`);

    return {
      success: true,
      verificationId: verificationCheck.sid,
      status: verificationCheck.status,
      valid: verificationCheck.status === 'approved'
    };

  } catch (error) {
    logger.error('Verification code check failed:', error);
    throw new Error(`Verification code check failed: ${error.message}`);
  }
};

// Get SMS logs
const getSMSLogs = async (options = {}) => {
  try {
    const client = getTwilioClient();

    const messages = await client.messages.list({
      limit: options.limit || 20,
      pageSize: options.pageSize || 20,
      dateSent: options.dateSent,
      from: options.from,
      to: options.to
    });

    return {
      success: true,
      messages: messages.map(msg => ({
        sid: msg.sid,
        from: msg.from,
        to: msg.to,
        body: msg.body,
        status: msg.status,
        dateSent: msg.dateSent,
        price: msg.price,
        priceUnit: msg.priceUnit
      }))
    };

  } catch (error) {
    logger.error('SMS logs retrieval failed:', error);
    throw new Error(`SMS logs retrieval failed: ${error.message}`);
  }
};

// Verify SMS configuration
const verifySMSConfig = async () => {
  try {
    if (!process.env.TWILIO_ACCOUNT_SID || !process.env.TWILIO_AUTH_TOKEN) {
      return { success: false, error: 'Twilio credentials not configured' };
    }

    const client = getTwilioClient();
    
    // Try to get account info to verify credentials
    const account = await client.api.accounts(process.env.TWILIO_ACCOUNT_SID).fetch();
    
    logger.info('SMS configuration verified successfully');
    return { 
      success: true, 
      message: 'SMS configuration verified',
      accountSid: account.sid,
      accountName: account.friendlyName,
      status: account.status
    };
  } catch (error) {
    logger.error('SMS configuration verification failed:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  sendSMS,
  sendBulkSMS,
  sendTemplatedSMS,
  verifyPhoneNumber,
  checkVerificationCode,
  getSMSLogs,
  verifySMSConfig
};
