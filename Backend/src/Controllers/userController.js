const User = require('../models/userModel');
const Device = require('../models/deviceModel');
const Session = require('../models/sessionModel');

// Update user notification settings
exports.updateNotificationSettings = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { email, calls, messages, appNotifications } = req.body;
    
    // Get current user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Update base notification settings
    if (email !== undefined) user.notificationSettings.email = email;
    if (calls !== undefined) user.notificationSettings.calls = calls;
    if (messages !== undefined) user.notificationSettings.messages = messages;
    
    // Update app-specific notification settings
    if (appNotifications && typeof appNotifications === 'object') {
      Object.entries(appNotifications).forEach(([app, enabled]) => {
        user.notificationSettings.appNotifications.set(app, enabled);
      });
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Notification settings updated successfully',
      notificationSettings: user.notificationSettings
    });
  } catch (error) {
    next(error);
  }
};

// Get user devices
exports.getUserDevices = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get all devices for user
    const devices = await Device.find({ user: userId });
    
    // Get active sessions for connected devices
    const activeSessions = await Session.find({
      user: userId,
      isActive: true
    });
    
    // Create a map of connected device IDs
    const connectedDeviceIds = new Set();
    activeSessions.forEach(session => {
      connectedDeviceIds.add(session.mobileDevice.toString());
      connectedDeviceIds.add(session.computerDevice.toString());
    });
    
    // Add connection status to device data
    const devicesWithStatus = devices.map(device => ({
      id: device._id,
      deviceName: device.deviceName,
      deviceType: device.deviceType,
      deviceId: device.deviceId,
      lastActive: device.lastActive,
      isConnected: connectedDeviceIds.has(device._id.toString()) || device.isConnected,
      createdAt: device.createdAt
    }));
    
    res.status(200).json({
      success: true,
      devices: devicesWithStatus
    });
  } catch (error) {
    next(error);
  }
};

// Delete user device
exports.deleteDevice = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { deviceId } = req.params;
    
    // Find device
    const device = await Device.findOne({
      _id: deviceId,
      user: userId
    });
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    // End any active sessions for this device
    await Session.updateMany(
      {
        $or: [
          { mobileDevice: deviceId },
          { computerDevice: deviceId }
        ],
        isActive: true
      },
      { isActive: false }
    );
    
    // Delete the device
    await Device.findByIdAndDelete(deviceId);
    
    res.status(200).json({
      success: true,
      message: 'Device deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get user active sessions
exports.getActiveSessions = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get active sessions with device details
    const sessions = await Session.find({
      user: userId,
      isActive: true
    }).populate('mobileDevice computerDevice', 'deviceName deviceType deviceId lastActive');
    
    res.status(200).json({
      success: true,
      sessions: sessions.map(session => ({
        id: session._id,
        mobileDevice: {
          id: session.mobileDevice._id,
          name: session.mobileDevice.deviceName,
          type: session.mobileDevice.deviceType
        },
        computerDevice: {
          id: session.computerDevice._id,
          name: session.computerDevice.deviceName,
          type: session.computerDevice.deviceType
        },
        createdAt: session.createdAt,
        lastActivity: session.lastActivity
      }))
    });
  } catch (error) {
    next(error);
  }
};

// Update user profile
exports.updateProfile = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { name, email } = req.body;
    
    // Find user
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check if email is taken (if changing email)
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      
      if (emailExists) {
        return res.status(400).json({
          success: false,
          message: 'Email is already in use'
        });
      }
      
      user.email = email;
    }
    
    // Update name if provided
    if (name) {
      user.name = name;
    }
    
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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

// Update device name
exports.updateDeviceName = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { deviceId } = req.params;
    const { deviceName } = req.body;
    
    if (!deviceName || deviceName.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Device name cannot be empty'
      });
    }
    
    // Find and update device
    const device = await Device.findOneAndUpdate(
      { _id: deviceId, user: userId },
      { deviceName },
      { new: true }
    );
    
    if (!device) {
      return res.status(404).json({
        success: false,
        message: 'Device not found'
      });
    }
    
    res.status(200).json({
      success: true,
      device: {
        id: device._id,
        deviceName: device.deviceName,
        deviceType: device.deviceType,
        lastActive: device.lastActive
      }
    });
  } catch (error) {
    next(error);
  }
};

// Change password
exports.changePassword = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;
    
    // Validate inputs
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide current and new password'
      });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'New password must be at least 6 characters long'
      });
    }
    
    // Get user with password
    const user = await User.findById(userId).select('+password');
    
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }
    
    // Check current password
    const isMatch = await user.matchPassword(currentPassword);
    
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    res.status(200).json({
      success: true,
      message: 'Password changed successfully'
    });
  } catch (error) {
    next(error);
  }
};