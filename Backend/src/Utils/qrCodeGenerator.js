const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');

// Generate QR code with session data
exports.generateSessionQR = async (userId, deviceId) => {
  try {
    // Generate unique session ID
    const sessionId = uuidv4();
    
    // Create QR code data
    const qrData = {
      sessionId,
      deviceId,
      userId,
      timestamp: Date.now()
    };
    
    // Generate QR code as data URL
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
    
    return {
      qrCode: qrCodeImage,
      sessionId,
      expiresAt: new Date(Date.now() + 15 * 60 * 1000) // 15 minutes expiration
    };
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw new Error('Failed to generate QR code');
  }
};

// Generate verification QR for connecting devices
exports.generateVerificationQR = async (sessionData) => {
  try {
    // Create verification data
    const verificationData = {
      type: 'verification',
      sessionId: sessionData.sessionId,
      timestamp: Date.now(),
      expiresAt: sessionData.expiresAt
    };
    
    // Generate QR code as data URL
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(verificationData));
    
    return {
      qrCode: qrCodeImage,
      expiresAt: sessionData.expiresAt
    };
  } catch (error) {
    console.error('Error generating verification QR code:', error);
    throw new Error('Failed to generate verification QR code');
  }
};