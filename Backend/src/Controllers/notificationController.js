const Notification = require('../models/notificationModel');
const User = require('../models/userModel');
const Device = require('../models/deviceModel');
const Session = require('../models/sessionModel');
const socketManager = require('../utils/socketManager');

// Create a new notification
exports.createNotification = async (req, res, next) => {
  try {
    const { title, content, type, sourceApp, sourceDeviceId } = req.body;
    const userId = req.user.id;
    
    // Check if notification settings allow this notification
    const user = await User.findById(userId);
    
    // Check app-specific notifications
    if (type === 'app' && sourceApp && 
        user.notificationSettings.appNotifications.has(sourceApp) && 
        !user.notificationSettings.appNotifications.get(sourceApp)) {
      return res.status(200).json({
        success: true,
        message: 'Notification blocked by user settings',
        delivered: false
      });
    }
    
    // Check by notification type
    if ((type === 'email' && !user.notificationSettings.email) ||
        (type === 'call' && !user.notificationSettings.calls) ||
        (type === 'message' && !user.notificationSettings.messages)) {
      return res.status(200).json({
        success: true,
        message: 'Notification blocked by user settings',
        delivered: false
      });
    }
    
    // Create notification
    const notification = await Notification.create({
      user: userId,
      title,
      content,
      type,
      sourceApp,
      sourceDeviceId,
      timestamp: Date.now()
    });
    
    // Find active sessions to forward notification
    const activeSessions = await Session.find({ 
      user: userId,
      isActive: true
    });
    
    // Broadcast notification to all connected devices in active sessions
    if (activeSessions.length > 0) {
      socketManager.broadcastNotification(userId.toString(), {
        notification: {
          id: notification._id,
          title: notification.title,
          content: notification.content,
          type: notification.type,
          sourceApp: notification.sourceApp,
          sourceDeviceId: notification.sourceDeviceId,
          timestamp: notification.timestamp
        }
      });
    }
    
    res.status(201).json({
      success: true,
      notification,
      delivered: activeSessions.length > 0
    });
  } catch (error) {
    next(error);
  }
};

// Get notifications for user
exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { limit = 20, skip = 0, type, isRead } = req.query;
    
    // Build query
    const query = { user: userId };
    
    if (type) query.type = type;
    if (isRead !== undefined) query.isRead = isRead === 'true';
    
    // Get notifications
    const notifications = await Notification.find(query)
      .sort({ timestamp: -1 })
      .skip(parseInt(skip))
      .limit(parseInt(limit));
    
    // Get total count
    const total = await Notification.countDocuments(query);
    
    res.status(200).json({
      success: true,
      count: notifications.length,
      total,
      notifications
    });
  } catch (error) {
    next(error);
  }
};

// Mark notification as read
exports.markAsRead = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Find and update notification
    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, user: userId },
      { isRead: true },
      { new: true }
    );
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Notify other connected devices
    socketManager.notifyNotificationUpdate(userId.toString(), {
      type: 'notification_read',
      notificationId
    });
    
    res.status(200).json({
      success: true,
      notification
    });
  } catch (error) {
    next(error);
  }
};

// Mark all notifications as read
exports.markAllAsRead = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { type } = req.query;
    
    // Build query
    const query = { user: userId, isRead: false };
    if (type) query.type = type;
    
    // Update notifications
    const result = await Notification.updateMany(query, { isRead: true });
    
    // Notify other connected devices
    socketManager.notifyNotificationUpdate(userId.toString(), {
      type: 'all_notifications_read',
      notificationType: type || 'all'
    });
    
    res.status(200).json({
      success: true,
      count: result.modifiedCount,
      message: `Marked ${result.modifiedCount} notifications as read`
    });
  } catch (error) {
    next(error);
  }
};

// Delete notification
exports.deleteNotification = async (req, res, next) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;
    
    // Find and delete notification
    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      user: userId
    });
    
    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found'
      });
    }
    
    // Notify other connected devices
    socketManager.notifyNotificationUpdate(userId.toString(), {
      type: 'notification_deleted',
      notificationId
    });
    
    res.status(200).json({
      success: true,
      message: 'Notification deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

// Get notification statistics
exports.getNotificationStats = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Get notification counts by type
    const stats = await Notification.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      { 
        $group: {
          _id: { type: '$type', isRead: '$isRead' },
          count: { $sum: 1 }
        }
      },
      {
        $group: {
          _id: '$_id.type',
          read: {
            $sum: { $cond: [{ $eq: ['$_id.isRead', true] }, '$count', 0] }
          },
          unread: {
            $sum: { $cond: [{ $eq: ['$_id.isRead', false] }, '$count', 0] }
          },
          total: { $sum: '$count' }
        }
      }
    ]);
    
    // Format into more usable structure
    const formattedStats = {};
    stats.forEach(stat => {
      formattedStats[stat._id] = {
        read: stat.read,
        unread: stat.unread,
        total: stat.total
      };
    });
    
    // Get total counts
    const totalStats = await Notification.aggregate([
      { $match: { user: mongoose.Types.ObjectId(userId) } },
      {
        $group: {
          _id: '$isRead',
          count: { $sum: 1 }
        }
      }
    ]);
    
    const totals = {
      read: totalStats.find(s => s._id === true)?.count || 0,
      unread: totalStats.find(s => s._id === false)?.count || 0,
      total: totalStats.reduce((acc, curr) => acc + curr.count, 0)
    };
    
    res.status(200).json({
      success: true,
      byType: formattedStats,
      totals
    });
  } catch (error) {
    next(error);
  }
};