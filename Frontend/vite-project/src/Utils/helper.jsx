// Format timestamp to readable date/time
export const formatTimestamp = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleString();
  };
  
  // Generate random session ID
  export const generateSessionId = () => {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  };
  
  // Helper function to truncate text
  export const truncateText = (text, maxLength = 50) => {
    if (!text) return '';
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };
  
  // Get notification icon based on type
  export const getNotificationIcon = (type) => {
    switch (type) {
      case 'email':
        return '📧';
      case 'call':
        return '📞';
      case 'sms':
        return '💬';
      default:
        return '📱';
    }
  };