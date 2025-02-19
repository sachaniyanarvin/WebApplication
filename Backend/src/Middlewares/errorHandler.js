const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    
    // Check if error has a status code or use 500 as default
    const statusCode = err.statusCode || 500;
    
    // Error response
    res.status(statusCode).json({
      success: false,
      error: err.message || 'Server Error',
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    });
  };
  
  module.exports = errorHandler;