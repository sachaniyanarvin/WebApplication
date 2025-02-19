const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { v4: uuidv4 } = require('uuid');
const User = require('../models/userModel');
const Device = require('../models/deviceModel');
const Session = require('../models/sessionModel');
const socketManager = require('../utils/socketManager');

// Register user
exports.register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    
    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({
        success: false,
        message: 'User already exists'
      });
    }
    
    // Create new user
    const user = await User.create({
      name,
      email,
      password
    });
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Login user
exports.login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Check if user exists
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid credentials'
      });
    }
    
    // Generate token
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: '30d'
    });
    
    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    next(error);
  }
};

// Generate QR code for pairing
exports.generateQRCode = async (req, res, next) => {
  try {
    const { userId, deviceId, deviceType, deviceName } = req.body;
    
    // Register the device if it doesn't exist
    let device = await Device.findOne({ deviceId });
    if (!device) {
      device = await Device.create({
        user: userId,
        deviceId,
        deviceType,
        deviceName
      });
    }
    
    // Generate unique session ID
    const sessionId = uuidv4();
    
    // Create QR code data
    const qrData = {
      sessionId,
      deviceId,
      userId
    };
    
    // Generate QR code
    const qrCodeImage = await QRCode.toDataURL(JSON.stringify(qrData));
    
    // Create expiration date (15 minutes from now)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
    
    // Store the session (with partial data, will be completed after scanning)
    await Session.create({
      user: userId,
      mobileDevice: device._id,
      computerDevice: null, // Will be filled after scanning
      qrCode: sessionId,
      expiresAt
    });
    
    res.status(200).json({
      success: true,
      qrCode: qrCodeImage,
      sessionId,
      expiresAt
    });
  } catch (error) {
    next(error);
  }
};

// Verify and complete QR code session
exports.verifyQRCode = async (req, res, next) => {
  try {
    const { sessionId, deviceId, deviceType, deviceName } = req.body;
    
    // Find the pending session
    const session = await Session.findOne({ qrCode: sessionId, isActive: true });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Invalid or expired QR code'
      });
    }
    
    // Check if session has expired
    if (session.expiresAt < Date.now()) {
      session.isActive = false;
      await session.save();
      
      return res.status(400).json({
        success: false,
        message: 'QR code has expired'
      });
    }
    
    // Register the scanning device
    let device = await Device.findOne({ deviceId });
    if (!device) {
      device = await Device.create({
        user: session.user,
        deviceId,
        deviceType,
        deviceName
      });
    }
    
    // Update the session with the scanning device
    session.computerDevice = device._id;
    session.isActive = true;
    session.lastActivity = Date.now();
    await session.save();
    
    // Update devices as connected
    await Device.findByIdAndUpdate(session.mobileDevice, { isConnected: true });
    await Device.findByIdAndUpdate(device._id, { isConnected: true });
    
    // Notify connected devices
    socketManager.notifySessionUpdate(session.user.toString(), {
      type: 'connection_established',
      sessionId: session.qrCode,
      connectedDevices: [session.mobileDevice, device._id]
    });
    
    res.status(200).json({
      success: true,
      message: 'Devices paired successfully',
      session: {
        id: session._id,
        user: session.user,
        mobileDevice: session.mobileDevice,
        computerDevice: device._id,
        isActive: session.isActive,
        createdAt: session.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};

// Disconnect/end session
exports.disconnectSession = async (req, res, next) => {
  try {
    const { sessionId, deviceId } = req.body;
    
    // Find the active session
    const session = await Session.findOne({ qrCode: sessionId, isActive: true });
    if (!session) {
      return res.status(404).json({
        success: false,
        message: 'Session not found or already inactive'
      });
    }
    
    // Update session as inactive
    session.isActive = false;
    await session.save();
    
    // Update devices as disconnected
    await Device.findByIdAndUpdate(session.mobileDevice, { isConnected: false });
    await Device.findByIdAndUpdate(session.computerDevice, { isConnected: false });
    
    // Notify connected devices
    socketManager.notifySessionUpdate(session.user.toString(), {
      type: 'connection_terminated',
      sessionId: session.qrCode
    });
    
    res.status(200).json({
      success: true,
      message: 'Devices disconnected successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user profile
exports.getProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        notificationSettings: user.notificationSettings,
        createdAt: user.createdAt
      }
    });
  } catch (error) {
    next(error);
  }
};