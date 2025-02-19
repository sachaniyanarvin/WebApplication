module.exports = {
    port: process.env.PORT || 5000,
    corsOrigins: ["http://localhost:3000", "exp://192.168.0.1:19000"],
    jwtSecret: process.env.JWT_SECRET
  };