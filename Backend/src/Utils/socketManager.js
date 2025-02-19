let io;

// Map to store socket connections by userId
const userSocketMap = new Map();

// Initialize socket.io
exports.initialize = (socketIo) => {
  io = socketIo;
  
  io.on('connection', (socket) => {
    console.log('New socket connection:', socket.id);
    
    // Handle authentication
    socket.on('authenticate', (data) => {
      if (data && data.userId) {
        // Add to user socket map
        if (!userSocketMap.has(data.userId)) {
          userSocketMap.set(data.userId, new Set());
        }
        userSocketMap.get(data.userId).add(socket.id);
        
        socket.userId = data.userId;
        socket.deviceId = data.deviceId;
        
        console.log(`Socket ${socket.id} authenticated for user ${data.userId}`);
        
        // Join user-specific room
        socket.join(`user:${data.userId}`);
        
        // Acknowledge authentication
        socket.emit('authenticated', { success: true });
      } else {
        socket.emit('authenticated', { 
          success: false,
          message: 'Authentication failed. Missing userId.'
        });
      }
    });
    
    // Handle device status update
    socket.on('device_status', (data) => {
      if (socket.userId && data.deviceId) {
        // Broadcast to all user's devices except sender
        socket.to(`user:${socket.userId}`).emit('device_status_update', {
          deviceId: data.deviceId,
          status: data.status
        });
      }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
      if (socket.userId) {
        // Remove from user socket map
        const userSockets = userSocketMap.get(socket.userId);
        if (userSockets) {
          userSockets.delete(socket.id);
          
          // If no more sockets for this user, remove the entry
          if (userSockets.size === 0) {
            userSocketMap.delete(socket.userId);
          }
        }
        
        console.log(`Socket ${socket.id} disconnected for user ${socket.userId}`);
      }
    });
  });
};

// Broadcast notification to all user's connected devices
exports.broadcastNotification = (userId, data) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification', data);
  }
};

// Notify about session updates
exports.notifySessionUpdate = (userId, data) => {
  if (io) {
    io.to(`user:${userId}`).emit('session_update', data);
  }
};

// Notify about notification updates (read/delete)
exports.notifyNotificationUpdate = (userId, data) => {
  if (io) {
    io.to(`user:${userId}`).emit('notification_update', data);
  }
};

// Get active socket count for user
exports.getUserActiveSocketCount = (userId) => {
  const userSockets = userSocketMap.get(userId);
  return userSockets ? userSockets.size : 0;
};

// Check if user has active sockets
exports.isUserConnected = (userId) => {
  return userSocketMap.has(userId) && userSocketMap.get(userId).size > 0;
};