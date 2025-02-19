const Notification = require('../models/notificationModel');
const socketManager = require('./socketManager');

class NotificationManager {
  static async createNotification(data) {
    try {
      const notification = await Notification.create({
        user: data.userId,
        title: data.title,
        content: data.content,
        type: data.type,
        sourceApp: data.sourceApp,
        sourceDeviceId: data.sourceDeviceId,
        timestamp: Date.now()
      });

      if (socketManager.isUserConnected(data.userId)) {
        socketManager.broadcastNotification(data.userId.toString(), {
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

      return notification;
    } catch (error) {
      throw new Error('Failed to create notification: ' + error.message);
    }
  }

  static async markAsRead(userId, notificationId) {
    try {
      const notification = await Notification.findOneAndUpdate(
        { _id: notificationId, user: userId },
        { isRead: true },
        { new: true }
      );

      if (notification) {
        socketManager.notifyNotificationUpdate(userId.toString(), {
          type: 'notification_read',
          notificationId
        });
      }

      return notification;
    } catch (error) {
      throw new Error('Failed to mark notification as read: ' + error.message);
    }
  }
}

module.exports = NotificationManager;